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
  | "cancelled"
  | "archived";

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
  // Erweiterungen (Migration 021)
  requested_date?: string | null;
  requested_time?: string | null;
  confirmed_date?: string | null;
  confirmed_time?: string | null;
  confirmation_mode?: "manual" | "auto";
  email_status?: string | null;
  email_sent_at?: string | null;
  archived_at?: string | null;
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
  // Optionale konkrete Wunsch-Slot-Angaben (Migration 021)
  requested_date?: string;
  requested_time?: string;
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
 * Prüft ob eine Anfrage für Auto-Confirm in Frage kommt (Vorbedingungen).
 * Die eigentliche Slot-Prüfung übernimmt lib/booking-slots.ts → evaluateAutoConfirm().
 *
 * Vorbedingungen:
 *   a) AUTO_CONFIRM_BOOKINGS=true (ENV-Variable) ODER practice.auto_confirm_bookings
 *   b) privacy_accepted=true
 *   c) requested_date und requested_time vorhanden
 *   d) patient_email vorhanden
 *
 * Diese Funktion prüft NUR Vorbedingungen – keine DB-Abfragen.
 * Slot-Konflikte und Blocking prüft evaluateAutoConfirm() in lib/booking-slots.ts.
 */
export function shouldAutoConfirm(data: {
  privacy_accepted: boolean;
  requested_date?: string | null;
  requested_time?: string | null;
  patient_email?: string | null;
  /** Optional: practice-level setting aus DB */
  practiceAutoConfirm?: boolean;
}): boolean {
  const globalFlag = isAutoConfirmEnabled();
  const practiceFlag = data.practiceAutoConfirm === true;
  if (!globalFlag && !practiceFlag) return false;
  if (!data.privacy_accepted) return false;
  if (!data.requested_date?.trim()) return false;
  if (!data.requested_time?.trim()) return false;
  if (!data.patient_email?.trim()) return false;
  return true;
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
 * Optionale Felder: requested_date, requested_time (für Slot-Auswahl).
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
    // Auto-Confirm immer false beim Erstellen (wird ggf. nach Slot-Check aktualisiert)
    auto_confirmed: false,
    internal_note: null,
    // Optionale Wunsch-Slot-Angaben
    requested_date: data.requested_date?.trim() || null,
    requested_time: data.requested_time?.trim() || null,
    confirmation_mode: "manual",
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
    archived: "Archiviert",
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
    archived: "text-slate-400",
  };
  return colors[status];
}
