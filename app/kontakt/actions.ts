"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase";
import { escapeHtml, sendEmail } from "@/lib/email";
import { contactConfirmationEmail } from "@/lib/email/templates";
import { BRAND_TEAM_NAME, CONTACT_EMAIL } from "@/lib/brand";

const schema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  message: z.string().trim().min(1),
});

// Verarbeitet das Kontaktformular.
//
// Wenn RESEND_API_KEY gesetzt ist:
//   1. Weiterleitung an CONTACT_EMAIL (intern)
//   2. Eingangsbestätigung an den Absender (Absendername: "PraxisFlow Team")
// Wenn kein API-Key oder Fehler:
//   - Nachricht in contact_messages speichern → CONTACT_STORED
//   - UI zeigt ehrlich: "Anfrage wurde vorbereitet. E-Mail-Versand ist noch nicht konfiguriert."
// Bei ungültigen Daten oder DB-Fehler: CONTACT_ERROR
//
// Kein persönlicher Name im Absender. Keine Kaltakquise. Keine privaten Adressen.
export async function submitContact(
  formData: FormData,
): Promise<{ code: "CONTACT_SENT" | "CONTACT_STORED" | "CONTACT_ERROR" }> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { code: "CONTACT_ERROR" };
  }
  const { name, email, message } = parsed.data;

  // Interne Weiterleitung – Absender ist CONTACT_EMAIL (kein persönlicher Name).
  const to = CONTACT_EMAIL;
  const internalHtml = `
<p><strong>Name:</strong> ${escapeHtml(name)}</p>
<p><strong>E-Mail:</strong> ${escapeHtml(email)}</p>
<p style="white-space:pre-wrap;">${escapeHtml(message)}</p>
<hr style="margin:16px 0;" />
<p style="font-size:12px;color:#94a3b8;">
  Eingang über das Kontaktformular – ${escapeHtml(BRAND_TEAM_NAME)}.
  Keine automatische Kaltakquise. Antwort erfolgt manuell.
</p>`;

  const internalResult = await sendEmail(
    to,
    `Neue Kontaktanfrage: ${escapeHtml(name)}`,
    internalHtml,
  );

  if (internalResult.success) {
    // Eingangsbestätigung an den Absender
    // Absender: "PraxisFlow Team" – kein persönlicher Name
    await sendEmail(
      email,
      "Wir haben Ihre Anfrage erhalten – PraxisFlow",
      contactConfirmationEmail(name),
    ).catch((err) => {
      // Darf das Onboarding nicht crashen – nur loggen
      console.error("[submitContact] Eingangsbestätigung fehlgeschlagen:", err);
    });
    return { code: "CONTACT_SENT" };
  }

  // Kein Versand möglich (kein Key oder Fehler) -> Nachricht speichern.
  const admin = createClient();
  const { error } = await admin
    .from("contact_messages")
    .insert({ name, email, message });
  if (error) {
    console.error("[submitContact] Speichern fehlgeschlagen:", error);
    return { code: "CONTACT_ERROR" };
  }
  return { code: "CONTACT_STORED" };
}
