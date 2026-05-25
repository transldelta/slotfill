import { NextResponse } from "next/server";
import { runMaintenance } from "@/lib/maintenance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Geschützter Cron-Endpunkt für regelmäßige sichere Reparaturen.
// Vercel-Cron sendet GET; ein manueller Aufruf per POST wird ebenfalls
// unterstützt. Absicherung über Authorization: Bearer <CRON_SECRET>.
async function handle(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  const result = await runMaintenance(false);
  return NextResponse.json({ code: "MAINTENANCE_REPAIRED", ...result });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
