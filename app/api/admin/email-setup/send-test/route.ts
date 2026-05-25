import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";
import { getTranslations } from "@/lib/i18n";
import { escapeHtml, sendEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/admin/email-setup/send-test – sendet eine Test-E-Mail an die
// eigene Admin-Adresse (vermeidet Empfänger-Sperren im Resend-Testmodus).
export async function POST() {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "ACCESS_DENIED" }, { status: 403 });
  }

  const recipient = ctx.user.email;
  if (!recipient) {
    return NextResponse.json({ code: "NO_RECIPIENT" }, { status: 400 });
  }

  const t = await getTranslations();
  const html = `<p>${escapeHtml(t("admin.emailSetup.testBody"))}</p>`;
  const result = await sendEmail(recipient, t("admin.emailSetup.testSubject"), html);

  return NextResponse.json({
    code: result.success ? "TEST_EMAIL_SENT" : "TEST_EMAIL_FAILED",
    recipient,
    diagnosis: result.success ? null : result.code,
  });
}
