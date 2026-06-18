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

export interface LocaleStatus {
  locale: string;
  name: string;
  quality: LocaleQuality;
  /** Reihenfolge der Freigabe-Priorität (1 = zuerst). 0 = bereits verified. */
  priority: number;
  note: string;
}

export const LOCALE_QUALITY: ReadonlyArray<LocaleStatus> = [
  { locale: "en", name: "English", quality: "verified", priority: 0, note: "Intern freigegeben (Kernsprache)." },
  { locale: "de", name: "Deutsch", quality: "verified", priority: 0, note: "Intern freigegeben (Kernsprache)." },
  { locale: "ar", name: "العربية", quality: "needs_review", priority: 1, note: "Repositioniert, menschliche Sprachprüfung ausstehend." },
  { locale: "hi", name: "हिन्दी", quality: "machine_like_risk", priority: 2, note: "Repositioniert, erhöhtes Maschinen-Risiko — Prüfung nötig." },
  { locale: "bn", name: "বাংলা", quality: "machine_like_risk", priority: 3, note: "Repositioniert, erhöhtes Maschinen-Risiko — Prüfung nötig." },
  { locale: "pt", name: "Português", quality: "needs_review", priority: 4, note: "Repositioniert, menschliche Sprachprüfung ausstehend." },
  { locale: "es", name: "Español", quality: "needs_review", priority: 5, note: "Repositioniert, menschliche Sprachprüfung ausstehend." },
  { locale: "fr", name: "Français", quality: "needs_review", priority: 6, note: "Repositioniert, menschliche Sprachprüfung ausstehend." },
  { locale: "ru", name: "Русский", quality: "needs_review", priority: 7, note: "Repositioniert, menschliche Sprachprüfung ausstehend." },
  { locale: "zh", name: "中文", quality: "machine_like_risk", priority: 8, note: "Repositioniert, erhöhtes Maschinen-Risiko — Prüfung nötig." },
];

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
