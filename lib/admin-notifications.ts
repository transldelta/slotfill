/**
 * lib/admin-notifications.ts – Admin-Benachrichtigungen bei neuen Anfragen
 *
 * Sicherheitsregeln:
 * - NUR serverseitig. Niemals in "use client"-Dateien importieren.
 * - E-Mail-Fehler crashen NIE das Formular. Fehler werden nur geloggt.
 * - Keine Patientendaten in Logs. Nur Länge/Domain der E-Mail.
 * - ADMIN_NOTIFICATION_EMAIL fällt auf CONTACT_EMAIL zurück (transl.delta@gmail.com).
 * - Kein NEXT_PUBLIC_* Secret. Kein Service-Role-Key im Client.
 */

import { escapeHtml, sendEmail } from "@/lib/email";
import { BRAND_NAME, CONTACT_EMAIL } from "@/lib/brand";
import { CANONICAL_URL } from "@/lib/brand";

// Admin-Empfänger: explizite Env-Variable, dann CONTACT_EMAIL-Fallback
function getAdminEmail(): string {
  return (
    process.env.ADMIN_NOTIFICATION_EMAIL ??
    process.env.CONTACT_EMAIL ??
    "transl.delta@gmail.com"
  );
}

/**
 * Loggt E-Mail-Konfiguration ohne Secrets.
 * Nur key presence (true/false), nie den Key-Wert selbst.
 */
function logEmailConfig(context: string): void {
  const hasApiKey = !!process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev (default)";
  const adminEmail = getAdminEmail();
  console.log(
    `[${context}] config: RESEND_API_KEY=${hasApiKey} | from="${fromEmail}" | to="${adminEmail}"`,
  );
}

// Minimal-Layout für Admin-E-Mails – klar, sachlich, kein Marketing
function adminLayout(innerHtml: string): string {
  const safeBrand = escapeHtml(BRAND_NAME);
  return `<!doctype html>
<html lang="en">
<body style="margin:0;background:#f1f5f9;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:28px;">
    <div style="font-size:13px;font-weight:600;color:#64748b;letter-spacing:0.05em;margin-bottom:16px;text-transform:uppercase;">
      ${safeBrand} &middot; Admin Notification
    </div>
    ${innerHtml}
    <hr style="margin:20px 0;border:none;border-top:1px solid #e2e8f0;" />
    <p style="font-size:11px;color:#94a3b8;margin:0;">
      This is an automated admin notification. It is not sent to patients.
    </p>
  </div>
</body>
</html>`;
}

// Zeile in der Admin-Tabelle
function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 12px 6px 0;color:#64748b;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:6px 0;font-size:13px;word-break:break-all;">${value}</td>
  </tr>`;
}

// ─── Kontaktanfrage ───────────────────────────────────────────────────────────

export interface ContactNotificationData {
  name: string;
  email: string;
  message: string;
  locale: string;
  createdAt?: string; // ISO-String oder undefined → jetzt
}

/**
 * Sendet eine Admin-Benachrichtigung bei neuer Kontaktanfrage.
 * Wird nach erfolgreichem DB-Insert aufgerufen.
 * Fehler werden nur geloggt – niemals an den Nutzer weitergegeben.
 */
export async function sendContactAdminNotification(
  data: ContactNotificationData,
): Promise<void> {
  logEmailConfig("sendContactAdminNotification");
  const adminEmail = getAdminEmail();
  const time = data.createdAt
    ? new Date(data.createdAt).toLocaleString("en-GB", { timeZone: "Europe/Berlin" })
    : new Date().toLocaleString("en-GB", { timeZone: "Europe/Berlin" });

  const safeName = escapeHtml(data.name);
  const safeEmail = escapeHtml(data.email);
  const safeLocale = escapeHtml(data.locale);
  const safeMsg = escapeHtml(data.message);
  const safeTime = escapeHtml(time);
  const adminLink = `${CANONICAL_URL}/admin/contact-messages`;

  const html = adminLayout(`
    <p style="font-size:16px;font-weight:600;margin:0 0 16px;">New contact request</p>
    <table style="border-collapse:collapse;width:100%;margin-bottom:20px;">
      ${row("Name", safeName)}
      ${row("Email", `<a href="mailto:${safeEmail}" style="color:#2563eb;">${safeEmail}</a>`)}
      ${row("Locale", safeLocale)}
      ${row("Received", safeTime)}
    </table>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;margin-bottom:20px;">
      <div style="font-size:12px;color:#64748b;margin-bottom:6px;">Message</div>
      <div style="font-size:14px;line-height:1.6;white-space:pre-wrap;">${safeMsg}</div>
    </div>
    <a href="${adminLink}"
       style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;
              font-size:13px;font-weight:600;padding:10px 20px;border-radius:8px;">
      Open in Admin →
    </a>
  `);

  const result = await sendEmail(
    adminEmail,
    "New ClinicSlotHub contact request",
    html,
  );

  if (result.success) {
    console.log("[sendContactAdminNotification] E-Mail gesendet: success");
  } else {
    console.warn(
      `[sendContactAdminNotification] E-Mail NICHT gesendet: ${result.code}`,
    );
  }
}

// ─── Terminbuchungsanfrage ────────────────────────────────────────────────────

export interface BookingNotificationData {
  id: string;
  patient_name: string;
  patient_email: string;
  preferred_time: string;
  note?: string | null;
  requested_date?: string | null;
  requested_time?: string | null;
  createdAt?: string;
}

/**
 * Sendet eine Admin-Benachrichtigung bei neuer Terminbuchungsanfrage.
 * Wird nach erfolgreichem DB-Insert aufgerufen.
 * Fehler werden nur geloggt – niemals an den Nutzer weitergegeben.
 */
export async function sendBookingAdminNotification(
  data: BookingNotificationData,
): Promise<void> {
  logEmailConfig("sendBookingAdminNotification");
  const adminEmail = getAdminEmail();
  const time = data.createdAt
    ? new Date(data.createdAt).toLocaleString("en-GB", { timeZone: "Europe/Berlin" })
    : new Date().toLocaleString("en-GB", { timeZone: "Europe/Berlin" });

  const safeName = escapeHtml(data.patient_name);
  const safeEmail = escapeHtml(data.patient_email);
  const safeTime = escapeHtml(time);
  const adminLink = `${CANONICAL_URL}/admin/booking-requests`;

  // Zeitangabe: konkreter Slot bevorzugt, sonst Freitext
  let timeValue: string;
  if (data.requested_date && data.requested_time) {
    timeValue = escapeHtml(`${data.requested_date} · ${data.requested_time}`);
  } else {
    timeValue = escapeHtml(data.preferred_time);
  }

  const noteRow = data.note?.trim()
    ? row("Note / Concern", escapeHtml(data.note))
    : "";

  const html = adminLayout(`
    <p style="font-size:16px;font-weight:600;margin:0 0 16px;">New booking request</p>
    <table style="border-collapse:collapse;width:100%;margin-bottom:20px;">
      ${row("Name", safeName)}
      ${row("Email", `<a href="mailto:${safeEmail}" style="color:#2563eb;">${safeEmail}</a>`)}
      ${row("Desired time", timeValue)}
      ${noteRow}
      ${row("Received", safeTime)}
    </table>
    <a href="${adminLink}"
       style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;
              font-size:13px;font-weight:600;padding:10px 20px;border-radius:8px;">
      Open in Admin →
    </a>
  `);

  const result = await sendEmail(
    adminEmail,
    "New ClinicSlotHub booking request",
    html,
  );

  if (result.success) {
    console.log("[sendBookingAdminNotification] E-Mail gesendet: success");
  } else {
    console.warn(
      `[sendBookingAdminNotification] E-Mail NICHT gesendet: ${result.code}`,
    );
  }
}
