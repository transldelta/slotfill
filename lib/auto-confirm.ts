/**
 * lib/auto-confirm.ts – Automatische Terminbestätigung
 *
 * Führt alle nötigen Prüfungen durch und bestätigt die Buchung sofort,
 * wenn alle Bedingungen erfüllt sind.
 *
 * Sicherheitsregeln (nicht verhandelbar):
 * - Auto-Confirm NUR wenn practices.auto_confirm_bookings = true
 * - Auto-Confirm NUR mit konkretem Slot (requested_date + requested_time)
 * - Auto-Confirm NUR wenn Patient eine E-Mail-Adresse hat
 * - Slot muss exakt in booking_availability_rules existieren (kein freier Text)
 * - Kein Konflikt mit bestehenden bestätigten Buchungen desselben Slots
 * - Keine booking_blocked_times für den Zeitraum
 * - Bestätigung: status='confirmed', confirmation_mode='auto', auto_confirmed=true
 * - E-Mail nach Auto-Confirm: email_status + email_sent_at werden in DB gespeichert
 * - Bei E-Mail-Fehler: Buchung bleibt confirmed (kein Rollback), email_status='send_failed'
 *
 * Audit-Actions:
 *   booking_auto_confirmed_email_sent
 *   booking_auto_confirmed_email_skipped
 *   booking_auto_confirmed_email_failed
 *   booking_auto_confirm_skipped  (mit reason in metadata)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { generateTimeSlotsForRule } from "@/lib/booking-slots";
import { sendBookingEmail } from "@/lib/booking-email";
import type { BookingEmailData } from "@/lib/booking-email";
import { writeAuditLog } from "@/lib/audit-log";

// ─── Typen ─────────────────────────────────────────────────────────────────

export type AutoConfirmSkipReason =
  | "auto_confirm_disabled"  // practices.auto_confirm_bookings = false
  | "no_slot_data"           // requested_date oder requested_time fehlen
  | "no_patient_email"       // Patient hat keine E-Mail-Adresse
  | "no_practice"            // Praxis nicht auflösbar
  | "slot_not_in_rules"      // Slot liegt nicht in Öffnungszeiten
  | "slot_conflict"          // Slot bereits von anderer bestätigter Buchung belegt
  | "blocked_time"           // Slot liegt in einer gesperrten Zeit
  | "db_error";              // Datenbankfehler

export type AutoConfirmResult =
  | { confirmed: false; reason: AutoConfirmSkipReason }
  | { confirmed: true; emailStatus: string; emailCode: string };

// ─── Praxis-Auflösung (intern) ─────────────────────────────────────────────

async function resolvePractice(
  supabase: SupabaseClient,
  tenantId: string | null,
): Promise<string | null> {
  if (tenantId) return tenantId;

  // Fallback 1: aktive Praxis per Abo
  const { data: activeSub } = await supabase
    .from("subscriptions")
    .select("practice_id")
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  const fromSub = (activeSub as { practice_id?: string } | null)?.practice_id;
  if (fromSub) return fromSub;

  // Fallback 2: erste vorhandene Praxis
  const { data: first } = await supabase
    .from("practices")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return (first as { id?: string } | null)?.id ?? null;
}

// ─── Haupt-Funktion ────────────────────────────────────────────────────────

/**
 * Prüft ob eine Buchungsanfrage automatisch bestätigt werden kann,
 * führt die Bestätigung durch und sendet die Bestätigungs-E-Mail.
 *
 * Wird ausschließlich serverseitig nach erfolgreichem INSERT aufgerufen.
 * Der übergebene `supabase`-Client muss Service-Role-Rechte haben.
 *
 * @param bookingId  UUID der frisch gespeicherten Buchungsanfrage
 * @param supabase   Service-Role Supabase Client
 */
export async function evaluateAutoConfirm(
  bookingId: string,
  supabase: SupabaseClient,
): Promise<AutoConfirmResult> {
  // ── 1. Buchungsdaten laden ────────────────────────────────────────────
  const { data: booking, error: bookingError } = await supabase
    .from("booking_requests")
    .select(
      "id, tenant_id, patient_name, patient_email, preferred_time, note, " +
        "requested_date, requested_time, status",
    )
    .eq("id", bookingId)
    .single();

  if (bookingError || !booking) {
    return { confirmed: false, reason: "db_error" };
  }

  const b = booking as unknown as {
    id: string;
    tenant_id: string | null;
    patient_name: string;
    patient_email: string | null;
    preferred_time: string;
    note: string | null;
    requested_date: string | null;
    requested_time: string | null;
    status: string;
  };

  // ── 2. Pflicht: konkreter Slot vorhanden ──────────────────────────────
  if (!b.requested_date || !b.requested_time) {
    return { confirmed: false, reason: "no_slot_data" };
  }

  // ── 3. Pflicht: Patienten-E-Mail vorhanden ────────────────────────────
  if (!b.patient_email?.trim()) {
    return { confirmed: false, reason: "no_patient_email" };
  }

  // ── 4. Praxis-ID auflösen ─────────────────────────────────────────────
  const practiceId = await resolvePractice(supabase, b.tenant_id);
  if (!practiceId) {
    return { confirmed: false, reason: "no_practice" };
  }

  // Wenn tenant_id noch nicht gesetzt war: nachträglich ergänzen
  if (!b.tenant_id) {
    await supabase
      .from("booking_requests")
      .update({ tenant_id: practiceId, updated_at: new Date().toISOString() })
      .eq("id", bookingId);
  }

  // ── 5. Auto-Confirm Feature-Flag prüfen ───────────────────────────────
  const { data: practice } = await supabase
    .from("practices")
    .select("auto_confirm_bookings")
    .eq("id", practiceId)
    .maybeSingle();

  const autoConfirmEnabled =
    (practice as { auto_confirm_bookings?: boolean } | null)
      ?.auto_confirm_bookings === true;

  if (!autoConfirmEnabled) {
    return { confirmed: false, reason: "auto_confirm_disabled" };
  }

  // ── 6. Slot in Verfügbarkeitsregeln prüfen ────────────────────────────
  // ISO-Wochentag: 1 = Montag … 7 = Sonntag
  const requestedDate = new Date(b.requested_date + "T00:00:00");
  const jsDay = requestedDate.getDay();
  const weekday = jsDay === 0 ? 7 : jsDay;

  const { data: rules } = await supabase
    .from("booking_availability_rules")
    .select("start_time, end_time, slot_minutes, buffer_minutes")
    .eq("practice_id", practiceId)
    .eq("weekday", weekday)
    .eq("is_active", true);

  const slotIsValid =
    (
      rules as Array<{
        start_time: string;
        end_time: string;
        slot_minutes: number;
        buffer_minutes: number;
      }> | null
    )?.some((rule) => {
      const validTimes = generateTimeSlotsForRule(
        rule.start_time,
        rule.end_time,
        rule.slot_minutes,
        rule.buffer_minutes,
      );
      return validTimes.includes(b.requested_time!);
    }) ?? false;

  if (!slotIsValid) {
    await writeAuditLog({
      action: "booking_auto_confirm_skipped",
      area: "booking",
      status: "blocked",
      actorEmail: null,
      practiceId,
      metadata: { booking_id: bookingId, reason: "slot_not_in_rules" },
    });
    return { confirmed: false, reason: "slot_not_in_rules" };
  }

  // ── 7. Konflikt mit bestehenden bestätigten Buchungen prüfen ──────────
  // Prüft: gleiche Praxis, gleiches Datum, gleiche Uhrzeit, Status confirmed
  const { data: conflicts } = await supabase
    .from("booking_requests")
    .select("id")
    .eq("tenant_id", practiceId)
    .eq("requested_date", b.requested_date)
    .eq("requested_time", b.requested_time)
    .eq("status", "confirmed")
    .neq("id", bookingId);

  if ((conflicts as unknown[] | null)?.length) {
    await writeAuditLog({
      action: "booking_auto_confirm_skipped",
      area: "booking",
      status: "blocked",
      actorEmail: null,
      practiceId,
      metadata: {
        booking_id: bookingId,
        reason: "slot_conflict",
        conflict_count: (conflicts as unknown[]).length,
      },
    });
    return { confirmed: false, reason: "slot_conflict" };
  }

  // ── 8. Gesperrte Zeiten prüfen ────────────────────────────────────────
  const { data: blocked } = await supabase
    .from("booking_blocked_times")
    .select("blocked_date, start_time, end_time")
    .eq("practice_id", practiceId)
    .eq("blocked_date", b.requested_date);

  const isBlocked =
    (
      blocked as Array<{
        blocked_date: string;
        start_time: string | null;
        end_time: string | null;
      }> | null
    )?.some((bl) => {
      if (!bl.start_time) return true; // ganzer Tag gesperrt
      if (bl.start_time && bl.end_time) {
        return (
          b.requested_time! >= bl.start_time &&
          b.requested_time! < bl.end_time
        );
      }
      return false;
    }) ?? false;

  if (isBlocked) {
    await writeAuditLog({
      action: "booking_auto_confirm_skipped",
      area: "booking",
      status: "blocked",
      actorEmail: null,
      practiceId,
      metadata: { booking_id: bookingId, reason: "blocked_time" },
    });
    return { confirmed: false, reason: "blocked_time" };
  }

  // ── Alle Checks bestanden: Buchung automatisch bestätigen ─────────────
  const now = new Date().toISOString();

  const { error: confirmError } = await supabase
    .from("booking_requests")
    .update({
      status: "confirmed",
      confirmation_mode: "auto",
      auto_confirmed: true,
      confirmed_date: b.requested_date,
      confirmed_time: b.requested_time,
      updated_at: now,
    })
    .eq("id", bookingId);

  if (confirmError) {
    return { confirmed: false, reason: "db_error" };
  }

  // ── Bestätigungs-E-Mail senden ────────────────────────────────────────
  const emailData: BookingEmailData = {
    id: bookingId,
    patient_name: b.patient_name,
    patient_email: b.patient_email,
    preferred_time: b.preferred_time,
    note: b.note,
    tenant_id: practiceId,
    confirmed_date: b.requested_date,
    confirmed_time: b.requested_time,
  };

  const emailResult = await sendBookingEmail(emailData, "confirmation", null);
  const emailSent = emailResult.status === "sent";

  // E-Mail-Status in DB speichern (nie crashen wenn das fehlschlägt)
  try {
    await supabase
      .from("booking_requests")
      .update({
        email_status: emailResult.status,
        ...(emailSent ? { email_sent_at: now } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);
  } catch {
    /* E-Mail-Status-Update darf Buchung nicht rückgängig machen */
  }

  // Audit-Log schreiben
  await writeAuditLog({
    action: emailSent
      ? "booking_auto_confirmed_email_sent"
      : emailResult.status === "send_failed"
        ? "booking_auto_confirmed_email_failed"
        : "booking_auto_confirmed_email_skipped",
    area: "booking",
    status: emailSent ? "success" : emailResult.status === "send_failed" ? "failed" : "success",
    actorEmail: null,
    practiceId,
    metadata: {
      booking_id: bookingId,
      confirmed_date: b.requested_date,
      confirmed_time: b.requested_time,
      email_status: emailResult.status,
      email_code: emailResult.code,
    },
  });

  return {
    confirmed: true,
    emailStatus: emailResult.status,
    emailCode: emailResult.code,
  };
}
