/**
 * GET /api/admin/ceo/overview
 *
 * READ-ONLY CEO-Übersicht.
 * Nur für Admins. Keine POST-Route. Keine Datenveränderung.
 * Keine Secrets in der Antwort.
 */

import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";
import { getCeoOverview } from "@/lib/ceo-agent";
import { writeAuditLog } from "@/lib/audit-log";
import { assertNoSecretsInResponse } from "@/lib/security-agent";

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
      action: "ceo_overview_view",
      area: "operations",
      status: "success",
      actorUserId: ctx.user.id,
      actorEmail: ctx.user.email ?? null,
    });
  } catch (err) {
    // Audit-Log-Fehler sicher loggen, Seite läuft weiter
    console.error("[ceo/overview] Audit-Log fehlgeschlagen (ignoriert):", err);
  }

  try {
    const overview = await getCeoOverview();

    // Sicherheitscheck: keine Secrets in der Antwort
    if (!assertNoSecretsInResponse(overview)) {
      console.error("[ceo/overview] Sicherheitscheck: möglicher Secret-Leak unterdrückt.");
      return NextResponse.json({ code: "CEO_OVERVIEW_ERROR" }, { status: 500 });
    }

    return NextResponse.json(overview);
  } catch (err) {
    console.error("[GET /api/admin/ceo/overview] Fehler:", err);
    return NextResponse.json({ code: "CEO_OVERVIEW_ERROR" }, { status: 500 });
  }
}
