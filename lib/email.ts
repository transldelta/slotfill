export type SendEmailResult = {
  success: boolean;
  // Maschinenlesbarer Code; bei Fehlern eine gekürzte Diagnose (kein Secret).
  code: string;
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

// Ordnet eine Resend-Fehlermeldung einem aussagekräftigen Code zu.
// Es werden niemals API-Keys oder vollständige Antworten geloggt.
export function classifyResendError(message: string): string {
  const m = message.toLowerCase();
  if (
    m.includes("api key") ||
    m.includes("api_key") ||
    m.includes("unauthorized") ||
    m.includes("invalid token") ||
    m.includes("restricted")
  ) {
    return "RESEND_API_KEY_INVALID";
  }
  if (m.includes("domain") && (m.includes("verif") || m.includes("not found"))) {
    return "RESEND_DOMAIN_NOT_VERIFIED";
  }
  if (
    m.includes("only send testing emails") ||
    m.includes("can only send") ||
    m.includes("recipient")
  ) {
    return "RESEND_RECIPIENT_BLOCKED";
  }
  if (m.includes("from") && (m.includes("invalid") || m.includes("not allowed"))) {
    return "RESEND_FROM_EMAIL_INVALID";
  }
  return `RESEND_UNKNOWN_ERROR: ${message.slice(0, 120)}`;
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
    return { success: false, code: "RESEND_CONFIG_MISSING" };
  }

  const from =
    process.env.RESEND_FROM_EMAIL || "Clentra <onboarding@resend.dev>";

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) {
      const code = classifyResendError(error.message ?? "");
      console.error("[email] Versand fehlgeschlagen:", code);
      return { success: false, code };
    }
    return { success: true, code: "EMAIL_SENT" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    const code = classifyResendError(msg);
    console.error("[email] Unerwarteter Fehler:", code);
    return { success: false, code };
  }
}
