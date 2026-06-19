"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient, createServerClient } from "@/lib/supabase";
import { getTranslations } from "@/lib/i18n";
import { ensureOnboarding } from "@/lib/onboarding";

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
  // SECURITY FREEZE (P1): Öffentliche Selfservice-Registrierung ist deaktiviert.
  // In der aktuellen Phase wird Praxiszugang ausschließlich nach manueller Prüfung
  // über die Kontaktseite vergeben. Diese Sperre wirkt auch bei direktem Aufruf der
  // Server Action (nicht nur im Formular). Re-Aktivierung NUR mit ausdrücklicher
  // CEO-Freigabe über ENABLE_PUBLIC_SIGNUP=true.
  if (process.env.ENABLE_PUBLIC_SIGNUP !== "true") {
    return { code: "REGISTRATION_DISABLED", error: "Registration is disabled." };
  }

  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { code: "VALIDATION_ERROR" };
  }
  const { email, password } = parsed.data;
  // Praxisname aus dem Formular. Wir lesen "practiceName" (eindeutig) und
  // fallen aus Kompatibilität auf "name" zurück; erst dann auf den E-Mail-Prefix.
  const rawName = (formData.get("practiceName") ?? formData.get("name")) as
    | string
    | null;
  const name = rawName?.trim() || email.split("@")[0];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const supabase = createServerClient();

  let data;
  try {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Praxisname in den Auth-Metadaten ablegen – das Onboarding nach der
        // E-Mail-Bestätigung liest practice_name daraus.
        data: { practice_name: name },
        emailRedirectTo: `${appUrl}/auth/callback`,
      },
    });
    data = result.data;
    if (result.error) {
      // Echte Fehlermeldung serverseitig protokollieren (keine Secrets).
      console.error("[signUp] Supabase-Auth-Fehler:", result.error.message);
      return { code: mapSignUpError(result.error.message) };
    }
  } catch (err) {
    console.error("[signUp] Unerwarteter Auth-Fehler:", err);
    return { code: "AUTH_SIGNUP_ERROR" };
  }

  // Bereits vergebene E-Mail (Enumeration-Schutz): leere identities-Liste.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { code: "EMAIL_TAKEN" };
  }

  if (!data.user) {
    console.error("[signUp] Kein Benutzer trotz fehlendem Auth-Fehler.");
    return { code: "AUTH_SIGNUP_ERROR" };
  }

  // Ist bereits eine Session vorhanden (E-Mail-Bestätigung deaktiviert), kann
  // das Onboarding sofort laufen. Andernfalls geschieht es nach der
  // Bestätigung über /auth/callback (bzw. self-healing beim ersten Dashboard).
  if (data.session) {
    try {
      const admin = createClient();
      await ensureOnboarding(admin, data.user);
    } catch (err) {
      console.error("[signUp] Onboarding fehlgeschlagen (ignoriert):", err);
    }
    return { success: true, code: "REGISTRATION_CREATED" };
  }

  return { success: true, code: "CONFIRM_EMAIL" };
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
