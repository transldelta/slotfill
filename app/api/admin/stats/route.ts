import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin";

export const dynamic = "force-dynamic";

// GET /api/admin/stats – aggregierte Kennzahlen für das Admin-Panel.
export async function GET() {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "ACCESS_DENIED" }, { status: 403 });
  }
  const { admin } = ctx;

  const [
    totalPracticesRes,
    activeRes,
    trialRes,
    notificationsRes,
    filledRes,
    closedRes,
    activeSubsRes,
  ] = await Promise.all([
    admin.from("practices").select("*", { count: "exact", head: true }),
    admin
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    admin
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "trial"),
    admin.from("sent_notifications").select("*", { count: "exact", head: true }),
    admin
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("status", "filled"),
    admin
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .in("status", ["cancelled", "filled"]),
    admin
      .from("subscriptions")
      .select("plans(price_monthly)")
      .eq("status", "active"),
  ]);

  // MRR: Summe der Monatspreise aller aktiven Abos.
  const mrr = (activeSubsRes.data ?? []).reduce((sum: number, row) => {
    const plan = Array.isArray(row.plans) ? row.plans[0] : row.plans;
    return sum + (Number(plan?.price_monthly) || 0);
  }, 0);

  const filled = filledRes.count ?? 0;
  const closed = closedRes.count ?? 0;
  const fillRate = closed > 0 ? Math.round((1000 * filled) / closed) / 10 : 0;

  return NextResponse.json({
    code: "ADMIN_STATS_LOADED",
    stats: {
      totalPractices: totalPracticesRes.count ?? 0,
      activePractices: activeRes.count ?? 0,
      trialPractices: trialRes.count ?? 0,
      mrr,
      // TODO: später durch echte Stripe-Invoice-Umsätze ersetzen
      totalRevenue: mrr,
      notificationsSent: notificationsRes.count ?? 0,
      fillRate,
    },
  });
}
