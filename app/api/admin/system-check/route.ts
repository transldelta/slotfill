import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";
import { getTranslations } from "@/lib/i18n";
import { sendEmail } from "@/lib/email";
import { welcomeEmail } from "@/lib/email/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Status = "ok" | "warn" | "error";
type Check = { key: string; status: Status; detail?: string };

// POST /api/admin/system-check – führt einen automatischen End-to-End-Test des
// Registrierungs-/Onboarding-/E-Mail-Flows durch und räumt die Testdaten auf.
export async function POST() {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "ACCESS_DENIED" }, { status: 403 });
  }
  const { admin } = ctx;
  const checks: Check[] = [];

  // 1. Umgebungsvariablen / Supabase-Verbindung
  const hasUrl = Boolean(process.env.SUPABASE_URL);
  const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  checks.push({
    key: "supabaseConnection",
    status: hasUrl && hasServiceKey ? "ok" : "error",
    detail: hasUrl && hasServiceKey ? undefined : "SUPABASE_URL/SERVICE_ROLE_KEY",
  });

  const hasResendKey = Boolean(process.env.RESEND_API_KEY);
  const hasResendFrom = Boolean(process.env.RESEND_FROM_EMAIL);
  checks.push({
    key: "resendConfig",
    status: hasResendKey ? (hasResendFrom ? "ok" : "warn") : "warn",
    detail: !hasResendKey
      ? "RESEND_API_KEY"
      : !hasResendFrom
        ? "RESEND_FROM_EMAIL"
        : undefined,
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  checks.push({
    key: "appUrl",
    status: appUrl.startsWith("http") ? "ok" : "warn",
    detail: appUrl || "NEXT_PUBLIC_APP_URL",
  });

  // 2. Tabellen erreichbar?
  for (const table of ["practices", "subscriptions", "email_logs"] as const) {
    const { error } = await admin
      .from(table)
      .select("*", { count: "exact", head: true });
    checks.push({
      key: `table_${table}`,
      status: error ? "error" : "ok",
      detail: error ? "nicht erreichbar (Migration ausgeführt?)" : undefined,
    });
  }

  // 3. Automatischer Testlauf (Service-Role, klar als Systemcheck markiert)
  const testEmail = `systemcheck+${Date.now()}@example.com`;
  let testUserId: string | null = null;
  let testPracticeId: string | null = null;

  const { data: createdUser, error: createErr } = await admin.auth.admin.createUser({
    email: testEmail,
    password: randomUUID(),
    email_confirm: true,
    user_metadata: { practice_name: "Systemcheck Testpraxis" },
  });

  if (createErr || !createdUser?.user) {
    checks.push({ key: "authRegistration", status: "error", detail: createErr?.message?.slice(0, 120) });
  } else {
    testUserId = createdUser.user.id;
    checks.push({ key: "authRegistration", status: "ok" });

    const { data: practice, error: pErr } = await admin
      .from("practices")
      .insert({ auth_uid: testUserId, name: "Systemcheck Testpraxis", email: testEmail })
      .select("id")
      .single();

    if (pErr || !practice) {
      checks.push({ key: "practiceCreation", status: "error", detail: pErr?.message?.slice(0, 120) });
    } else {
      testPracticeId = practice.id;
      checks.push({ key: "practiceCreation", status: "ok" });

      const trialEndsAt = new Date(Date.now() + 14 * 864e5).toISOString();
      const { error: sErr } = await admin.from("subscriptions").insert({
        practice_id: practice.id,
        plan_id: null,
        status: "trial",
        trial_ends_at: trialEndsAt,
      });
      checks.push({
        key: "trialSubscription",
        status: sErr ? "error" : "ok",
        detail: sErr?.message?.slice(0, 120),
      });

      const t = await getTranslations();
      const mail = await sendEmail(
        testEmail,
        t("email.welcomeSubject"),
        welcomeEmail(t, "Systemcheck Testpraxis"),
      );
      // Versand an example.com schlägt erwartbar fehl – das ist KEIN Fehler des
      // Systems, sondern eine Empfänger-/Konfigurationsmeldung -> Warnung.
      checks.push({
        key: "welcomeEmail",
        status: mail.success ? "ok" : "warn",
        detail: mail.success ? undefined : mail.code,
      });

      const { error: logErr } = await admin.from("email_logs").insert({
        practice_id: practice.id,
        email_type: "systemcheck",
        recipient: testEmail,
        success: mail.success,
        error_message: mail.success ? null : mail.code,
      });
      checks.push({
        key: "emailLogs",
        status: logErr ? "error" : "ok",
        detail: logErr?.message?.slice(0, 120),
      });
    }
  }

  // 4. Testdaten wieder entfernen (nur die eben angelegten Systemcheck-Daten)
  if (testPracticeId) {
    await admin.from("email_logs").delete().eq("practice_id", testPracticeId);
    await admin.from("subscriptions").delete().eq("practice_id", testPracticeId);
    await admin.from("practices").delete().eq("id", testPracticeId);
  }
  if (testUserId) {
    await admin.auth.admin.deleteUser(testUserId);
  }

  // 5. Kaputte Accounts: bestätigte Auth-User ohne Praxis
  let brokenAccounts = 0;
  try {
    const { data: usersData } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const { data: practices } = await admin.from("practices").select("auth_uid");
    const haveSet = new Set((practices ?? []).map((p) => p.auth_uid));
    brokenAccounts = (usersData?.users ?? []).filter(
      (u) =>
        u.email_confirmed_at &&
        !u.email?.startsWith("systemcheck+") &&
        !haveSet.has(u.id),
    ).length;
  } catch (err) {
    console.error("[system-check] Kaputte-Accounts-Prüfung fehlgeschlagen:", err);
  }
  checks.push({
    key: "brokenAccounts",
    status: brokenAccounts === 0 ? "ok" : "warn",
    detail: String(brokenAccounts),
  });

  return NextResponse.json({ code: "SYSTEM_CHECK_DONE", checks, brokenAccounts });
}
