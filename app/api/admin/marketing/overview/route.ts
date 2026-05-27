/**
 * GET /api/admin/marketing/overview
 *
 * READ-ONLY Marketing-Übersicht.
 * Nur für Admins. Keine POST-Route. Keine Datenveränderung.
 * Keine Secrets in der Antwort. Kein Auto-Execution.
 */

import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";
import { getMarketingOverview } from "@/lib/marketing-agent";
import { writeAuditLog } from "@/lib/audit-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // Admin-Prüfung
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  // Optionaler Audit-Log – darf NICHT crashen
  try {
    await writeAuditLog({
      action: "marketing_overview_view",
      area: "operations",
      status: "success",
      actorUserId: ctx.user.id,
      actorEmail: ctx.user.email ?? null,
    });
  } catch (err) {
    console.error("[marketing/overview] Audit-Log fehlgeschlagen (ignoriert):", err);
  }

  try {
    const overview = await getMarketingOverview();
    return NextResponse.json(overview);
  } catch (err) {
    console.error("[GET /api/admin/marketing/overview] Fehler:", err);
    return NextResponse.json({ code: "MARKETING_OVERVIEW_ERROR" }, { status: 500 });
  }
}
