"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase";
import {
  buildBookingRecord,
  validateBookingSubmission,
  isPlaceholderTime,
} from "@/lib/booking-requests";
import { evaluateAutoConfirm } from "@/lib/auto-confirm";
import { sendBookingAdminNotification } from "@/lib/admin-notifications";

const schema = z.object({
  patient_name: z.string().trim().min(1).max(100),
  patient_email: z.string().trim().email(),
  patient_phone: z.string().trim().max(30).optional(),
  preferred_time: z.string().trim().min(1).max(200),
  note: z.string().trim().max(1000).optional(),
  privacy_accepted: z.coerce.boolean(),
  tenant_id: z.string().uuid().optional(),
  // Konkreter Slot (optional – leer wenn manuelle Zeitangabe)
  requested_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal("")),
  requested_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional()
    .or(z.literal("")),
});

export type SubmitBookingResult =
  | { code: "BOOKING_SAVED"; bookingId: string; autoConfirmed: boolean }
  | { code: "BOOKING_ERROR"; message: string }
  | { code: "PRIVACY_NOT_ACCEPTED" }
  | { code: "VALIDATION_ERROR"; message: string };

/**
 * Verarbeitet eine Terminanfrage.
 *
 * Sicherheitsregeln:
 * - privacy_accepted = true ist Pflicht
 * - Platzhalter-Texte ("einen freien Slot auswählen") werden abgelehnt
 * - requested_date / requested_time: nur gültige Formate werden gespeichert
 * - Nach dem INSERT: evaluateAutoConfirm() prüft alle Bedingungen
 * - Auto-Confirm: nur wenn practice.auto_confirm_bookings = true UND Slot frei
 * - Kein Auto-Confirm ohne echten Slot oder ohne E-Mail-Adresse
 * - Keine echten Nachrichten ohne konfigurierten E-Mail-Provider
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
    requested_date: formData.get("requested_date") || "",
    requested_time: formData.get("requested_time") || "",
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

  // Platzhalter-Text niemals als Zeitraum speichern
  if (isPlaceholderTime(preferred_time)) {
    return {
      code: "VALIDATION_ERROR",
      message:
        "Bitte wählen Sie einen konkreten Zeitslot aus oder geben Sie einen Wunschzeitraum an.",
    };
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

  // Nur echte Slot-Daten speichern (Regex-Schutz)
  const cleanRequestedDate =
    requested_date && /^\d{4}-\d{2}-\d{2}$/.test(requested_date)
      ? requested_date
      : null;
  const cleanRequestedTime =
    requested_time && /^\d{2}:\d{2}$/.test(requested_time)
      ? requested_time
      : null;

  const record = buildBookingRecord({
    patient_name,
    patient_email,
    patient_phone,
    preferred_time,
    note,
    privacy_accepted,
    tenant_id,
    requested_date: cleanRequestedDate,
    requested_time: cleanRequestedTime,
  });

  const supabase = createClient();

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

  // ── Auto-Confirm evaluieren ────────────────────────────────────────────
  // evaluateAutoConfirm prüft alle Bedingungen und bestätigt ggf. sofort.
  // Fehler hier dürfen die Buchungs-Bestätigung nicht crashen.
  let autoConfirmed = false;
  try {
    const autoResult = await evaluateAutoConfirm(saved.id, supabase);
    autoConfirmed = autoResult.confirmed;
  } catch (err) {
    console.error("[booking] auto-confirm error:", err);
    // Buchung bleibt gespeichert – kein Fehler an den Patienten
  }

  // ── Admin-Benachrichtigung (awaited – kein fire-and-forget) ──────────────
  // Fehler werden geloggt, brechen aber die Erfolgsantwort nicht ab.
  try {
    await sendBookingAdminNotification({
      id: saved.id,
      patient_name,
      patient_email,
      preferred_time,
      note: note ?? null,
      requested_date: cleanRequestedDate,
      requested_time: cleanRequestedTime,
    });
  } catch (err) {
    console.warn(
      "[booking] Admin-Notification Fehler:",
      err instanceof Error ? err.message : "unknown",
    );
  }

  return {
    code: "BOOKING_SAVED",
    bookingId: saved.id,
    autoConfirmed,
  };
}
