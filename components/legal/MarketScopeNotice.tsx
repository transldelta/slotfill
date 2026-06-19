import { getMarketScope } from "@/lib/market-scope";

/**
 * Räumlicher-Leistungsbereich-Hinweis für Legal-Seiten.
 * Reiner Disclaimer-Text — keine Compliance-Garantie, kein Geoblocking.
 * variant: "agb" (vollständiger Abschnitt), "privacy" (Hinweis + Wichtig-Notiz),
 * "imprint" (kurzer Verfügbarkeitshinweis).
 */
export function MarketScopeNotice({
  locale = "en",
  variant,
}: {
  locale?: string;
  variant: "agb" | "privacy" | "imprint";
}) {
  const m = getMarketScope(locale);

  if (variant === "agb") {
    return (
      <section className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm dark:border-amber-900/40 dark:bg-amber-900/10">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{m.agbTitle}</h2>
        <div className="mt-2 space-y-2 text-slate-700 dark:text-slate-300">
          {m.agbBody.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>
    );
  }

  if (variant === "privacy") {
    return (
      <section className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm dark:border-amber-900/40 dark:bg-amber-900/10">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{m.privacyTitle}</h2>
        <p className="mt-2 text-slate-700 dark:text-slate-300">{m.privacyBody}</p>
        <p className="mt-2 font-medium text-slate-800 dark:text-slate-200">{m.privacyNotice}</p>
      </section>
    );
  }

  // imprint
  return (
    <section className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm dark:border-amber-900/40 dark:bg-amber-900/10">
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{m.imprintTitle}</h2>
      <p className="mt-2 text-slate-700 dark:text-slate-300">{m.imprintBody}</p>
    </section>
  );
}
