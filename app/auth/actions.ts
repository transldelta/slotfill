"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient, createServerClient } from "@/lib/supabase";
import { getTranslations } from "@/lib/i18n";

// Rückgabe-Form für die Formulare im Browser.
export type ActionResult = {
  success?: boolean;
  message?: string;
  error?: string;
};

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// --- Registrierung -------------------------------------------------
export async function signUp(formData: FormData): Promise<ActionResult> {
  const t = await getTranslations();

  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: t("common.error") };
  }
  const { email, password } = parsed.data;
  const name = (formData.get("name") as string | null)?.trim() || email.split("@")[0];

  const supabase = createServerClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  // Supabase meldet bereits vergebene E-Mails entweder per Fehler oder
  // (zum Schutz vor Enumeration) mit leerer identities-Liste.
  if (error) {
    if (error.message.toLowerCase().includes("already")) {
      return { error: t("auth.emailTaken") };
    }
    return { error: t("common.error") };
  }
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { error: t("auth.emailTaken") };
  }

  const userId = data.user?.id;
  if (userId) {
    // Praxis und Test-Abo automatisch anlegen (Service-Role umgeht RLS).
    const admin = createClient();

    const { data: practice } = await admin
      .from("practices")
      .insert({ auth_uid: userId, name, email })
      .select("id")
      .single();

    if (practice) {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14);

      await admin.from("subscriptions").insert({
        practice_id: practice.id,
        plan_id: null, // "Starter"-Plan folgt später per Seed-Script.
        status: "trial",
        trial_ends_at: trialEndsAt.toISOString(),
      });
    }

    // TODO (Schritt 10): Willkommens-E-Mail über Resend versenden.
  }

  return { success: true, message: t("auth.registrationSuccess") };
}

// --- Anmeldung -----------------------------------------------------
export async function signIn(formData: FormData): Promise<ActionResult> {
  const t = await getTranslations();

  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: t("auth.invalidCredentials") };
  }

  const supabase = createServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: t("auth.invalidCredentials") };
  }
  return { success: true };
}

// --- Abmeldung -----------------------------------------------------
export async function signOut(): Promise<void> {
  const supabase = createServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

// --- Passwort zurücksetzen ----------------------------------------
export async function resetPassword(formData: FormData): Promise<ActionResult> {
  const t = await getTranslations();

  const email = z.string().email().safeParse(formData.get("email"));
  // Aus Datenschutzgründen immer dieselbe Antwort, egal ob die E-Mail
  // existiert oder nicht (verhindert das Ausspähen von Konten).
  if (email.success) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const supabase = createServerClient();
    await supabase.auth.resetPasswordForEmail(email.data, {
      redirectTo: `${appUrl}/auth/login`,
    });
  }

  return { success: true, message: t("auth.passwordResetSent") };
}
