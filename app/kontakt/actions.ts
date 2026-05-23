"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase";

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

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      const to = process.env.CONTACT_EMAIL ?? "transl.delta@gmail.com";
      await resend.emails.send({
        from: "SlotFill <onboarding@resend.dev>",
        to,
        reply_to: email,
        subject: `Kontaktanfrage von ${name}`,
        text: `Name: ${name}\nE-Mail: ${email}\n\n${message}`,
      });
      return { code: "CONTACT_SENT" };
    } catch (err) {
      console.error("[submitContact] Resend fehlgeschlagen, speichere stattdessen:", err);
      // Fällt durch zum Speichern.
    }
  }

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
