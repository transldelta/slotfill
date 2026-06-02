import Link from "next/link";
import { getLegalContent, isRtlLocale, isLegalDraft } from "@/lib/legal-content";

/**
 * Impressum-Inhalt – § 5 DDG (Digitale-Dienste-Gesetz)
 *
 * Persönliche Daten des Anbieters erscheinen ausschließlich auf dieser Seite
 * (gesetzliche Pflicht). In automatischer Kommunikation, Marketing und Trial-Mails
 * wird ausschließlich &bdquo;SlotFill Team&ldquo; als Absender verwendet.
 *
 * ENTWURF – vor Veröffentlichung durch einen Rechtsanwalt prüfen lassen.
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
  const isDraft = isLegalDraft();
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

      {/* Draft-Hinweis */}
      {isDraft && (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300">
          <strong>{isDE ? "Hinweis:" : "Note:"}</strong>{" "}
          {isDE
            ? "Dieser Text ist ein vorläufiger Entwurf und wurde noch nicht abschließend rechtlich geprüft. Vor dem Produktivstart muss er durch finale, rechtlich geprüfte Texte ersetzt werden. Er ersetzt keine Rechtsberatung."
            : "This legal notice is a preliminary draft and has not yet been fully reviewed. It does not constitute legal advice."}
        </p>
      )}

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

        {/* § 5 DDG – Pflichtangaben (Deutsch: gesetzlich vorgeschrieben, wird in allen Locales angezeigt) */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {c.impressumSection1}
          </h2>
          <div className="mt-2 space-y-1">
            <p>SlotFill</p>
            <p>Betrieben durch: Brahim Ben Abla</p>
            <p>Schlesier Straße 64</p>
            <p>76227 Karlsruhe, Deutschland</p>
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
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isDE
                ? "(Hinweis: Diese Adresse ist vorläufig. Vor Produktivstart wird eine dedizierte geschäftliche E-Mail-Adresse eingerichtet.)"
                : "(Note: This address is temporary. A dedicated business email will be set up before launch.)"}
            </p>
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
            <p>76227 Karlsruhe, Deutschland</p>
          </div>
        </section>

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

        {/* Interner Hinweis */}
        <section className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isDE
              ? (<><strong>Intern:</strong> Persönliche Anbieterinformationen erscheinen ausschließlich auf dieser Seite (gesetzliche Pflicht nach § 5 DDG). In automatischer Kommunikation, E-Mails, Trial-Benachrichtigungen und Marketing wird ausschließlich &bdquo;SlotFill Team&ldquo; als Absender verwendet.</>)
              : (<><strong>Note:</strong> Personal operator information appears only on this legal notice page (as required by German law § 5 DDG). All automated communication uses &ldquo;SlotFill Team&rdquo; as the sender — never a personal name.</>)
            }
          </p>
        </section>

      </div>
    </main>
  );
}
