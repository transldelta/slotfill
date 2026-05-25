// Zentrale Nachrichten-Schicht. Provider-Logik ausschließlich hier, niemals
// in Pages/Actions. Secrets bleiben serverseitig.

export type MessagingProvider = "none" | "twilio_sms" | "twilio_whatsapp";

export type MessageStatus =
  | "sent"
  | "dry_run"
  | "failed"
  | "skipped_no_provider"
  | "skipped_invalid_phone"
  | "skipped_whatsapp_template_missing";

export function getMessagingProvider(): MessagingProvider {
  const p = process.env.MESSAGING_PROVIDER;
  if (p === "twilio_sms" || p === "twilio_whatsapp") return p;
  return "none";
}

export function isDryRun(): boolean {
  return process.env.MESSAGING_DRY_RUN === "true";
}

// Übersicht für die Admin-Setup-Seite (keine Secrets!).
export function messagingStatus() {
  const hasTwilioAuth = Boolean(
    process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN,
  );
  const provider = getMessagingProvider();
  return {
    provider,
    dryRun: isDryRun(),
    smsConfigured: hasTwilioAuth && Boolean(process.env.TWILIO_SMS_FROM),
    whatsappConfigured: hasTwilioAuth && Boolean(process.env.TWILIO_WHATSAPP_FROM),
    adminTestPhone: Boolean(process.env.ADMIN_TEST_PHONE),
    // Aktiver Provider vollständig konfiguriert?
    activeConfigured:
      provider === "none"
        ? false
        : provider === "twilio_sms"
          ? hasTwilioAuth && Boolean(process.env.TWILIO_SMS_FROM)
          : hasTwilioAuth && Boolean(process.env.TWILIO_WHATSAPP_FROM),
  };
}

// Normalisiert eine Telefonnummer auf E.164. Gibt null zurück, wenn ungültig.
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.replace(/[\s()/-]/g, "");
  return /^\+[1-9]\d{6,14}$/.test(trimmed) ? trimmed : null;
}

function classifyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("not a valid phone") || m.includes("invalid 'to'")) return "INVALID_PHONE";
  if (m.includes("template") || m.includes("content")) return "WHATSAPP_TEMPLATE_REQUIRED";
  if (m.includes("unverified") || m.includes("not been verified")) return "RECIPIENT_NOT_VERIFIED";
  if (m.includes("authenticate") || m.includes("auth")) return "AUTH_FAILED";
  return `SEND_FAILED: ${message.slice(0, 100)}`;
}

// Versendet das Termin-Angebot. Kein Versand, wenn kein Provider/keine Secrets;
// im Dry-Run wird der Versand simuliert (kein echter API-Call).
export async function sendAppointmentOfferMessage(input: {
  to: string | null | undefined;
  body: string;
}): Promise<{ status: MessageStatus; error?: string }> {
  const provider = getMessagingProvider();
  if (provider === "none") return { status: "skipped_no_provider" };

  const phone = normalizePhone(input.to);
  if (!phone) return { status: "skipped_invalid_phone" };

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return { status: "skipped_no_provider" };

  const fromSms = process.env.TWILIO_SMS_FROM;
  const fromWhatsApp = process.env.TWILIO_WHATSAPP_FROM;

  if (provider === "twilio_sms" && !fromSms) return { status: "skipped_no_provider" };
  if (provider === "twilio_whatsapp") {
    if (!fromWhatsApp) return { status: "skipped_no_provider" };
    // WhatsApp benötigt eine genehmigte Vorlage (Content SID). Fehlt sie,
    // wird NICHT gesendet, sondern verständlich übersprungen.
    if (!process.env.TWILIO_WHATSAPP_CONTENT_SID) {
      return { status: "skipped_whatsapp_template_missing" };
    }
  }

  // Dry-Run: kein echter Versand und KEIN "sent"-Status (keine echte Nachricht).
  if (isDryRun()) {
    console.log(`[messaging] DRY_RUN (${provider}) -> ${phone}`);
    return { status: "dry_run" };
  }

  try {
    const twilio = (await import("twilio")).default;
    const client = twilio(sid, token);

    if (provider === "twilio_sms") {
      await client.messages.create({ from: fromSms!, to: phone, body: input.body });
    } else {
      // WhatsApp: Hinweis – ohne aktive Session/genehmigte Vorlage (Content SID)
      // kann der Versand scheitern. Wir senden als Freitext und melden Fehler
      // verständlich; Fake-Versand findet nicht statt.
      await client.messages.create({
        from: `whatsapp:${fromWhatsApp!}`,
        to: `whatsapp:${phone}`,
        body: input.body,
      });
    }
    return { status: "sent" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    const code = classifyError(msg);
    console.error("[messaging] Versand fehlgeschlagen:", code);
    return { status: "failed", error: code };
  }
}
