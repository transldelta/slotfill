"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase";
import { buildBookingRecord, validateBookingSubmission } from "@/lib/booking-requests";
import { evaluateAutoConfirm } from "@/lib/booking-slots";
import { sendBookingEmail } from "@/lib/booking-email";
import { writeAuditLog } from "@/lib/audit-log";

const schema = z.object({
  patient_name: z.string().trim().min(1).max(100),
  patient_email: z.string().trim().email(),
  patient_phone: z.string().trim().max(30).optional(),
  preferred_time: z.string().trim().min(1).max(200),
  note: z.string().trim().max(1000).optional(),
  privacy_accepted: z.coerce.boolean(),
  tenant_id: z.string().uuid().optional(),
  // Optionale Wunsch-Slot-Angaben (wenn Praxis Verfügbarkeit pflegt)
  requested_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  requested_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
});

export type SubmitBookingResult =
  | { code: "BOOKING_SAVED"; bookingId: string; autoConfirmed: false }
  | {
      code: "BOOKING_SAVED_AUTO_CONFIRMED";
      bookingId: string;
      autoConfirmed: true;
      confirmedDate: string;
      confirmedTime: string;
    }
  | { code: "BOOKING_ERROR"; message: string }
  | { code: "PRIVACY_NOT_ACCEPTED" }
  | { code: "VALIDATION_ERROR"; message: string };

/**
 * Verarbeitet eine Terminanfrage.
 *
 * Sicherheitsregeln:
 * - privacy_accepted = true ist Pflicht
 * - auto_confirmed = false per Default
 * - Status = pending_confirmation (nicht automatisch confirmed)
 * - Auto-Confirm NUR wenn practice.auto_confirm_bookings=true + Slot verfügbar
 * - Keine echten Nachrichten ohne Provider
 * - Jede automatische Entscheidung in audit_logs
 */
export async function submitBookingRequest(
  formData: FormData,
): Promise<SubmitBookingResult> {
  const parsed = schema.safeParse({
    patient_name: formData.get("patient_name"),
    patient_email: formData.get("patient_email"),
    patient_phone: formData.get("patient_phone") || undefined,
    preferred_time: formData.get("preferred_time"),
    note: formData.get("note") || undefined,
    privacy_accepted: formData.get("privacy_accepted") === "true",
    tenant_id: formData.get("tenant_id") || undefined,
    requested_date: formData.get("requested_date") || undefined,
    requested_time: formData.get("requested_time") || undefined,
  });

  if (!parsed.success) {
    return { code: "VALIDATION_ERROR", message: "Ungültige Eingabe." };
  }

  const {
    patient_name,
    patient_email,
    patient_phone,
    preferred_time,
    note,
    privacy_accepted,
    tenant_id,
    requested_date,
    requested_time,
  } = parsed.data;

  // Datenschutz-Pflicht
  if (!privacy_accepted) {
    return { code: "PRIVACY_NOT_ACCEPTED" };
  }

  const validationError = validateBookingSubmission({
    patient_name,
    patient_email,
    patient_phone,
    preferred_time,
    note,
    privacy_accepted,
  });
  if (validationError) {
    return { code: "VALIDATION_ERROR", message: validationError };
  }

  const record = buildBookingRecord({
    patient_name,
    patient_email,
    patient_phone,
    preferred_time,
    note,
    privacy_accepted,
    tenant_id,
    requested_date,
    requested_time,
  });

  const supabase = createClient();

  // Buchung zuerst als pending_confirmation speichern
  const { data: saved, error } = await supabase
    .from("booking_requests")
    .insert(record)
    .select("id")
    .single();

  if (error || !saved) {
    console.error("[booking] insert error:", error?.message);
    return {
      code: "BOOKING_ERROR",
      message: "Terminanfrage konnte nicht gespeichert werden.",
    };
  }

  // ─── Auto-Confirm-Prüfung ────────────────────────────────────────────
  // Nur wenn Praxis-ID vorhanden UND Wunsch-Datum+Zeit angegeben sind.
  if (tenant_id && requested_date && requested_time) {
    const autoResult = await evaluateAutoConfirm(
      supabase,
      tenant_id,
      requested_date,
      requested_time,
      patient_email,
    );

    // Jede automatische Entscheidung in audit_logs (kein Secret, keine vollständige E-Mail)
    await writeAuditLog({
      action: autoResult.reason,
      area: "booking",
      status: autoResult.confirmed ? "success" : "blocked",
      practiceId: tenant_id,
      metadata: {
        booking_id: saved.id,
        requested_date,
        requested_time,
        patient_email_domain: patient_email.split("@")[1] ?? "unknown",
      },
    });

    if (autoResult.confirmed) {
      // Status auf confirmed setzen + confirmed_date/time eintragen
      await supabase
        .from("booking_requests")
        .update({
          status: "confirmed",
          auto_confirmed: true,
          confirmation_mode: "auto",
          confirmed_date: autoResult.confirmedDate,
          confirmed_time: autoResult.confirmedTime,
          updated_at: new Date().toISOString(),
        })
        .eq("id", saved.id);

      // Automatische Bestätigungs-E-Mail
      const emailResult = await sendBookingEmail(
        {
          id: saved.id,
          patient_name,
          patient_email,
          preferred_time,
          note: note ?? null,
          tenant_id,
          confirmed_date: autoResult.confirmedDate,
          confirmed_time: autoResult.confirmedTime,
        },
        "confirmation",
        null, // kein Actor – automatisch
      );

      // E-Mail-Status in DB
      await supabase
        .from("booking_requests")
        .update({
          email_status: emailResult.status,
          email_sent_at:
            emailResult.status === "sent" ? new Date().toISOString() : null,
        })
        .eq("id", saved.id);

      return {
        code: "BOOKING_SAVED_AUTO_CONFIRMED",
        bookingId: saved.id,
        autoConfirmed: true,
        confirmedDate: autoResult.confirmedDate!,
        confirmedTime: autoResult.confirmedTime!,
      };
    }
  }

  // Kein Auto-Confirm: pending bleibt, Patient wird manuell informiert
  return { code: "BOOKING_SAVED", bookingId: saved.id, autoConfirmed: false };
}
