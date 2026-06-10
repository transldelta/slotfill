import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getTranslations } from "@/lib/i18n";
import { sendEmail } from "@/lib/email";
import { welcomeEmail } from "@/lib/email/templates";

export type OnboardedPractice = { id: string; name: string };

// ── Slug-Generierung ──────────────────────────────────────────────────────────
// Erzeugt einen URL-sicheren Slug aus dem Praxisnamen.
// Wird beim Anlegen einer neuen Praxis aufgerufen und als Einzel-Check
// gegen bestehende Slugs gesichert (Retry mit Zähler-Suffix bei Kollision).

/** Wandelt einen String in einen URL-sicheren Slug um. */
export function generateSlugBase(name: string): string {
  const umlautMap: Record<string, string> = {
    ä: "ae", ö: "oe", ü: "ue", ß: "ss",
    Ä: "ae", Ö: "oe", Ü: "ue",
  };
  let s = name.toLowerCase();
  s = s.replace(/[äöüßÄÖÜ]/g, (c) => umlautMap[c] ?? c);
  s = s.replace(/[^a-z0-9]+/g, "-");
  s = s.replace(/^-+|-+$/g, "");
  return s.slice(0, 80) || "praxis";
}

/** Erzeugt einen eindeutigen Slug (prüft DB; fügt -2, -3 an bei Kollision). */
async function resolveUniqueSlug(
  admin: SupabaseClient,
  name: string,
  excludeId?: string,
): Promise<string> {
  const base = generateSlugBase(name);
  let candidate = base;
  let counter = 2;
  for (;;) {
    const q = admin
      .from("practices")
      .select("id")
      .eq("slug", candidate)
      .limit(1);
    const { data } = await q;
    const existing = (data ?? []) as { id: string }[];
    if (
      existing.length === 0 ||
      (excludeId && existing.length === 1 && existing[0].id === excludeId)
    ) {
      return candidate;
    }
    candidate = `${base}-${counter}`;
    counter++;
    if (counter > 99) return `${base}-${Date.now()}`; // Sicherheits-Fallback
  }
}

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

  // Slug vor dem INSERT generieren (eindeutig prüfen)
  const slug = await resolveUniqueSlug(admin, name);

  const { data: created, error: insertError } = await admin
    .from("practices")
    .insert({ auth_uid: user.id, name, email: user.email ?? null, slug })
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
