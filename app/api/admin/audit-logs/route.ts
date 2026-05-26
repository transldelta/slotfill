import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";
import { getRecentAuditLogs } from "@/lib/audit-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/admin/audit-logs – letzte Audit-Einträge (nur Admins, keine Secrets).
export async function GET() {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "ACCESS_DENIED" }, { status: 403 });
  }
  const logs = await getRecentAuditLogs(50);
  return NextResponse.json({ code: "AUDIT_LOGS_LOADED", logs });
}
