import Link from "next/link";
import { getLegalContent, isRtlLocale, isLegalDraft } from "@/lib/legal-content";

/**
 * AVV / DPA Informationsseite – lokalisiert
 *
 * Pflichtseite für Praxen, die Patientendaten in PraxisFlow eingeben.
 * Ein unterzeichneter AVV ist gemäß Art. 28 DSGVO erforderlich.
 */
export function AvvContent({
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
        {c.avvTitle}
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {c.avvSubtitle}
      </p>

      {/* Draft-Hinweis */}
      {isDraft && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300">
          <strong>{isDE ? "Hinweis:" : "Note:"}</strong>{" "}
          {c.avvDraftNotice.replace(/^(ENTWURF|DRAFT|BROUILLON|BORRADOR|مسودة|ЧЕРНОВИК|草稿|RASCUNHO|मसौदा|খসড়া|Hinweis:|Note:)\s*[–-]?\s*/i, "")}{" "}
          {isDE
            ? <>Bitte wenden Sie sich bei Fragen an{" "}
              <a href="mailto:transl.delta@gmail.com" className="underline hover:no-underline">
                transl.delta@gmail.com
              </a>.</>
            : <>For questions, please contact{" "}
              <a href="mailto:transl.delta@gmail.com" className="underline hover:no-underline">
                transl.delta@gmail.com
              </a>.</>
          }
        </div>
      )}

      {/* Maßgeblichkeits-Banner für Nicht-DE */}
      {!isDE && c.authorityNotice && (
        <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-300">
          <p>{c.authorityNotice}</p>
          <p className="mt-2">
            <Link href="/de/avv" className="font-medium underline hover:no-underline">
              {c.authorityLinkLabel}
            </Link>
          </p>
        </div>
      )}

      <div className="mt-8 space-y-8 text-sm text-slate-700 dark:text-slate-300">

        {/* Warum AVV */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {c.avvWhySection}
          </h2>
          <div className="mt-2 space-y-2 leading-relaxed">
            {isDE ? (
              <>
                <p>
                  Wenn Ihre Praxis Patientendaten (z. B. Namen, Telefonnummern) in PraxisFlow eingibt,
                  verarbeitet PraxisFlow diese Daten in Ihrem Auftrag. In diesem Fall sind Sie als
                  Praxis <strong>Verantwortliche/r</strong> im Sinne des Art. 4 Nr. 7 DSGVO und
                  PraxisFlow ist <strong>Auftragsverarbeiter</strong> im Sinne des Art. 4 Nr. 8 DSGVO.
                </p>
                <p>
                  Gemäß Art. 28 Abs. 3 DSGVO ist ein schriftlicher Auftragsverarbeitungsvertrag (AVV)
                  <strong> gesetzlich vorgeschrieben</strong>. Ohne abgeschlossenen AVV dürfen keine
                  Patientendaten in PraxisFlow eingegeben werden.
                </p>
              </>
            ) : (
              <>
                <p>
                  When your practice enters patient data (e.g. names, phone numbers) into PraxisFlow,
                  PraxisFlow processes that data on your behalf. In this case, your practice is the
                  <strong> data controller</strong> (Art. 4(7) GDPR) and PraxisFlow is the
                  <strong> data processor</strong> (Art. 4(8) GDPR).
                </p>
                <p>
                  Pursuant to Art. 28(3) GDPR, a written Data Processing Agreement (DPA) is
                  <strong> legally required</strong>. Patient data must not be entered without a
                  signed DPA in place.
                </p>
              </>
            )}
          </div>
        </section>

        {/* Wann erforderlich */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {c.avvWhenSection}
          </h2>
          <div className="mt-2 space-y-2 leading-relaxed">
            <ul className="ml-4 list-disc space-y-1">
              {isDE ? (
                <>
                  <li>
                    <strong>Im Testmodus (Trial):</strong> Für interne Tests ohne echte Patientendaten
                    ist kein AVV erforderlich. Bitte keine echten Patientendaten eingeben, solange kein
                    AVV abgeschlossen ist.
                  </li>
                  <li>
                    <strong>Im Produktivbetrieb:</strong> Sobald echte Patientendaten eingetragen werden,
                    ist der AVV zwingend vor der ersten Eingabe abzuschließen.
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <strong>In trial mode:</strong> No DPA required for internal tests without real patient data.
                    Please do not enter real patient data until a DPA is in place.
                  </li>
                  <li>
                    <strong>In production:</strong> A DPA must be signed before entering any real patient data.
                  </li>
                </>
              )}
            </ul>
          </div>
        </section>

        {/* Was regelt der AVV */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {c.avvWhatSection}
          </h2>
          <div className="mt-2 leading-relaxed">
            <ul className="ml-4 list-disc space-y-1">
              {isDE ? (
                <>
                  <li>Gegenstand und Dauer der Verarbeitung</li>
                  <li>Art und Zweck der Verarbeitung</li>
                  <li>Art der personenbezogenen Daten und Kategorien betroffener Personen</li>
                  <li>Pflichten und Rechte des Verantwortlichen (Praxis)</li>
                  <li>Weisungsgebundenheit des Auftragsverarbeiters (PraxisFlow)</li>
                  <li>Technische und organisatorische Maßnahmen (TOM)</li>
                  <li>Regelung zur Unterauftragsverarbeitung (z. B. Supabase, Vercel)</li>
                  <li>Löschung oder Rückgabe von Daten nach Vertragsende</li>
                </>
              ) : (
                <>
                  <li>Subject matter and duration of processing</li>
                  <li>Nature and purpose of the processing</li>
                  <li>Type of personal data and categories of data subjects</li>
                  <li>Obligations and rights of the controller (practice)</li>
                  <li>Binding instructions to the processor (PraxisFlow)</li>
                  <li>Technical and organisational measures (TOMs)</li>
                  <li>Sub-processing arrangements (e.g. Supabase, Vercel)</li>
                  <li>Data deletion or return upon contract termination</li>
                </>
              )}
            </ul>
          </div>
        </section>

        {/* AVV anfordern */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {c.avvRequestSection}
          </h2>
          <div className="mt-2 space-y-2 leading-relaxed">
            <p>
              {isDE
                ? "Das AVV-Dokument wird vor dem Produktivstart als PDF oder elektronisch unterzeichenbares Dokument bereitgestellt."
                : "The DPA document will be provided as a PDF or electronically signable document before go-live."}
            </p>
            <p>
              {isDE ? "Anfragen:" : "Contact:"}{" "}
              <a
                href="mailto:transl.delta@gmail.com?subject=AVV%20PraxisFlow"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                transl.delta@gmail.com
              </a>
            </p>
          </div>
        </section>

        {/* Sub-Prozessoren */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {c.avvSubprocessorsSection}
          </h2>
          <div className="mt-2 leading-relaxed">
            <ul className="ml-4 list-disc space-y-1">
              <li>
                <strong>Supabase Inc.</strong> —{" "}
                {isDE ? "Datenbankhosting und Authentifizierung (USA; SCCs)" : "Database hosting & authentication (USA; SCCs)"}
              </li>
              <li>
                <strong>Vercel Inc.</strong> —{" "}
                {isDE ? "Webhosting (USA; SCCs vorhanden)" : "Web hosting (USA; SCCs in place)"}
              </li>
              <li>
                <strong>Twilio Inc.</strong> ({isDE ? "optional" : "optional"}) —{" "}
                {isDE
                  ? "SMS/WhatsApp-Versand, nur wenn von der Praxis bewusst konfiguriert"
                  : "SMS/WhatsApp delivery, only when explicitly configured by the practice"}
              </li>
            </ul>
          </div>
        </section>

        {/* Links */}
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href={`/${locale}/datenschutz`} className="text-blue-600 hover:underline dark:text-blue-400">
            {c.datenschutzTitle} →
          </Link>
          <Link href={`/${locale}/agb`} className="text-blue-600 hover:underline dark:text-blue-400">
            {c.agbTitle} →
          </Link>
          <Link href={`/${locale}/impressum`} className="text-blue-600 hover:underline dark:text-blue-400">
            {c.impressumTitle} →
          </Link>
        </div>

      </div>
    </main>
  );
}
