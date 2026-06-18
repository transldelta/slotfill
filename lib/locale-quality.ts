/**
 * Linguistic Quality Registry — Locale Rollout (Emerging Markets Positioning)
 *
 * READ-ONLY: reine Statusdaten. Keine externen Aufrufe, keine Secrets.
 *
 * Ehrlichkeitsregel: Nur en/de gelten als intern freigegeben ("verified").
 * Alle anderen öffentlichen Sprachen wurden modell-/regelbasiert repositioniert
 * und sind NICHT als professionell final geprüft zu behaupten → "needs_review".
 * Sprachen mit erhöhtem Maschinen-Risiko sind zusätzlich als solche markiert.
 */

export type LocaleQuality = "verified" | "needs_review" | "machine_like_risk" | "missing" | "not_prioritized";
export type FieldStatus = "ok" | "improved_needs_review" | "localized" | "needs_review";
export type PublicRisk = "low" | "medium" | "high";

export interface LocaleStatus {
  locale: string;
  name: string;
  quality: LocaleQuality;
  /** Reihenfolge der Freigabe-Priorität (1 = zuerst). 0 = bereits verified. */
  priority: number;
  /** Öffentliche Marketing-Copy (Home/Launch/Nav/Footer). */
  publicCopyStatus: FieldStatus;
  /** Pricing-Karten + Preislogik-Note. */
  pricingStatus: FieldStatus;
  /** SEO-Title/Description je Locale. */
  metadataStatus: FieldStatus;
  /** Leserichtung / Layout. */
  rtlStatus: "ltr_ok" | "rtl_ok";
  /** Braucht echten Muttersprachler-Review, bevor "verified" behauptet werden darf. */
  needsNativeReview: boolean;
  publicRisk: PublicRisk;
  note: string;
}

export const LOCALE_QUALITY: ReadonlyArray<LocaleStatus> = [
  { locale: "en", name: "English", quality: "verified", priority: 0, publicCopyStatus: "ok", pricingStatus: "ok", metadataStatus: "localized", rtlStatus: "ltr_ok", needsNativeReview: false, publicRisk: "low", note: "Intern freigegeben (Kernsprache)." },
  { locale: "de", name: "Deutsch", quality: "verified", priority: 0, publicCopyStatus: "ok", pricingStatus: "ok", metadataStatus: "localized", rtlStatus: "ltr_ok", needsNativeReview: false, publicRisk: "low", note: "Intern freigegeben (Kernsprache)." },
  { locale: "ar", name: "العربية", quality: "needs_review", priority: 1, publicCopyStatus: "improved_needs_review", pricingStatus: "improved_needs_review", metadataStatus: "localized", rtlStatus: "rtl_ok", needsNativeReview: true, publicRisk: "medium", note: "Sprachlich geglättet (kürzere H1, natürlichere CTAs/Plan-Namen); Native-Review ausstehend." },
  { locale: "hi", name: "हिन्दी", quality: "machine_like_risk", priority: 2, publicCopyStatus: "needs_review", pricingStatus: "localized", metadataStatus: "localized", rtlStatus: "ltr_ok", needsNativeReview: true, publicRisk: "high", note: "Erhöhtes Maschinen-Risiko — Native-Review nötig." },
  { locale: "bn", name: "বাংলা", quality: "machine_like_risk", priority: 3, publicCopyStatus: "needs_review", pricingStatus: "localized", metadataStatus: "localized", rtlStatus: "ltr_ok", needsNativeReview: true, publicRisk: "high", note: "Erhöhtes Maschinen-Risiko — Native-Review nötig." },
  { locale: "pt", name: "Português", quality: "needs_review", priority: 4, publicCopyStatus: "needs_review", pricingStatus: "localized", metadataStatus: "localized", rtlStatus: "ltr_ok", needsNativeReview: true, publicRisk: "low", note: "Solide, Native-Review ausstehend." },
  { locale: "es", name: "Español", quality: "needs_review", priority: 5, publicCopyStatus: "needs_review", pricingStatus: "localized", metadataStatus: "localized", rtlStatus: "ltr_ok", needsNativeReview: true, publicRisk: "low", note: "Solide, Native-Review ausstehend." },
  { locale: "fr", name: "Français", quality: "needs_review", priority: 6, publicCopyStatus: "needs_review", pricingStatus: "localized", metadataStatus: "localized", rtlStatus: "ltr_ok", needsNativeReview: true, publicRisk: "low", note: "Solide, Native-Review ausstehend." },
  { locale: "ru", name: "Русский", quality: "needs_review", priority: 7, publicCopyStatus: "needs_review", pricingStatus: "localized", metadataStatus: "localized", rtlStatus: "ltr_ok", needsNativeReview: true, publicRisk: "medium", note: "Native-Review nötig; interne Namespaces teils englisch (nicht öffentlich)." },
  { locale: "zh", name: "中文", quality: "machine_like_risk", priority: 8, publicCopyStatus: "needs_review", pricingStatus: "localized", metadataStatus: "localized", rtlStatus: "ltr_ok", needsNativeReview: true, publicRisk: "high", note: "Erhöhtes Maschinen-Risiko — Native-Review nötig." },
];

/** Locales, die ausdrücklich einen Muttersprachler-Review brauchen, bevor "verified". */
export function localesNeedingNativeReview(): string[] {
  return LOCALE_QUALITY.filter((l) => l.needsNativeReview).map((l) => l.locale);
}

/** Sprachen, die als intern freigegeben behauptet werden dürfen. */
export function verifiedLocales(): string[] {
  return LOCALE_QUALITY.filter((l) => l.quality === "verified").map((l) => l.locale);
}

/** Öffentliche Locales, die noch eine menschliche Sprachprüfung benötigen. */
export function localesNeedingReview(): string[] {
  return LOCALE_QUALITY.filter((l) => l.quality === "needs_review" || l.quality === "machine_like_risk").map(
    (l) => l.locale,
  );
}

export function localeQuality(locale: string): LocaleStatus | undefined {
  return LOCALE_QUALITY.find((l) => l.locale === locale);
}
