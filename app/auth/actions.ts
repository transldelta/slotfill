"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient, createServerClient } from "@/lib/supabase";
import { getTranslations } from "@/lib/i18n";
import { sendEmail } from "@/lib/email";
import { welcomeEmail } from "@/lib/email/templates";

// Rückgabe-Form für die Formulare im Browser.
export type ActionResult = {
  success?: boolean;
  message?: string;
  error?: string;
  // Maschinenlesbarer Code (Registrierung); Frontend übersetzt ihn aus de.json.
  code?: string;
};

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Übersetzt eine Supabase-Auth-Fehlermeldung in einen maschinenlesbaren Code.
function mapSignUpError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("already") || m.includes("registered") || m.includes("exists")) {
    return "EMAIL_TAKEN";
  }
  if (m.includes("password")) return "WEAK_PASSWORD";
  if (m.includes("rate") || m.includes("too many")) return "RATE_LIMITED";
  return "AUTH_SIGNUP_ERROR";
}

// --- Registrierung -------------------------------------------------
export async function signUp(formData: FormData): Promise<ActionResult> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { code: "VALIDATION_ERROR" };
  }
  const { email, password } = parsed.data;
  const name =
    (formData.get("name") as string | null)?.trim() || email.split("@")[0];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const supabase = createServerClient();

  let data;
  try {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${appUrl}/auth/login` },
    });
    data = result.data;
    if (result.error) {
      // Echte Fehlermeldung serverseitig protokollieren (keine Secrets).
      console.error("[signUp] Supabase-Auth-Fehler:", result.error.message);
      const code = mapSignUpError(result.error.message);
      return code === "EMAIL_TAKEN" ? { code: "EMAIL_TAKEN" } : { code };
    }
  } catch (err) {
    console.error("[signUp] Unerwarteter Auth-Fehler:", err);
    return { code: "AUTH_SIGNUP_ERROR" };
  }

  // Bereits vergebene E-Mail (Enumeration-Schutz): leere identities-Liste.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { code: "EMAIL_TAKEN" };
  }

  const userId = data.user?.id;
  if (!userId) {
    console.error("[signUp] Kein Benutzer trotz fehlendem Auth-Fehler.");
    return { code: "AUTH_SIGNUP_ERROR" };
  }

  // Praxis und Test-Abo serverseitig anlegen (Service-Role umgeht RLS).
  const admin = createClient();

  const { data: practice, error: practiceError } = await admin
    .from("practices")
    .insert({ auth_uid: userId, name, email })
    .select("id")
    .single();

  if (practiceError || !practice) {
    console.error("[signUp] Praxis konnte nicht angelegt werden:", practiceError?.message);
    return { code: "PRACTICE_CREATE_ERROR" };
  }

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);
  const { error: subError } = await admin.from("subscriptions").insert({
    practice_id: practice.id,
    plan_id: null, // "Starter"-Plan wird beim ersten Laden zugeordnet.
    status: "trial",
    trial_ends_at: trialEndsAt.toISOString(),
  });
  if (subError) {
    // Nicht fatal: Abo wird später per getOrCreatePracticeSubscription erzeugt.
    console.error("[signUp] Abo konnte nicht angelegt werden:", subError.message);
  }

  // Willkommens-E-Mail senden – Fehler blockieren die Registrierung NICHT.
  // Versuch wird in email_logs protokolliert.
  const t = await getTranslations();
  try {
    const mail = await sendEmail(
      email,
      t("email.welcomeSubject"),
      welcomeEmail(t, name),
    );
    await admin.from("email_logs").insert({
      practice_id: practice.id,
      email_type: "welcome",
      recipient: email,
      success: mail.success,
      error_message: mail.success ? null : (mail.code ?? null),
    });
  } catch (err) {
    console.error("[signUp] Willkommens-E-Mail fehlgeschlagen (ignoriert):", err);
  }

  return { success: true, code: "REGISTRATION_CREATED" };
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
