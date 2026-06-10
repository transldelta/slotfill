"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";
import { contactConfirmationEmail } from "@/lib/email/templates";
import { sendContactAdminNotification } from "@/lib/admin-notifications";
// CONTACT_EMAIL aus lib/brand.ts ist der Standard-Empfänger für Admin-Benachrichtigungen.
// Der tatsächliche Versand läuft über ADMIN_NOTIFICATION_EMAIL ?? CONTACT_EMAIL (in admin-notifications.ts).
import { CONTACT_EMAIL } from "@/lib/brand";

const schema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  message: z.string().trim().min(1),
  locale: z.string().trim().max(10).optional().default("de"),
});

// Verarbeitet das Kontaktformular.
//
// Ablauf (immer in dieser Reihenfolge):
//   1. Validierung
//   2. DB-Insert in contact_messages (immer, unabhängig vom E-Mail-Status)
//   3. Admin-Benachrichtigung – awaited in try/catch (kein fire-and-forget)
//   4. Eingangsbestätigung an den Absender – awaited in try/catch
//
// Regeln:
// - DB-Insert immer. Anfrage geht nie verloren.
// - E-Mail-Fehler crashen das Formular nicht – nur in DB gespeichert.
// - Kein persönlicher Name als Absender.
// - Keine Kaltakquise. Keine privaten Adressen.
// - Keine sensiblen Daten in Logs. Kein API-Key in Logs.
export async function submitContact(
  formData: FormData,
): Promise<{ code: "CONTACT_SENT" | "CONTACT_STORED" | "CONTACT_ERROR" }> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
    locale: formData.get("locale") ?? "de",
  });
  if (!parsed.success) {
    return { code: "CONTACT_ERROR" };
  }
  const { name, email, message, locale } = parsed.data;

  // ── 1. Immer in DB speichern ─────────────────────────────────────────────
  const admin = createClient();
  const { data: saved, error: dbError } = await admin
    .from("contact_messages")
    .insert({ name, email, message, locale })
    .select("id, created_at")
    .single();

  if (dbError || !saved) {
    console.error("[submitContact] DB-Insert fehlgeschlagen:", dbError?.message);
    return { code: "CONTACT_ERROR" };
  }

  // ── 2. Admin-Benachrichtigung (awaited – kein fire-and-forget) ────────────
  // Fehler werden geloggt, brechen aber den Erfolg nicht ab.
  try {
    await sendContactAdminNotification({
      name,
      email,
      message,
      locale,
      createdAt: saved.created_at ?? undefined,
    });
  } catch (err) {
    console.warn(
      "[submitContact] Admin-Notification Fehler:",
      err instanceof Error ? err.message : "unknown",
    );
  }

  // ── 3. Eingangsbestätigung an den Absender (awaited) ─────────────────────
  // Nur wenn RESEND_API_KEY gesetzt. Fehler dürfen den Erfolg nicht kaputt machen.
  try {
    const confirmResult = await sendEmail(
      email,
      "Wir haben Ihre Anfrage erhalten – ClinicSlotHub",
      contactConfirmationEmail(name),
    );
    if (!confirmResult.success) {
      console.warn(
        `[submitContact] Eingangsbestätigung nicht gesendet: ${confirmResult.code}`,
      );
    }
  } catch (err) {
    console.warn(
      "[submitContact] Bestätigungs-E-Mail Fehler:",
      err instanceof Error ? err.message : "unknown",
    );
  }

  // CONTACT_SENT = Anfrage gespeichert (unabhängig vom E-Mail-Status)
  return { code: "CONTACT_SENT" };
}
