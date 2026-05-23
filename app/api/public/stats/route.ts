import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET /api/public/stats – ÖFFENTLICH: nur aggregierte Zahlen, keine Praxisdetails.
export async function GET() {
  const admin = createClient();

  const now = new Date();
  const todayStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );

  const [practicesRes, filledRes, filledTodayRes] = await Promise.all([
    admin
      .from("practices")
      .select("*", { count: "exact", head: true })
      .not("banned", "is", true),
    admin
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("status", "filled"),
    admin
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("status", "filled")
      .gte("updated_at", todayStart.toISOString()),
  ]);

  return NextResponse.json({
    code: "PUBLIC_STATS_LOADED",
    stats: {
      totalPractices: practicesRes.count ?? 0,
      totalFilledAppointments: filledRes.count ?? 0,
      filledToday: filledTodayRes.count ?? 0,
    },
  });
}
