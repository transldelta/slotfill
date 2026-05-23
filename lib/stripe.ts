import Stripe from "stripe";

let cached: Stripe | null = null;

// Gibt den Stripe-Client zurück – oder null, wenn kein Secret konfiguriert
// ist. So crasht die App nicht, wenn Stripe (noch) nicht eingerichtet wurde.
export function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  if (!cached) {
    cached = new Stripe(secretKey, {
      apiVersion: "2024-04-10",
      typescript: true,
    });
  }
  return cached;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

// ENV-Fallback für Stripe Price IDs anhand des plan_key.
export function getEnvPriceId(planKey: string): string | null {
  const map: Record<string, string | undefined> = {
    starter: process.env.STRIPE_PRICE_STARTER,
    professional: process.env.STRIPE_PRICE_PROFESSIONAL,
    praxis_plus: process.env.STRIPE_PRICE_PRAXIS_PLUS,
  };
  return map[planKey] || null;
}
