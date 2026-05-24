import type { Translator } from "@/lib/i18n";
import { escapeHtml } from "@/lib/email";

// Gemeinsames, schlichtes HTML-Layout für alle E-Mails.
function layout(innerHtml: string): string {
  return `<!doctype html><html lang="de"><body style="margin:0;background:#f1f5f9;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">
    <div style="font-size:20px;font-weight:700;margin-bottom:16px;">SlotFill</div>
    ${innerHtml}
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
