import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { messagingStatus } from "@/lib/messaging";

export const dynamic = "force-dynamic";

// GET /api/health – Health-Check. Liefert nur Status & ob Dienste konfiguriert
// sind (configured/not_configured). Niemals Secrets.
export async function GET() {
  let dbOk = false;
  try {
    const admin = createClient();
    const { error } = await admin
      .from("plans")
      .select("id", { count: "exact", head: true });
    dbOk = !error;
  } catch {
    dbOk = false;
  }

  const messaging = messagingStatus();
  const services = {
    database: dbOk ? "configured" : "not_configured",
    stripe: process.env.STRIPE_SECRET_KEY ? "configured" : "not_configured",
    resend: process.env.RESEND_API_KEY ? "configured" : "not_configured",
    messaging:
      messaging.provider !== "none" && messaging.activeConfigured
        ? "configured"
        : "not_configured",
  };

  return NextResponse.json(
    { code: "HEALTH_OK", status: dbOk ? "ok" : "degraded", services },
    { status: dbOk ? 200 : 503 },
  );
}
