import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/test-email
 *
 * Sendet eine Test-E-Mail an ADMIN_NOTIFICATION_EMAIL (oder Fallback).
 * Nur für Admins zugänglich.
 * Kein Secret in der Response. Nur sanitized Fehlermeldung.
 */
export async function POST(): Promise<NextResponse> {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ ok: false, error: "ACCESS_DENIED" }, { status: 403 });
  }

  const adminEmail =
    process.env.ADMIN_NOTIFICATION_EMAIL ??
    process.env.CONTACT_EMAIL ??
    "transl.delta@gmail.com";

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev (default)";
  const hasApiKey = !!process.env.RESEND_API_KEY;

  // Konfiguration loggen (ohne Secrets)
  console.log(
    `[test-email] config: RESEND_API_KEY=${hasApiKey} | from="${fromEmail}" | to="${adminEmail}"`,
  );

  const html = `<!doctype html>
<html lang="en">
<body style="margin:0;background:#f1f5f9;padding:24px;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;">
    <div style="font-size:13px;font-weight:600;color:#64748b;margin-bottom:16px;text-transform:uppercase;">
      ClinicSlotHub · Admin Notification Test
    </div>
    <p style="font-size:15px;margin:0 0 12px;">This is a ClinicSlotHub admin notification test.</p>
    <p style="font-size:13px;color:#64748b;margin:0;">
      If you received this email, admin notifications are working correctly.<br/>
      Recipient: <strong>${adminEmail}</strong>
    </p>
  </div>
</body>
</html>`;

  const result = await sendEmail(
    adminEmail,
    "ClinicSlotHub admin email test",
    html,
  );

  if (result.success) {
    console.log(`[test-email] success → ${adminEmail}`);
    return NextResponse.json({ ok: true, to: adminEmail });
  }

  // Fehler sanitized zurückgeben – kein API-Key, keine internen Details
  const sanitized = sanitizeErrorCode(result.code);
  console.warn(`[test-email] failed: ${result.code}`);
  return NextResponse.json(
    { ok: false, error: sanitized, to: adminEmail },
    { status: 500 },
  );
}

function sanitizeErrorCode(code: string): string {
  if (code === "RESEND_CONFIG_MISSING") {
    return "RESEND_API_KEY is not configured in environment variables.";
  }
  if (code === "RESEND_API_KEY_INVALID") {
    return "RESEND_API_KEY is set but invalid or unauthorized.";
  }
  if (code === "RESEND_DOMAIN_NOT_VERIFIED") {
    return "Sender domain is not verified in Resend.";
  }
  if (code === "RESEND_FROM_EMAIL_INVALID") {
    return "RESEND_FROM_EMAIL is not allowed. Use a verified domain or onboarding@resend.dev.";
  }
  if (code === "RESEND_RECIPIENT_BLOCKED") {
    return "Recipient is blocked. In Resend test mode, only verified email addresses can receive emails.";
  }
  if (code.startsWith("RESEND_UNKNOWN_ERROR")) {
    return "Resend returned an unknown error. Check Vercel logs for details.";
  }
  return "Email send failed. Check Vercel runtime logs for details (no secrets logged).";
}
