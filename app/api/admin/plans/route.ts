import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminContext } from "@/lib/admin";

export const dynamic = "force-dynamic";

const PLAN_COLUMNS =
  "id, plan_key, name, price_monthly, max_patients, max_notifications_per_month, feature_keys, stripe_price_id";

// GET /api/admin/plans – alle Pläne.
export async function GET() {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "ACCESS_DENIED" }, { status: 403 });
  }
  const { admin } = ctx;

  const { data, error } = await admin
    .from("plans")
    .select(PLAN_COLUMNS)
    .order("price_monthly", { ascending: true });
  if (error) {
    return NextResponse.json({ code: "PLANS_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ code: "PLANS_LOADED", plans: data ?? [] });
}

const patchSchema = z.object({
  planId: z.string().uuid(),
  updates: z.object({
    price_monthly: z.number().optional(),
    max_patients: z.number().int().optional(),
    max_notifications_per_month: z.number().int().optional(),
    feature_keys: z.array(z.string()).optional(),
  }),
});

// PATCH /api/admin/plans – einen Plan aktualisieren.
export async function PATCH(request: Request) {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ code: "ACCESS_DENIED" }, { status: 403 });
  }
  const { admin } = ctx;

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success || Object.keys(parsed.data.updates).length === 0) {
    return NextResponse.json({ code: "VALIDATION_ERROR" }, { status: 422 });
  }

  const { data, error } = await admin
    .from("plans")
    .update(parsed.data.updates)
    .eq("id", parsed.data.planId)
    .select(PLAN_COLUMNS)
    .maybeSingle();

  if (error) {
    console.error("[PATCH /api/admin/plans] Update fehlgeschlagen:", error);
    return NextResponse.json({ code: "SERVER_ERROR" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ code: "PLAN_UPDATED", plan: data });
}
