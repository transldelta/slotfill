import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET /api/plans – ÖFFENTLICH: alle Pläne, sortiert nach Preis.
export async function GET() {
  const admin = createClient();

  const { data: plans, error } = await admin
    .from("plans")
    .select(
      "id, plan_key, name, price_monthly, max_patients, max_notifications_per_month, feature_keys, stripe_price_id",
    )
    .order("price_monthly", { ascending: true });

  if (error) {
    console.error("[GET /api/plans] Laden fehlgeschlagen:", error);
    return NextResponse.json({ code: "PLANS_ERROR" }, { status: 500 });
  }

  // Nur konfigurierte Pläne (plan_key gesetzt) zurückgeben.
  const result = (plans ?? []).filter((p) => Boolean(p.plan_key));

  return NextResponse.json({ code: "PLANS_LOADED", plans: result });
}
