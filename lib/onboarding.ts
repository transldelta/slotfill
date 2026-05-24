import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getTranslations } from "@/lib/i18n";
import { sendEmail } from "@/lib/email";
import { welcomeEmail } from "@/lib/email/templates";

export type OnboardedPractice = { id: string; name: string };

// Liest den Praxisnamen aus den Auth-Metadaten (practice_name), nie der
// E-Mail-Prefix, solange ein echter Name vorhanden ist.
function resolveName(user: User): string {
  const meta = (user.user_metadata?.practice_name as string | undefined)?.trim();
  if (meta) return meta;
  return user.email ? user.email.split("@")[0] : "Meine Praxis";
}

async function findPractice(
  admin: SupabaseClient,
  userId: string,
): Promise<OnboardedPractice | null> {
  const { data } = await admin
    .from("practices")
    .select("id, name")
    .eq("auth_uid", userId)
    .order("created_at", { ascending: true })
    .limit(1);
  return (data?.[0] as OnboardedPractice | undefined) ?? null;
}

// Idempotentes Onboarding: legt für einen bestätigten Benutzer genau einmal
// Praxis, Trial-Abo, Willkommens-E-Mail und email_logs-Eintrag an. Bereits
// vorhandene Praxen werden unverändert zurückgegeben (kein zweiter Versand).
export async function ensureOnboarding(
  admin: SupabaseClient,
  user: User,
): Promise<OnboardedPractice | null> {
  const existing = await findPractice(admin, user.id);
  if (existing) return existing;

  const name = resolveName(user);

  const { data: created, error: insertError } = await admin
    .from("practices")
    .insert({ auth_uid: user.id, name, email: user.email ?? null })
    .select("id, name")
    .single();

  if (insertError || !created) {
    // 23505 = unique_violation: Praxis existiert bereits (Race) -> erneut lesen.
    if (insertError?.code === "23505") {
      return findPractice(admin, user.id);
    }
    console.error("[ensureOnboarding] Praxis konnte nicht angelegt werden:", insertError?.message);
    return null;
  }

  // Trial-Abo anlegen (nicht fatal).
  const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
  const { error: subError } = await admin.from("subscriptions").insert({
    practice_id: created.id,
    plan_id: null,
    status: "trial",
    trial_ends_at: trialEndsAt,
  });
  if (subError) {
    console.error("[ensureOnboarding] Abo konnte nicht angelegt werden:", subError.message);
  }

  // Willkommens-E-Mail – Fehler blockieren das Onboarding NICHT, werden aber
  // in email_logs protokolliert.
  if (user.email) {
    const t = await getTranslations();
    let mail: { success: boolean; code?: string } = {
      success: false,
      code: "EMAIL_ERROR",
    };
    try {
      mail = await sendEmail(
        user.email,
        t("email.welcomeSubject"),
        welcomeEmail(t, name),
      );
    } catch (err) {
      console.error("[ensureOnboarding] Willkommens-E-Mail Ausnahme:", err);
    }
    const { error: logError } = await admin.from("email_logs").insert({
      practice_id: created.id,
      email_type: "welcome",
      recipient: user.email,
      success: mail.success,
      error_message: mail.success ? null : (mail.code ?? "EMAIL_ERROR"),
    });
    if (logError) {
      console.error("[ensureOnboarding] email_logs-Insert fehlgeschlagen:", logError.message);
    }
  }

  return created;
}
