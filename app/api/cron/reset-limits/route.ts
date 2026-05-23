import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET /api/cron/reset-limits – setzt den monatlichen Zähler zurück.
// Geschützt über Authorization: Bearer <CRON_SECRET>. Vercel-Cron sendet
// diesen Header automatisch, wenn CRON_SECRET als Env-Variable gesetzt ist.
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  const admin = createClient();
  const { data, error } = await admin
    .from("subscriptions")
    .update({
      notifications_used_this_month: 0,
      updated_at: new Date().toISOString(),
    })
    .eq("status", "active")
    .select("id");

  if (error) {
    console.error("[GET /api/cron/reset-limits] Fehler:", error);
    return NextResponse.json({ code: "SERVER_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ code: "LIMITS_RESET", count: data?.length ?? 0 });
}
