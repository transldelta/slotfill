import { NextResponse } from "next/server";
import { runOperationsCheck } from "@/lib/operations-agent";
import { runSecurityCheck } from "@/lib/security-agent";
import { writeAuditLog } from "@/lib/audit-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handle(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  const operations = await runOperationsCheck();
  const security = runSecurityCheck();
  const status =
    operations.status === "critical" || security.status === "critical"
      ? "critical"
      : operations.status === "warning" || security.status === "warning"
        ? "warning"
        : "healthy";

  await writeAuditLog({
    action: "cron_operations_security_check",
    area: "cron",
    metadata: { status },
  });

  return NextResponse.json({
    code: "OPERATIONS_SECURITY_CHECK_DONE",
    status,
    operations,
    security,
    generatedAt: new Date().toISOString(),
  });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
