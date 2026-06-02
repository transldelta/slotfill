"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase";
import { buildBookingRecord, validateBookingSubmission } from "@/lib/booking-requests";

const schema = z.object({
  patient_name: z.string().trim().min(1).max(100),
  patient_email: z.string().trim().email(),
  patient_phone: z.string().trim().max(30).optional(),
  preferred_time: z.string().trim().min(1).max(200),
  note: z.string().trim().max(1000).optional(),
  privacy_accepted: z.coerce.boolean(),
  tenant_id: z.string().uuid().optional(),
});

export type SubmitBookingResult =
  | { code: "BOOKING_SAVED"; bookingId: string }
  | { code: "BOOKING_ERROR"; message: string }
  | { code: "PRIVACY_NOT_ACCEPTED" }
  | { code: "VALIDATION_ERROR"; message: string };

/**
 * Verarbeitet eine Terminanfrage.
 *
 * Sicherheitsregeln:
 * - privacy_accepted = true ist Pflicht
 * - auto_confirmed = false (DEFAULT)
 * - Status = pending_confirmation (nicht automatisch confirmed)
 * - Keine echten Nachrichten ohne Provider
 * - Patient sieht ehrlichen Hinweis: "Praxis bestätigt manuell"
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
  });

  if (!parsed.success) {
    return { code: "VALIDATION_ERROR", message: "Ungültige Eingabe." };
  }

  const { patient_name, patient_email, patient_phone, preferred_time,
    note, privacy_accepted, tenant_id } = parsed.data;

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
  });

  const supabase = createClient();

  const { data: saved, error } = await supabase
    .from("booking_requests")
    .insert(record)
    .select("id")
    .single();

  if (error || !saved) {
    console.error("[booking] insert error:", error?.message);
    return { code: "BOOKING_ERROR", message: "Terminanfrage konnte nicht gespeichert werden." };
  }

  return { code: "BOOKING_SAVED", bookingId: saved.id };
}
