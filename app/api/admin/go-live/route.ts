/**
 * GET /api/admin/go-live
 *
 * READ-ONLY Go-Live-Readiness-Übersicht.
 * Nur für Admins. Keine POST-Route. Keine Datenveränderung.
 * Keine Secrets in der Antwort.
 * Alle Aufgaben: manualOnly=true, autoExecutable=false.
 */

import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";
import { runGoLiveCheck } from "@/lib/go-live-agent";
import { getConfirmations } from "@/lib/go-live-confirmations";
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
      action: "go_live_check_view",
      area: "operations",
      status: "success",
      actorUserId: ctx.user.id,
      actorEmail: ctx.user.email ?? null,
    });
  } catch (err) {
    console.error("[go-live] Audit-Log fehlgeschlagen (ignoriert):", err);
  }

  try {
    // Manuelle Bestätigungen laden (Fehler werden intern abgefangen → leere Map)
    const confirmations = await getConfirmations(ctx.admin);

    const result = runGoLiveCheck(confirmations);

    // Sicherheitscheck: keine Secrets in der Antwort
    if (!assertNoSecretsInResponse(result)) {
      console.error("[go-live] Sicherheitscheck: möglicher Secret-Leak unterdrückt.");
      return NextResponse.json({ code: "GO_LIVE_ERROR" }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/admin/go-live] Fehler:", err);
    return NextResponse.json({ code: "GO_LIVE_ERROR" }, { status: 500 });
  }
}
