import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID ?? "";
const authToken = process.env.TWILIO_AUTH_TOKEN ?? "";
const whatsappFrom = process.env.TWILIO_WHATSAPP_NUMBER ?? "";

// Prüft, ob alle Twilio-Zugangsdaten gesetzt sind.
export function isTwilioConfigured(): boolean {
  return Boolean(accountSid && authToken && whatsappFrom);
}

// Sendet eine WhatsApp-Nachricht über Twilio (Sandbox oder Produktion).
// Gibt bei Erfolg die Nachrichten-SID zurück, sonst einen Fehlercode.
export async function sendWhatsApp(
  to: string,
  body: string,
): Promise<{ sid?: string; error?: string }> {
  if (!isTwilioConfigured()) {
    console.error(
      "[sendWhatsApp] Twilio ist nicht konfiguriert – TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_WHATSAPP_NUMBER prüfen.",
    );
    return { error: "TWILIO_NOT_CONFIGURED" };
  }

  try {
    const client = twilio(accountSid, authToken);
    const message = await client.messages.create({
      from: `whatsapp:${whatsappFrom}`,
      to: `whatsapp:${to}`,
      body,
    });
    return { sid: message.sid };
  } catch (err) {
    console.error("[sendWhatsApp] Versand fehlgeschlagen:", err);
    return { error: "SEND_FAILED" };
  }
}
