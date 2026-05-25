import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";
import { messagingStatus } from "@/lib/messaging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/admin/messaging-setup/check – Status des Nachrichten-Anbieters.
// Es werden niemals Secrets zurückgegeben.
export async function POST() {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "ACCESS_DENIED" }, { status: 403 });
  }
  return NextResponse.json({ code: "MESSAGING_STATUS", ...messagingStatus() });
}
