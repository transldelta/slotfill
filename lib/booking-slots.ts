/**
 * lib/booking-slots.ts – Slot-Verfügbarkeit und Auto-Confirm-Logik
 *
 * Sicherheitsregeln (nicht verhandelbar):
 * - Auto-Confirm NUR wenn practice.auto_confirm_bookings === true
 * - Auto-Confirm NUR wenn Slot laut booking_availability_rules verfügbar ist
 * - Auto-Confirm NIE wenn blocked_times den Slot sperren
 * - Auto-Confirm NIE wenn bestehende confirmed Buchung im selben Slot existiert
 * - Jede automatische Entscheidung → audit_log
 * - Keine SMS/WhatsApp in diesem Modul
 *
 * Audit-Actions:
 *   auto_confirm_success
 *   auto_confirm_skipped_no_config
 *   auto_confirm_skipped_slot_unavailable
 *   auto_confirm_skipped_no_email
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// ─── Typen ─────────────────────────────────────────────────────────────────

export interface AvailabilityRule {
  id: string;
  practice_id: string;
  weekday: number; // 1=Mo … 7=So (ISO 8601)
  start_time: string; // "HH:MM:SS"
  end_time: string;   // "HH:MM:SS"
  slot_minutes: number;
  buffer_minutes: number;
  is_active: boolean;
}

export interface BlockedTime {
  id: string;
  practice_id: string;
  blocked_date: string;   // "YYYY-MM-DD"
  start_time: string | null; // null = ganzer Tag
  end_time: string | null;
  reason: string | null;
}

export type SlotCheckReason =
  | "available"
  | "no_availability_rules"
  | "weekday_not_available"
  | "time_outside_window"
  | "blocked_by_blocked_times"
  | "slot_already_taken";

export interface SlotCheckResult {
  available: boolean;
  reason: SlotCheckReason;
}

export type AutoConfirmReason =
  | "auto_confirm_success"
  | "auto_confirm_skipped_no_config"
  | "auto_confirm_skipped_slot_unavailable"
  | "auto_confirm_skipped_no_email"
  | "auto_confirm_skipped_no_date";

export interface AutoConfirmResult {
  confirmed: boolean;
  reason: AutoConfirmReason;
  confirmedDate?: string;
  confirmedTime?: string;
}

// ─── Wochentag-Umrechnung ─────────────────────────────────────────────────

/**
 * Konvertiert ein Date-Objekt in ISO-Wochentag (1=Mo … 7=So).
 * JavaScript getDay(): 0=So, 1=Mo, ..., 6=Sa
 */
export function dateToIsoWeekday(date: Date): number {
  const d = date.getDay();
  return d === 0 ? 7 : d; // Sonntag: JS=0 → ISO=7
}

/**
 * Parst "HH:MM" oder "HH:MM:SS" zu Minuten seit Mitternacht.
 */
export function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

// ─── Slot-Verfügbarkeit prüfen ────────────────────────────────────────────

/**
 * Prüft ob ein bestimmter Slot für eine Praxis verfügbar ist.
 *
 * Ablauf:
 * 1. Verfügbarkeitsregeln für den Wochentag laden
 * 2. Geblockte Zeiten für das Datum laden
 * 3. Bestehende confirmed-Buchungen im Slot prüfen
 *
 * @param supabase  Service-Role-Client (umgeht RLS)
 * @param practiceId  UUID der Praxis
 * @param date  "YYYY-MM-DD"
 * @param time  "HH:MM"
 */
export async function checkSlotAvailability(
  supabase: SupabaseClient,
  practiceId: string,
  date: string,
  time: string,
): Promise<SlotCheckResult> {
  const targetDate = new Date(date + "T00:00:00");
  const weekday = dateToIsoWeekday(targetDate);
  const slotMinutes = timeToMinutes(time);

  // 1. Verfügbarkeitsregeln für diesen Wochentag laden
  const { data: rules } = await supabase
    .from("booking_availability_rules")
    .select("*")
    .eq("practice_id", practiceId)
    .eq("weekday", weekday)
    .eq("is_active", true);

  if (!rules || rules.length === 0) {
    return { available: false, reason: "no_availability_rules" };
  }

  // 2. Liegt die Zeit in einem der Verfügbarkeits-Fenster?
  const fitsWindow = rules.some((rule: AvailabilityRule) => {
    const windowStart = timeToMinutes(rule.start_time);
    const windowEnd = timeToMinutes(rule.end_time);
    // Slot muss innerhalb des Fensters beginnen UND
    // noch mindestens slot_minutes vor Fenster-Ende enden
    return (
      slotMinutes >= windowStart &&
      slotMinutes + rule.slot_minutes <= windowEnd
    );
  });

  if (!fitsWindow) {
    return { available: false, reason: "time_outside_window" };
  }

  // 3. Geblockte Zeiten für dieses Datum laden
  const { data: blockedTimes } = await supabase
    .from("booking_blocked_times")
    .select("*")
    .eq("practice_id", practiceId)
    .eq("blocked_date", date);

  if (blockedTimes && blockedTimes.length > 0) {
    const isBlocked = blockedTimes.some((bt: BlockedTime) => {
      if (bt.start_time === null) return true; // Ganzer Tag gesperrt
      const blockStart = timeToMinutes(bt.start_time);
      const blockEnd = bt.end_time ? timeToMinutes(bt.end_time) : 24 * 60;
      // Überschneidung: Slot-Start liegt in gesperrtem Bereich
      return slotMinutes >= blockStart && slotMinutes < blockEnd;
    });

    if (isBlocked) {
      return { available: false, reason: "blocked_by_blocked_times" };
    }
  }

  // 4. Bestehende bestätigte oder ausstehende Buchungen im selben Slot
  const slotDuration = rules[0]?.slot_minutes ?? 30;
  const slotEndMinutes = slotMinutes + slotDuration;
  const slotEndHH = String(Math.floor(slotEndMinutes / 60)).padStart(2, "0");
  const slotEndMM = String(slotEndMinutes % 60).padStart(2, "0");
  const slotTimeEnd = `${slotEndHH}:${slotEndMM}`;

  const { data: conflicts } = await supabase
    .from("booking_requests")
    .select("id")
    .eq("tenant_id", practiceId)
    .eq("confirmed_date", date)
    .gte("confirmed_time", time)
    .lt("confirmed_time", slotTimeEnd)
    .in("status", ["confirmed", "pending_confirmation"]);

  if (conflicts && conflicts.length > 0) {
    return { available: false, reason: "slot_already_taken" };
  }

  return { available: true, reason: "available" };
}

// ─── Verfügbare Slots für einen Tag ──────────────────────────────────────

export interface BookingSlot {
  time: string;  // "HH:MM"
  available: boolean;
}

/**
 * Gibt alle Zeitfenster für eine Praxis an einem bestimmten Tag zurück.
 * Nutzt booking_availability_rules + booking_blocked_times.
 */
export async function getAvailableSlotsForDay(
  supabase: SupabaseClient,
  practiceId: string,
  date: string,
): Promise<BookingSlot[]> {
  const targetDate = new Date(date + "T00:00:00");
  const weekday = dateToIsoWeekday(targetDate);

  const { data: rules } = await supabase
    .from("booking_availability_rules")
    .select("*")
    .eq("practice_id", practiceId)
    .eq("weekday", weekday)
    .eq("is_active", true);

  if (!rules || rules.length === 0) return [];

  const slots: BookingSlot[] = [];

  for (const rule of rules as AvailabilityRule[]) {
    const windowStart = timeToMinutes(rule.start_time);
    const windowEnd = timeToMinutes(rule.end_time);
    const step = rule.slot_minutes + rule.buffer_minutes;

    let cursor = windowStart;
    while (cursor + rule.slot_minutes <= windowEnd) {
      const hh = String(Math.floor(cursor / 60)).padStart(2, "0");
      const mm = String(cursor % 60).padStart(2, "0");
      const timeStr = `${hh}:${mm}`;

      const check = await checkSlotAvailability(supabase, practiceId, date, timeStr);
      slots.push({ time: timeStr, available: check.available });

      cursor += step;
    }
  }

  return slots;
}

// ─── Auto-Confirm-Logik ──────────────────────────────────────────────────

/**
 * Versucht eine Buchung automatisch zu bestätigen.
 *
 * Alle Bedingungen MÜSSEN erfüllt sein:
 * 1. practice.auto_confirm_bookings === true
 * 2. requested_date und requested_time sind vorhanden
 * 3. Patient hat eine E-Mail-Adresse
 * 4. Slot ist verfügbar (keine Konflikte, keine gesperrten Zeiten)
 *
 * Gibt niemals eine Garantie – im Zweifel: pending.
 */
export async function evaluateAutoConfirm(
  supabase: SupabaseClient,
  practiceId: string,
  requestedDate: string | null | undefined,
  requestedTime: string | null | undefined,
  patientEmail: string | null | undefined,
): Promise<AutoConfirmResult> {
  // 1. Praxis-Konfiguration laden
  const { data: practice } = await supabase
    .from("practices")
    .select("auto_confirm_bookings")
    .eq("id", practiceId)
    .single();

  if (!practice?.auto_confirm_bookings) {
    return { confirmed: false, reason: "auto_confirm_skipped_no_config" };
  }

  // 2. Datum und Uhrzeit vorhanden?
  if (!requestedDate?.trim() || !requestedTime?.trim()) {
    return { confirmed: false, reason: "auto_confirm_skipped_no_date" };
  }

  // 3. Patient hat E-Mail?
  if (!patientEmail?.trim()) {
    return { confirmed: false, reason: "auto_confirm_skipped_no_email" };
  }

  // 4. Slot verfügbar?
  const slotCheck = await checkSlotAvailability(
    supabase,
    practiceId,
    requestedDate,
    requestedTime,
  );

  if (!slotCheck.available) {
    return { confirmed: false, reason: "auto_confirm_skipped_slot_unavailable" };
  }

  return {
    confirmed: true,
    reason: "auto_confirm_success",
    confirmedDate: requestedDate,
    confirmedTime: requestedTime,
  };
}
