import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createClient } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function periodEndToIso(value: number | null | undefined): string | null {
  return value ? new Date(value * 1000).toISOString() : null;
}

// POST /api/stripe/webhook – ÖFFENTLICH: Stripe-Events verarbeiten.
export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!stripe || !webhookSecret || !signature) {
    return NextResponse.json({ code: "WEBHOOK_SIGNATURE_INVALID" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ code: "WEBHOOK_SIGNATURE_INVALID" }, { status: 400 });
  }

  const admin = createClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const practiceId =
          session.client_reference_id ?? session.metadata?.practice_id ?? null;
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : null;
        const customerId =
          typeof session.customer === "string" ? session.customer : null;

        let currentPeriodEnd: string | null = null;
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          currentPeriodEnd = periodEndToIso(sub.current_period_end);
        }

        if (practiceId) {
          // Optional: Plan anhand metadata.plan_key aktualisieren.
          let planId: string | undefined;
          const planKey = session.metadata?.plan_key;
          if (planKey) {
            const { data: plan } = await admin
              .from("plans")
              .select("id")
              .eq("plan_key", planKey)
              .maybeSingle();
            planId = plan?.id;
          }

          await admin
            .from("subscriptions")
            .update({
              status: "active",
              stripe_subscription_id: subscriptionId,
              stripe_customer_id: customerId,
              current_period_end: currentPeriodEnd,
              ...(planId ? { plan_id: planId } : {}),
              updated_at: new Date().toISOString(),
            })
            .eq("practice_id", practiceId);
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId =
          typeof invoice.subscription === "string" ? invoice.subscription : null;
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          await admin
            .from("subscriptions")
            .update({
              status: "active",
              current_period_end: periodEndToIso(sub.current_period_end),
              notifications_used_this_month: 0,
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", subscriptionId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await admin
          .from("subscriptions")
          .update({ status: "cancelled", updated_at: new Date().toISOString() })
          .eq("stripe_subscription_id", sub.id);
        break;
      }

      default:
        // Andere Events werden ignoriert.
        break;
    }
  } catch (err) {
    console.error("[POST /api/stripe/webhook] Verarbeitungsfehler:", err);
    // 200 zurückgeben, damit Stripe nicht endlos wiederholt; Fehler ist geloggt.
  }

  return NextResponse.json({ received: true });
}
