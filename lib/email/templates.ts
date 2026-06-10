import type { Translator } from "@/lib/i18n";
import { escapeHtml } from "@/lib/email";
import {
  BRAND_NAME,
  BRAND_TEAM_NAME,
  CONTACT_EMAIL,
  PUBLIC_APP_URL,
} from "@/lib/brand";

// Gemeinsames, schlichtes HTML-Layout für alle E-Mails.
// Absender ist immer "ClinicSlotHub Team" – kein persönlicher Name.
function layout(innerHtml: string): string {
  const safeContact = escapeHtml(CONTACT_EMAIL);
  const safeUrl = escapeHtml(PUBLIC_APP_URL);
  const safeTeam = escapeHtml(BRAND_TEAM_NAME);
  const safeBrand = escapeHtml(BRAND_NAME);
  return `<!doctype html><html lang="de"><body style="margin:0;background:#f1f5f9;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">
    <div style="font-size:20px;font-weight:700;margin-bottom:16px;">${safeBrand}</div>
    ${innerHtml}
    <hr style="margin:24px 0;border:none;border-top:1px solid #e2e8f0;" />
    <p style="font-size:12px;color:#94a3b8;margin:0;">
      ${safeTeam} &middot;
      <a href="mailto:${safeContact}" style="color:#94a3b8;">${safeContact}</a>
      &middot;
      <a href="${safeUrl}" style="color:#94a3b8;">${safeUrl}</a>
    </p>
    <p style="font-size:11px;color:#cbd5e1;margin:6px 0 0;">
      Diese Nachricht ist transaktional (kein Marketing, keine Kaltakquise).
    </p>
  </div>
</body></html>`;
}

export function welcomeEmail(t: Translator, praxisName: string): string {
  const body = t("email.welcomeBody", { praxisName: escapeHtml(praxisName) });
  return layout(`<p style="font-size:15px;line-height:1.6;">${body}</p>`);
}

export function trialReminderEmail(
  t: Translator,
  praxisName: string,
  daysLeft: number,
): string {
  const greeting = escapeHtml(praxisName);
  const body = t("email.trialReminderBody", { daysLeft });
  return layout(
    `<p style="font-size:15px;line-height:1.6;">${greeting}</p>
     <p style="font-size:15px;line-height:1.6;">${body}</p>`,
  );
}

export function paymentEmail(
  t: Translator,
  praxisName: string,
  amount: number,
  invoiceUrl?: string,
): string {
  const greeting = escapeHtml(praxisName);
  const body = t("email.paymentBody", { amount });
  const invoiceLink = invoiceUrl
    ? `<p style="font-size:15px;line-height:1.6;">
         <a href="${escapeHtml(invoiceUrl)}" style="color:#2563eb;">${t("email.viewInvoice")}</a>
       </p>`
    : "";
  return layout(
    `<p style="font-size:15px;line-height:1.6;">${greeting}</p>
     <p style="font-size:15px;line-height:1.6;">${body}</p>
     ${invoiceLink}`,
  );
}

/**
 * Eingangsbestätigung für Kontaktformular-Anfragen.
 * Absender: ClinicSlotHub Team (kein persönlicher Name).
 * Keine Kaltakquise. Keine automatischen SMS/WhatsApp.
 */
export function contactConfirmationEmail(senderName: string): string {
  const safeName = escapeHtml(senderName);
  return layout(`
    <p style="font-size:15px;line-height:1.6;">
      Hallo ${safeName},
    </p>
    <p style="font-size:15px;line-height:1.6;">
      vielen Dank für Ihre Anfrage. Das <strong>${escapeHtml(BRAND_TEAM_NAME)}</strong>
      hat Ihre Nachricht erhalten und meldet sich bei Ihnen zurück.
    </p>
    <p style="font-size:14px;line-height:1.6;color:#64748b;">
      Es findet keine automatische Kaltakquise statt. Es werden keine
      SMS- oder WhatsApp-Nachrichten ohne bewusste Freigabe versendet.
    </p>
  `);
}

/**
 * Willkommensmail nach Trial-Start mit expliziten Hinweisen:
 * - 14 Tage Testphase
 * - keine Kreditkarte
 * - keine echten Nachrichten ohne Provider-Konfiguration
 * Absender: ClinicSlotHub Team (kein persönlicher Name).
 */
export function trialWelcomeEmail(
  praxisName: string,
  dashboardUrl?: string,
): string {
  const safeName = escapeHtml(praxisName);
  const safeUrl = escapeHtml(dashboardUrl ?? `${PUBLIC_APP_URL}/dashboard`);
  return layout(`
    <p style="font-size:15px;line-height:1.6;">
      Willkommen bei <strong>${escapeHtml(BRAND_NAME)}</strong>, ${safeName}!
    </p>
    <p style="font-size:15px;line-height:1.6;">
      Ihre <strong>14-tägige Testphase</strong> hat begonnen. Hier ist, was Sie wissen müssen:
    </p>
    <ul style="font-size:14px;line-height:1.8;color:#334155;padding-left:20px;">
      <li>Keine Kreditkarte erforderlich für die Testphase</li>
      <li>Keine echten SMS oder WhatsApp-Nachrichten ohne bewusste Provider-Konfiguration</li>
      <li>Patientennachrichten werden vorbereitet und simuliert, bis Sie einen Anbieter aktivieren</li>
      <li>Alle Daten werden datenschutzbewusst verarbeitet</li>
    </ul>
    <p style="font-size:15px;line-height:1.6;">
      <strong>Nächster Schritt:</strong> Richten Sie Ihre erste Testpraxis ein und legen Sie
      Patienten auf die Warteliste.
    </p>
    <p style="margin-top:24px;">
      <a href="${safeUrl}"
         style="display:inline-block;background:#2563eb;color:#ffffff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
        Zum Dashboard
      </a>
    </p>
  `);
}

/**
 * Vorlage für die Testpraxis-Kommunikation.
 * Keine private Telefonnummer. Keine private E-Mail. Kein privater Name.
 */
export function testPracticeEmail(praxisName: string): string {
  const safeName = escapeHtml(praxisName);
  return layout(`
    <p style="font-size:15px;line-height:1.6;">
      Hallo ${safeName},
    </p>
    <p style="font-size:15px;line-height:1.6;">
      Sie nehmen an der <strong>${escapeHtml(BRAND_NAME)}-Testphase</strong> teil.
    </p>
    <p style="font-size:14px;line-height:1.6;color:#334155;">
      Während der Testphase werden keine echten SMS oder WhatsApp-Nachrichten an Patienten
      versendet. Alle Nachrichten werden nur vorbereitet (Dry-Run), bis Sie den
      Messaging-Anbieter bewusst aktivieren.
    </p>
    <p style="font-size:14px;line-height:1.6;color:#334155;">
      Bei Fragen steht Ihnen das ${escapeHtml(BRAND_TEAM_NAME)}-Team zur Verfügung.
    </p>
  `);
}

// NUR vorbereitet – NICHT aktiv nutzen. Der Supabase-Auth-Passwort-Reset
// bleibt unverändert.
export function passwordResetTemplate(resetUrl: string): string {
  const safeUrl = escapeHtml(resetUrl);
  return layout(
    `<p style="font-size:15px;line-height:1.6;">
       <a href="${safeUrl}" style="color:#2563eb;">${safeUrl}</a>
     </p>`,
  );
}
