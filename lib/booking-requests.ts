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
  // Slot-Daten (aus Migration 023)
  requested_date: string | null;  // "YYYY-MM-DD" – vom Patient gewählter Slot
  requested_time: string | null;  // "HH:MM"
  confirmed_date: string | null;  // "YYYY-MM-DD" – vom Admin bestätigter Termin
  confirmed_time: string | null;  // "HH:MM"
  confirmation_mode: "manual" | "auto";
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
  // Konkreter Slot (optional – null wenn manuelle Terminabstimmung)
  requested_date?: string | null; // "YYYY-MM-DD"
  requested_time?: string | null; // "HH:MM"
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

/**
 * Platzhalter-Texte die niemals als Zeitraum gespeichert werden dürfen.
 * Diese kommen aus dem Slot-Selector als Default-Option.
 */
export const BOOKING_PLACEHOLDER_TEXTS = [
  "einen freien slot auswählen",
  "bitte einen freien slot auswählen",
  "— bitte einen freien slot auswählen —",
  "slot auswählen",
] as const;

/**
 * Prüft ob preferred_time ein Platzhalter-Text ist.
 */
export function isPlaceholderTime(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return BOOKING_PLACEHOLDER_TEXTS.some((p) => normalized.includes(p));
}

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
  // Platzhalter-Text darf nicht als Zeitraum gespeichert werden
  if (isPlaceholderTime(data.preferred_time)) {
    return "Bitte wählen Sie einen konkreten Zeitslot aus oder geben Sie einen Wunschzeitraum an.";
  }
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
 * Erzwingt: auto_confirmed=false, status=pending_confirmation, confirmation_mode=manual.
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
    // Slot-Daten: nur gesetzt wenn Patient konkret Slot gewählt hat
    requested_date: data.requested_date || null,
    requested_time: data.requested_time || null,
    // Admin bestätigt später
    confirmed_date: null,
    confirmed_time: null,
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
  return labels[status] ?? status;
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
  return colors[status] ?? "text-slate-500";
}

/**
 * Zeigt den Zeitraum einer Buchung an.
 * Bevorzugt confirmed_date/time, dann requested_date/time, dann preferred_time.
 * Wenn kein konkreter Slot: Fallback-Text für manuelle Abstimmung.
 */
export function getBookingTimeDisplay(booking: {
  preferred_time?: string;
  requested_date?: string | null;
  requested_time?: string | null;
  confirmed_date?: string | null;
  confirmed_time?: string | null;
}): { label: string; isManual: boolean } {
  // 1. Bestätigter Termin
  if (booking.confirmed_date && booking.confirmed_time) {
    const d = new Date(booking.confirmed_date + "T00:00:00");
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return {
      label: `${day}.${month}.${year} · ${booking.confirmed_time} Uhr`,
      isManual: false,
    };
  }
  // 2. Angefragter Slot
  if (booking.requested_date && booking.requested_time) {
    const d = new Date(booking.requested_date + "T00:00:00");
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return {
      label: `${day}.${month}.${year} · ${booking.requested_time} Uhr (angefragt)`,
      isManual: false,
    };
  }
  // 3. Freitext-Zeitraum
  if (booking.preferred_time?.trim()) {
    return { label: booking.preferred_time.trim(), isManual: true };
  }
  // 4. Kein Zeitraum gesetzt
  return {
    label: "Kein konkreter Slot gewählt – manuelle Terminabstimmung erforderlich",
    isManual: true,
  };
}
