import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/admin/auto-maintenance/logs – letzte Reparatur-Protokolle.
export async function GET() {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "ACCESS_DENIED" }, { status: 403 });
  }
  const { admin } = ctx;

  const { data, error } = await admin
    .from("maintenance_logs")
    .select("id, created_at, problem_type, action, result, dry_run")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    // Tabelle evtl. nicht vorhanden -> leeres Protokoll, kein Absturz.
    return NextResponse.json({ code: "LOGS_LOADED", logs: [] });
  }

  return NextResponse.json({ code: "LOGS_LOADED", logs: data ?? [] });
}
