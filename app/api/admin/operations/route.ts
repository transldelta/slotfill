import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";
import { runOperationsCheck, runSafeMaintenance } from "@/lib/operations-agent";
import { runSecurityCheck } from "@/lib/security-agent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function combinedStatus(
  ops: "healthy" | "warning" | "critical",
  sec: "secure" | "warning" | "critical",
): "healthy" | "warning" | "critical" {
  if (ops === "critical" || sec === "critical") return "critical";
  if (ops === "warning" || sec === "warning") return "warning";
  return "healthy";
}

// GET /api/admin/operations – kombinierter Operations-/Security-Status.
export async function GET() {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const operations = await runOperationsCheck();
    const security = runSecurityCheck();
    return NextResponse.json({
      code: "OPERATIONS_STATUS_READY",
      status: combinedStatus(operations.status, security.status),
      operations,
      security,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[GET /api/admin/operations] Fehler:", err);
    return NextResponse.json({ code: "OPERATION_FAILED" }, { status: 500 });
  }
}

// POST /api/admin/operations – nur sichere Wartung (action=run_safe_maintenance).
export async function POST(request: Request) {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (body?.action !== "run_safe_maintenance") {
    return NextResponse.json({ code: "INVALID_ACTION" }, { status: 400 });
  }

  try {
    const result = await runSafeMaintenance();
    return NextResponse.json({ code: "SAFE_MAINTENANCE_DONE", result });
  } catch (err) {
    console.error("[POST /api/admin/operations] Fehler:", err);
    return NextResponse.json({ code: "OPERATION_FAILED" }, { status: 500 });
  }
}
