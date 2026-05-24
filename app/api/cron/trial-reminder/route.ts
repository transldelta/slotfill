import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { getTranslations } from "@/lib/i18n";
import { sendEmail } from "@/lib/email";
import { trialReminderEmail } from "@/lib/email/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/cron/trial-reminder – sendet Erinnerungen für bald endende Testphasen.
// Geschützt über Authorization: Bearer <CRON_SECRET>.
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ code: "EMAIL_DISABLED", count: 0 });
  }

  const admin = createClient();
  const now = new Date();
  const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  // Abos in Testphase, deren Ende in <= 3 Tagen liegt, noch nicht erinnert.
  const { data: subs, error } = await admin
    .from("subscriptions")
    .select("id, practice_id, trial_ends_at, practices ( name, email, banned )")
    .eq("status", "trial")
    .is("trial_reminder_sent_at", null)
    .gt("trial_ends_at", now.toISOString())
    .lte("trial_ends_at", inThreeDays.toISOString());

  if (error) {
    console.error("[cron/trial-reminder] Laden fehlgeschlagen:", error);
    return NextResponse.json({ code: "SERVER_ERROR" }, { status: 500 });
  }

  const t = await getTranslations();
  let count = 0;

  for (const sub of subs ?? []) {
    const practice = Array.isArray(sub.practices)
      ? sub.practices[0]
      : sub.practices;
    if (!practice || practice.banned === true || !practice.email) continue;

    const daysLeft = Math.max(
      1,
      Math.ceil(
        (new Date(sub.trial_ends_at).getTime() - now.getTime()) /
          (24 * 60 * 60 * 1000),
      ),
    );

    const result = await sendEmail(
      practice.email,
      t("email.trialReminderSubject"),
      trialReminderEmail(t, practice.name ?? "", daysLeft),
    );

    await admin.from("email_logs").insert({
      practice_id: sub.practice_id,
      email_type: "trial_reminder",
      recipient: practice.email,
      success: result.success,
      error_message: result.success ? null : (result.code ?? null),
    });

    if (result.success) {
      await admin
        .from("subscriptions")
        .update({ trial_reminder_sent_at: new Date().toISOString() })
        .eq("id", sub.id);
      count += 1;
    }
  }

  return NextResponse.json({ code: "TRIAL_REMINDERS_SENT", count });
}
