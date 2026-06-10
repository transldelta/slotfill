import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";
import { sendAppointmentOfferMessage } from "@/lib/messaging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/admin/messaging-setup/send-test – Test-Nachricht an ADMIN_TEST_PHONE.
export async function POST() {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "ACCESS_DENIED" }, { status: 403 });
  }

  const to = process.env.ADMIN_TEST_PHONE;
  if (!to) {
    return NextResponse.json({ code: "NO_TEST_PHONE" });
  }

  const result = await sendAppointmentOfferMessage({
    to,
    body: "ClinicSlotHub Test-Nachricht: Der Nachrichten-Versand funktioniert.",
  });

  return NextResponse.json({
    code: "TEST_MESSAGE_RESULT",
    status: result.status,
    diagnosis: result.error ?? null,
  });
}
