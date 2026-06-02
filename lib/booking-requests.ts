/**
 * lib/booking-requests.ts – Terminanfragen-Logik
 *
 * Sicherheitsregeln:
 * - privacy_accepted = true ist Pflicht (sonst INSERT abgelehnt)
 * - auto_confirmed = false per Default
 * - AUTO_CONFIRM_BOOKINGS muss explizit auf "true" gesetzt sein
 * - Automatische Bestätigung nur wenn alle Bedingungen erfüllt sind
 * - Status = pending_confirmation (nicht "confirmed") per Default
 * - Keine echten Nachrichten ohne konfigurierten Provider
 */

// ─── Typen ─────────────────────────────────────────────────────────────────

export type BookingStatus =
  | "booking_request"
  | "pending_confirmation"
  | "confirmed"
  | "declined"
  | "cancelled";

export interface BookingRequest {
  id: string;
  tenant_id: string | null;
  patient_name: string;
  patient_email: string;
  patient_phone: string | null;
  preferred_time: string;
  note: string | null;
  status: BookingStatus;
  privacy_accepted: boolean;
  auto_confirmed: boolean;
  internal_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingSubmission {
  patient_name: string;
  patient_email: string;
  patient_phone?: string;
  preferred_time: string;
  note?: string;
  privacy_accepted: boolean;
  tenant_id?: string;
}

// ─── Sicherheits-Konfiguration ────────────────────────────────────────────

/**
 * Gibt zurück ob AUTO_CONFIRM_BOOKINGS aktiviert ist.
 * Default: false (sicher).
 *
 * MUSS explizit auf "true" gesetzt werden – niemals auto-confirm by default.
 */
export function isAutoConfirmEnabled(): boolean {
  return process.env.AUTO_CONFIRM_BOOKINGS === "true";
}

/**
 * Prüft ob eine Anfrage automatisch bestätigt werden darf.
 * Alle Bedingungen MÜSSEN erfüllt sein:
 *   a) AUTO_CONFIRM_BOOKINGS=true (ENV-Variable)
 *   b) privacy_accepted=true
 *   c) keine manuelle Prüfung erforderlich
 *
 * Im aktuellen MVP: Auto-Confirm nur als Vorbereitung.
 * Slot-Verfügbarkeit und Konflikte werden noch manuell geprüft.
 */
export function shouldAutoConfirm(data: {
  privacy_accepted: boolean;
}): boolean {
  if (!isAutoConfirmEnabled()) return false;
  if (!data.privacy_accepted) return false;
  // Im MVP: Auto-Confirm ist vorbereitet aber noch nicht vollautomatisch.
  // Admin-Prüfung bleibt empfohlen.
  return false; // Bleibt false bis vollständige Slot-Prüfung implementiert ist
}

// ─── Validierung ──────────────────────────────────────────────────────────

export function validateBookingSubmission(
  data: Partial<BookingSubmission>,
): string | null {
  if (!data.patient_name?.trim()) return "Name ist erforderlich.";
  if (data.patient_name.length > 100) return "Name darf maximal 100 Zeichen lang sein.";
  if (!data.patient_email?.trim()) return "E-Mail ist erforderlich.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.patient_email)) {
    return "Ungültige E-Mail-Adresse.";
  }
  if (!data.preferred_time?.trim()) return "Gewünschter Zeitraum ist erforderlich.";
  if (data.preferred_time.length > 200) {
    return "Zeitraumangabe darf maximal 200 Zeichen lang sein.";
  }
  if (!data.privacy_accepted) {
    return "Datenschutz/Buchungshinweis muss akzeptiert werden.";
  }
  if (data.patient_phone && data.patient_phone.length > 30) {
    return "Telefonnummer darf maximal 30 Zeichen lang sein.";
  }
  if (data.note && data.note.length > 1000) {
    return "Anliegen darf maximal 1000 Zeichen lang sein.";
  }
  return null;
}

/**
 * Erstellt die Datenbankzeile für eine neue Buchungsanfrage.
 * Erzwingt: auto_confirmed=false, status=pending_confirmation.
 */
export function buildBookingRecord(
  data: BookingSubmission,
): Omit<BookingRequest, "id" | "created_at" | "updated_at"> {
  return {
    tenant_id: data.tenant_id ?? null,
    patient_name: data.patient_name.trim(),
    patient_email: data.patient_email.trim(),
    patient_phone: data.patient_phone?.trim() || null,
    preferred_time: data.preferred_time.trim(),
    note: data.note?.trim() || null,
    // Datenschutz-Pflicht
    privacy_accepted: data.privacy_accepted,
    // Status: ausstehende Bestätigung (KEINE automatische Bestätigung per Default)
    status: "pending_confirmation",
    // Auto-Confirm immer false beim Erstellen
    auto_confirmed: false,
    internal_note: null,
  };
}

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────

export function getBookingStatusLabel(status: BookingStatus): string {
  const labels: Record<BookingStatus, string> = {
    booking_request: "Anfrage eingegangen",
    pending_confirmation: "Wartet auf Bestätigung",
    confirmed: "Bestätigt",
    declined: "Abgelehnt",
    cancelled: "Abgesagt",
  };
  return labels[status];
}

export function getBookingStatusColor(status: BookingStatus): string {
  const colors: Record<BookingStatus, string> = {
    booking_request: "text-blue-600",
    pending_confirmation: "text-amber-600",
    confirmed: "text-green-600",
    declined: "text-red-600",
    cancelled: "text-slate-500",
  };
  return colors[status];
}
