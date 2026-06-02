/**
 * lib/booking-email.ts – Transaktionale E-Mail-Benachrichtigungen für Terminbuchungen
 *
 * Sicherheitsregeln (nicht verhandelbar):
 * - NUR transaktionale E-Mails: Bestätigung oder Ablehnung einer konkreten Anfrage.
 * - KEINE Kaltakquise, KEINE Marketing-E-Mails.
 * - KEINE automatische E-Mail direkt nach Patienten-Anfrage.
 * - E-Mail ERST nach manuellem Admin-Klick (confirm/decline).
 * - BOOKING_EMAIL_NOTIFICATIONS_ENABLED=false per Default → kein Versand ohne Opt-in.
 * - RESEND_API_KEY nur serverseitig – kein Leak in Client-Responses.
 * - Patientendaten (Name, E-Mail) werden NICHT vollständig in Logs ausgegeben.
 * - Keine SMS/WhatsApp in dieser Phase.
 *
 * Audit-Actions:
 *   booking_email_confirmation_sent
 *   booking_email_decline_sent
 *   booking_email_send_failed
 *   booking_email_skipped_disabled
 *   booking_email_skipped_no_email
 */

import { escapeHtml, sendEmail } from "@/lib/email";
import { writeAuditLog } from "@/lib/audit-log";
import { BRAND_NAME, BRAND_TEAM_NAME, CONTACT_EMAIL } from "@/lib/brand";

// ─── Typen ─────────────────────────────────────────────────────────────────

export type BookingEmailType = "confirmation" | "decline";

// Re-export client-safe types und Utilities aus booking-email-client
export type { BookingEmailStatus } from "@/lib/booking-email-client";
export { getEmailStatusLabel, getEmailStatusColor } from "@/lib/booking-email-client";
import type { BookingEmailStatus } from "@/lib/booking-email-client";

export interface BookingEmailResult {
  status: BookingEmailStatus;
  /** Maschinenlesbarer Code, nie ein Secret. */
  code: string;
}

/** Minimale Buchungs-Daten für E-Mail-Versand */
export interface BookingEmailData {
  id: string;
  patient_name: string;
  patient_email: string | null;
  preferred_time: string;
  note: string | null;
  tenant_id?: string | null;
}

// ─── Konfiguration ─────────────────────────────────────────────────────────

/**
 * Gibt zurück ob E-Mail-Benachrichtigungen für Buchungen aktiviert sind.
 * DEFAULT: false (sicher – kein Versand ohne explizite Konfiguration).
 */
export function isBookingEmailEnabled(): boolean {
  return process.env.BOOKING_EMAIL_NOTIFICATIONS_ENABLED === "true";
}

/**
 * Gibt den Reply-To für Buchungs-E-Mails zurück.
 * Fallback: CONTACT_EMAIL aus Brand-Konfiguration.
 */
export function getBookingReplyTo(): string {
  return process.env.BOOKING_REPLY_TO_EMAIL ?? CONTACT_EMAIL;
}

// ─── HTML-Templates ────────────────────────────────────────────────────────

/** Gemeinsames Basis-Layout – identisch zu lib/email/templates.ts */
function layout(innerHtml: string): string {
  const safeContact = escapeHtml(CONTACT_EMAIL);
  const safeBrand = escapeHtml(BRAND_NAME);
  const safeTeam = escapeHtml(BRAND_TEAM_NAME);
  return `<!doctype html>
<html lang="de">
<body style="margin:0;background:#f1f5f9;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">
    <div style="font-size:20px;font-weight:700;color:#0f172a;margin-bottom:20px;">${safeBrand}</div>
    ${innerHtml}
    <hr style="margin:24px 0;border:none;border-top:1px solid #e2e8f0;" />
    <p style="font-size:12px;color:#94a3b8;margin:0;">
      ${safeTeam} &middot;
      <a href="mailto:${safeContact}" style="color:#94a3b8;">${safeContact}</a>
    </p>
    <p style="font-size:11px;color:#cbd5e1;margin:6px 0 0;">
      Diese Nachricht ist transaktional und bezieht sich ausschlie&szlig;lich auf
      Ihre konkrete Terminanfrage. Kein Marketing, keine Kaltakquise.
    </p>
  </div>
</body>
</html>`;
}

/**
 * HTML-Template: Terminbestätigung
 *
 * Absender: SlotFill Team (kein persönlicher Name).
 * Patient entschied sich für eine Anfrage – Admin hat manuell bestätigt.
 */
export function bookingConfirmationHtml(booking: BookingEmailData): string {
  const safeName = escapeHtml(booking.patient_name);
  const safeTime = escapeHtml(booking.preferred_time);
  const safeNote = booking.note ? escapeHtml(booking.note) : null;

  const noteRow = safeNote
    ? `<tr>
         <td style="padding:6px 0;color:#64748b;font-size:13px;white-space:nowrap;padding-right:16px;">Anliegen</td>
         <td style="padding:6px 0;font-size:13px;">${safeNote}</td>
       </tr>`
    : "";

  return layout(`
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
      Guten Tag ${safeName},
    </p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 20px;">
      Ihre Terminanfrage wurde von der Praxis <strong>best&auml;tigt</strong>.
    </p>
    <table style="border-collapse:collapse;width:100%;font-size:14px;margin-bottom:20px;">
      <tr>
        <td style="padding:6px 0;color:#64748b;font-size:13px;white-space:nowrap;padding-right:16px;">Zeitraum</td>
        <td style="padding:6px 0;font-size:13px;font-weight:600;">${safeTime}</td>
      </tr>
      ${noteRow}
    </table>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px;font-size:13px;color:#166534;margin-bottom:20px;">
      <strong>Hinweis:</strong> Diese Nachricht bezieht sich ausschlie&szlig;lich auf
      Ihre konkrete Anfrage. Die Praxis wird sich bei Bedarf mit weiteren Details
      bei Ihnen melden.
    </div>
    <p style="font-size:13px;color:#64748b;margin:0;">
      Bei Fragen wenden Sie sich bitte direkt an die Praxis.
    </p>
  `);
}

/**
 * HTML-Template: Terminablehnung
 *
 * Klar und respektvoll formuliert – kein Versprechen, keine falsche Hoffnung.
 */
export function bookingDeclineHtml(booking: BookingEmailData): string {
  const safeName = escapeHtml(booking.patient_name);
  const safeTime = escapeHtml(booking.preferred_time);

  return layout(`
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
      Guten Tag ${safeName},
    </p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 20px;">
      leider kann die Praxis Ihre Terminanfrage f&uuml;r den folgenden Zeitraum
      aktuell nicht best&auml;tigen:
    </p>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px;font-size:14px;color:#991b1b;margin-bottom:20px;">
      Angefragter Zeitraum: <strong>${safeTime}</strong>
    </div>
    <p style="font-size:14px;line-height:1.6;margin:0 0 16px;color:#374151;">
      Bitte kontaktieren Sie die Praxis direkt, um einen alternativen Termin
      zu vereinbaren.
    </p>
    <p style="font-size:13px;color:#64748b;margin:0;">
      Wir bitten um Ihr Verst&auml;ndnis.
    </p>
  `);
}

// ─── Versand-Funktion ──────────────────────────────────────────────────────

/**
 * Sendet eine transaktionale Buchungs-E-Mail nach manuellem Admin-Klick.
 *
 * Ablauf:
 * 1. Prüft BOOKING_EMAIL_NOTIFICATIONS_ENABLED
 * 2. Prüft ob Patient eine E-Mail-Adresse hat
 * 3. Sendet E-Mail via Resend
 * 4. Schreibt Audit-Log (niemals Secrets, niemals vollständige E-Mail)
 *
 * Diese Funktion wird NUR nach manuellem Admin-Klick (confirm/decline) aufgerufen.
 */
export async function sendBookingEmail(
  booking: BookingEmailData,
  type: BookingEmailType,
  actorEmail: string | null,
): Promise<BookingEmailResult> {
  // 1. Feature-Flag prüfen
  if (!isBookingEmailEnabled()) {
    await writeAuditLog({
      action: "booking_email_skipped_disabled",
      area: "booking",
      status: "blocked",
      actorEmail,
      practiceId: booking.tenant_id ?? null,
      metadata: {
        booking_id: booking.id,
        email_type: type,
        reason: "BOOKING_EMAIL_NOTIFICATIONS_ENABLED is not true",
      },
    });
    return { status: "skipped_disabled", code: "BOOKING_EMAIL_DISABLED" };
  }

  // 2. Patienten-E-Mail prüfen
  if (!booking.patient_email?.trim()) {
    await writeAuditLog({
      action: "booking_email_skipped_no_email",
      area: "booking",
      status: "blocked",
      actorEmail,
      practiceId: booking.tenant_id ?? null,
      metadata: {
        booking_id: booking.id,
        email_type: type,
        reason: "patient has no email address",
      },
    });
    return { status: "skipped_no_email", code: "BOOKING_NO_PATIENT_EMAIL" };
  }

  // 3. E-Mail-Inhalt generieren
  const subject =
    type === "confirmation"
      ? "Ihre Terminanfrage wurde bestätigt"
      : "Rückmeldung zu Ihrer Terminanfrage";

  const html =
    type === "confirmation"
      ? bookingConfirmationHtml(booking)
      : bookingDeclineHtml(booking);

  // 4. Senden (RESEND_API_KEY wird in sendEmail geprüft)
  const result = await sendEmail(booking.patient_email, subject, html);

  // 5. Audit-Log schreiben (KEIN Secret, KEINE vollständige E-Mail-Adresse in Logs)
  const auditAction =
    result.success
      ? type === "confirmation"
        ? "booking_email_confirmation_sent"
        : "booking_email_decline_sent"
      : "booking_email_send_failed";

  await writeAuditLog({
    action: auditAction,
    area: "booking",
    status: result.success ? "success" : "failed",
    actorEmail,
    practiceId: booking.tenant_id ?? null,
    metadata: {
      booking_id: booking.id,
      email_type: type,
      // Nur Hash/Länge der E-Mail im Log, nicht die vollständige Adresse
      patient_email_length: booking.patient_email.length,
      patient_email_domain: booking.patient_email.split("@")[1] ?? "unknown",
      code: result.code,
    },
  });

  if (!result.success) {
    return { status: "send_failed", code: result.code };
  }

  return { status: "sent", code: "EMAIL_SENT" };
}

// Hilfsfunktionen getEmailStatusLabel + getEmailStatusColor sind in
// lib/booking-email-client.ts (client-safe) und werden von dort re-exportiert.
