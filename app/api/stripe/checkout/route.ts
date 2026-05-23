import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentPractice } from "@/lib/practice";
import { getEnvPriceId, getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// priceId vom Client wird bewusst ignoriert – der Preis wird serverseitig
// aus dem Plan ermittelt, damit niemand einen fremden Preis unterschieben kann.
const checkoutSchema = z.object({
  planKey: z.string().min(1),
  priceId: z.string().optional(),
});

// POST /api/stripe/checkout – authentifiziert: Stripe-Checkout-Session erstellen.
export async function POST(request: Request) {
  const ctx = await getCurrentPractice();
  if (!ctx) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }
  const { admin, practiceId } = ctx;

  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ code: "VALIDATION_ERROR" }, { status: 422 });
  }
  const { planKey } = parsed.data;

  const { data: plan } = await admin
    .from("plans")
    .select("id, plan_key, stripe_price_id")
    .eq("plan_key", planKey)
    .maybeSingle();
  if (!plan) {
    return NextResponse.json({ code: "PLAN_NOT_FOUND" }, { status: 404 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ code: "STRIPE_NOT_CONFIGURED" }, { status: 503 });
  }

  // Price ID ermitteln: zuerst aus der DB, dann ENV-Fallback.
  const priceId = plan.stripe_price_id || getEnvPriceId(plan.plan_key);
  if (!priceId) {
    return NextResponse.json({ code: "STRIPE_PRICE_MISSING" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard/subscription?checkout=success`,
      cancel_url: `${appUrl}/pricing?checkout=cancelled`,
      client_reference_id: practiceId,
      metadata: { practice_id: practiceId, plan_key: plan.plan_key },
    });

    return NextResponse.json({
      code: "CHECKOUT_SESSION_CREATED",
      url: session.url,
    });
  } catch (err) {
    console.error("[POST /api/stripe/checkout] Stripe-Fehler:", err);
    return NextResponse.json({ code: "CHECKOUT_ERROR" }, { status: 500 });
  }
}
