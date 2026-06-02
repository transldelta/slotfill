/**
 * lib/booking-email-client.ts – Client-sichere Hilfsfunktionen für Booking-E-Mail-Status
 *
 * Diese Datei enthält NUR reine Utility-Funktionen ohne Server-Imports.
 * Sie kann in Client Components (Browser) und Server Components verwendet werden.
 *
 * Server-only Funktionen (sendBookingEmail, isBookingEmailEnabled etc.)
 * bleiben in lib/booking-email.ts (nur serverseitig importieren).
 */

export type BookingEmailStatus =
  | "sent"
  | "skipped_disabled"
  | "skipped_no_email"
  | "send_failed"
  | "config_missing";

/**
 * Gibt einen menschenlesbaren Status-Text für die Admin-UI zurück.
 * Niemals ein Secret in der Ausgabe.
 */
export function getEmailStatusLabel(status: BookingEmailStatus): string {
  const labels: Record<BookingEmailStatus, string> = {
    sent: "E-Mail gesendet",
    skipped_disabled: "E-Mail deaktiviert",
    skipped_no_email: "Keine E-Mail-Adresse",
    send_failed: "Fehler beim Senden",
    config_missing: "E-Mail nicht konfiguriert",
  };
  return labels[status];
}

/**
 * Gibt die Farb-Klasse für den Status-Badge zurück.
 */
export function getEmailStatusColor(status: BookingEmailStatus): string {
  if (status === "sent") return "text-green-600";
  if (status === "send_failed") return "text-red-600";
  return "text-slate-400";
}
