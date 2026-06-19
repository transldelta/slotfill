import Link from "next/link";
import { getLegalContent, isRtlLocale } from "@/lib/legal-content";
import { MarketScopeNotice } from "@/components/legal/MarketScopeNotice";

/**
 * Impressum-Inhalt – § 5 DDG (Digitale-Dienste-Gesetz)
 *
 * Persönliche Daten des Anbieters erscheinen ausschließlich auf dieser Seite
 * (gesetzliche Pflicht). In automatischer Kommunikation, Marketing und Trial-Mails
 * wird ausschließlich „ClinicSlotHub Team" als Absender verwendet.
 */
export function ImpressumContent({
  backHref = "/",
  locale = "de",
}: {
  backHref?: string;
  locale?: string;
}) {
  const c = getLegalContent(locale);
  const isRtl = isRtlLocale(locale);
  const isDE = locale === "de";

  return (
    <main
      className="mx-auto max-w-2xl px-4 py-12"
      dir={isRtl ? "rtl" : undefined}
    >
      <Link href={backHref} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
        {c.backLabel}
      </Link>

      <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
        {c.impressumTitle}
      </h1>

      {/* Hinweis zum Leistungsangebot (räumlicher Markt) */}
      <MarketScopeNotice locale={locale} variant="imprint" />

      {/* Maßgeblichkeits-Banner für Nicht-DE */}
      {!isDE && c.authorityNotice && (
        <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-300">
          <p>{c.authorityNotice}</p>
          <p className="mt-2">
            <Link href="/de/impressum" className="font-medium underline hover:no-underline">
              {c.authorityLinkLabel}
            </Link>
          </p>
        </div>
      )}

      <div className="mt-8 space-y-6 text-sm text-slate-700 dark:text-slate-300">

        {/* § 5 DDG – Pflichtangaben */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {c.impressumSection1}
          </h2>
          <div className="mt-2 space-y-1 leading-relaxed">
            <p className="font-medium">ClinicSlotHub</p>
            <p>Brahim Ben Abla</p>
            <p>Schlesier Straße 64</p>
            <p>76227 Karlsruhe</p>
            <p>Deutschland</p>
          </div>
        </section>

        {/* Kontakt */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {c.impressumContactSection}
          </h2>
          <div className="mt-2 space-y-1">
            <p>
              {isDE ? "E-Mail" : "Email"}:{" "}
              <a
                href="mailto:transl.delta@gmail.com"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                transl.delta@gmail.com
              </a>
            </p>
          </div>
        </section>

        {/* Umsatzsteuer */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {isDE ? "Umsatzsteuer" : "VAT"}
          </h2>
          <div className="mt-2 space-y-1 leading-relaxed">
            <p>
              {isDE
                ? "Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:"
                : "VAT identification number pursuant to § 27a German VAT Act (UStG):"}
            </p>
            <p className="font-medium">DE310737989</p>
          </div>
        </section>

        {/* Verantwortlich für Inhalte */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {c.impressumResponsibleSection}
          </h2>
          <div className="mt-2 space-y-1">
            <p>Brahim Ben Abla</p>
            <p>Schlesier Straße 64</p>
            <p>76227 Karlsruhe</p>
            <p>Deutschland</p>
          </div>
        </section>

        {/* Hinweis zur Plattform */}
        {isDE && (
          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Hinweis zur Plattform
            </h2>
            <div className="mt-2 space-y-1 leading-relaxed">
              <p>
                ClinicSlotHub ist eine SaaS-Plattform für Termin-, Wartelisten- und Anfrageverwaltung für
                ausgewählte internationale Märkte. Die Plattform richtet sich ausschließlich an gewerbliche
                Nutzerinnen und Nutzer – Arztpraxen, Therapiepraxen, Kliniken, Gesundheitsanbieter und
                medizinische Einrichtungen. Nutzung und Aktivierung erfolgen nur nach Prüfung von Land,
                Einrichtung, technischer Umsetzbarkeit und rechtlichen Anforderungen.
              </p>
              <p>
                ClinicSlotHub erbringt keine medizinischen Leistungen und ersetzt keine ärztliche Beratung,
                Diagnose oder Behandlung.
              </p>
            </div>
          </section>
        )}

        {/* Haftungsausschluss */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {c.impressumLiabilitySection}
          </h2>
          <div className="mt-2 space-y-3">
            <div>
              <h3 className="font-medium text-slate-800 dark:text-slate-200">
                {c.impressumLiabilityContent}
              </h3>
              <p className="mt-1 leading-relaxed">
                {isDE
                  ? "Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden. Die Inhalte ersetzen keine rechtliche, medizinische oder datenschutzrechtliche Beratung."
                  : "The content of this website has been created with the greatest possible care. However, no guarantee can be given for the accuracy, completeness, or timeliness of the content. The content does not replace legal, medical, or data protection advice."}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-800 dark:text-slate-200">
                {c.impressumLiabilityLinks}
              </h3>
              <p className="mt-1 leading-relaxed">
                {c.impressumLiabilityLinksText}
              </p>
            </div>
          </div>
        </section>

        {/* Betreiber-Hinweis */}
        <section className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isDE
              ? (<>Persönliche Anbieterangaben erscheinen gemäß § 5 DDG ausschließlich auf dieser Seite. Falls später nach Freigabe automatisierte Kommunikation eingesetzt wird, erfolgt diese ausschließlich unter der Marke &bdquo;ClinicSlotHub&ldquo;.</>)
              : (<>Personal operator information appears only on this legal notice page, as required by § 5 DDG. If automated communication is introduced after approval in the future, it will be sent only under the &ldquo;ClinicSlotHub&rdquo; brand.</>)
            }
          </p>
        </section>

      </div>
    </main>
  );
}
