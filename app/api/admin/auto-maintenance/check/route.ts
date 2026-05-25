import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";
import { runMaintenance } from "@/lib/maintenance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/admin/auto-maintenance/check – prüft alles, verändert NICHTS.
export async function POST() {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "ACCESS_DENIED" }, { status: 403 });
  }
  const result = await runMaintenance(true);
  return NextResponse.json({ code: "MAINTENANCE_CHECKED", ...result });
}
