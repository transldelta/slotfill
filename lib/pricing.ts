/**
 * Zentrale, einzige Preisquelle für ClinicSlotHub (Single Source of Truth).
 *
 * Homepage-Pricing-Sektion und die Pricing-Seite MÜSSEN diese Zahlen nutzen –
 * niemals eigene, abweichende Preise hardcoden. So kann der frühere Widerspruch
 * (Homepage "auf Anfrage" vs. Pricing-Seite "29 €/Monat") nicht zurückkehren.
 *
 * Die Preise sind sichtbare ORIENTIERUNGS-/Startpreise ("ab … € / Monat") für
 * ausgewählte Märkte. Aktivierung und endgültiges Angebot erfolgen nach Prüfung
 * von Land, Einrichtung und rechtlichen Anforderungen. Kein Checkout, kein Stripe,
 * keine sofortige Aktivierung. Patienten zahlen nicht auf der Website.
 *
 * Die lokalisierte Preis-/Hinweis-Copy lebt in den i18n-Schlüsseln der
 * `landing`-Namespace (pricePerMonthFrom, pricingOnRequest, pricingMoneyNote),
 * die ebenfalls von beiden Seiten gemeinsam genutzt werden.
 */

export type PricingPlanKey = "starter" | "professional" | "praxis_plus";

export interface PricingPlan {
  /** Interner Plan-Key (kompatibel mit der bestehenden Pricing-Seite). */
  key: PricingPlanKey;
  /** Öffentlicher Paketname (Marke, in allen Sprachen gleich). */
  name: string;
  /** Sichtbarer Startpreis ("ab" / "from"). */
  priceFrom: number;
  /** Währung (ISO 4217). */
  currency: "EUR";
  /** Abrechnungsintervall. */
  interval: "month";
  recommended?: boolean;
  premium?: boolean;
}

export const PRICING_CURRENCY_SYMBOL = "€" as const;

export const PRICING_PLANS: PricingPlan[] = [
  { key: "starter", name: "Starter", priceFrom: 29, currency: "EUR", interval: "month" },
  { key: "professional", name: "Practice", priceFrom: 79, currency: "EUR", interval: "month", recommended: true },
  { key: "praxis_plus", name: "Clinic", priceFrom: 149, currency: "EUR", interval: "month", premium: true },
];

/** Startpreis je Plan-Key – für die Pricing-Seite, die nach plan_key arbeitet. */
export const PRICE_FROM_BY_KEY: Record<PricingPlanKey, number> = {
  starter: 29,
  professional: 79,
  praxis_plus: 149,
};
