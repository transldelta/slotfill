export type SendEmailResult = {
  success: boolean;
  code?: "EMAIL_SENT" | "EMAIL_DISABLED" | "EMAIL_ERROR";
};

// Escaped dynamische Werte vor dem Einfügen in HTML-Templates.
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Zentrale Versandfunktion. Läuft stabil weiter, wenn kein API-Key gesetzt ist.
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY fehlt – E-Mail-Versand deaktiviert.");
    return { success: false, code: "EMAIL_DISABLED" };
  }

  const from =
    process.env.RESEND_FROM_EMAIL || "SlotFill <onboarding@resend.dev>";

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) {
      console.error("[email] Versand fehlgeschlagen.");
      return { success: false, code: "EMAIL_ERROR" };
    }
    return { success: true, code: "EMAIL_SENT" };
  } catch {
    console.error("[email] Unerwarteter Fehler beim Versand.");
    return { success: false, code: "EMAIL_ERROR" };
  }
}
