"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase";
import { escapeHtml, sendEmail } from "@/lib/email";

const schema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  message: z.string().trim().min(1),
});

// Verarbeitet das Kontaktformular. Wenn RESEND_API_KEY gesetzt ist, wird eine
// E-Mail versendet (CONTACT_SENT). Andernfalls – oder bei Fehler – wird die
// Nachricht in contact_messages gespeichert (CONTACT_STORED). Bei ungültigen
// Daten oder DB-Fehler: CONTACT_ERROR.
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

  // Per E-Mail senden, wenn konfiguriert (zentrale sendEmail-Funktion).
  const to = process.env.CONTACT_EMAIL ?? "transl.delta@gmail.com";
  const html = `<p><strong>Name:</strong> ${escapeHtml(name)}</p>
<p><strong>E-Mail:</strong> ${escapeHtml(email)}</p>
<p style="white-space:pre-wrap;">${escapeHtml(message)}</p>`;
  const emailResult = await sendEmail(to, `Kontaktanfrage von ${name}`, html);
  if (emailResult.success) {
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
