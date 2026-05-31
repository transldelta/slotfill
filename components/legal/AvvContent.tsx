import Link from "next/link";

/**
 * AVV-Informationsseite – ENTWURF
 *
 * Pflichtseite für Praxen, die Patientendaten in SlotFill eingeben.
 * Ein unterzeichneter AVV ist gemäß Art. 28 DSGVO erforderlich.
 *
 * Diese Seite ist kein vollständiger AVV, sondern ein Hinweis auf die Anforderung
 * und den Prozess zur Anforderung des AVV-Dokuments.
 */
export function AvvContent({
  backHref = "/",
  locale = "de",
}: {
  backHref?: string;
  locale?: string;
}) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <Link href={backHref} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
        SlotFill
      </Link>

      <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
        Auftragsverarbeitungsvertrag (AVV)
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Gemäß Art. 28 DSGVO
      </p>

      {/* Draft-Hinweis */}
      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300">
        <strong>ENTWURF – AVV-Dokument noch nicht finalisiert.</strong>{" "}
        Diese Seite informiert über die gesetzliche Pflicht zum AVV-Abschluss.
        Das vollständige AVV-Dokument wird vor dem Produktivstart bereitgestellt.
        Bitte wenden Sie sich bei Fragen an{" "}
        <a href="mailto:transl.delta@gmail.com" className="underline hover:no-underline">
          transl.delta@gmail.com
        </a>.
      </div>

      <div className="mt-8 space-y-8 text-sm text-slate-700 dark:text-slate-300">

        {/* Warum AVV */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Warum ist ein AVV notwendig?
          </h2>
          <div className="mt-2 space-y-2 leading-relaxed">
            <p>
              Wenn Ihre Praxis Patientendaten (z. B. Namen, Telefonnummern) in SlotFill eingibt,
              verarbeitet SlotFill diese Daten in Ihrem Auftrag. In diesem Fall sind Sie als
              Praxis <strong>Verantwortliche/r</strong> im Sinne des Art. 4 Nr. 7 DSGVO und
              SlotFill ist <strong>Auftragsverarbeiter</strong> im Sinne des Art. 4 Nr. 8 DSGVO.
            </p>
            <p>
              Gemäß Art. 28 Abs. 3 DSGVO ist in diesem Fall ein schriftlicher
              Auftragsverarbeitungsvertrag (AVV) <strong>gesetzlich vorgeschrieben</strong>.
              Ohne abgeschlossenen AVV dürfen keine Patientendaten in SlotFill eingegeben werden.
            </p>
          </div>
        </section>

        {/* Wann erforderlich */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Wann benötige ich einen AVV?
          </h2>
          <div className="mt-2 space-y-2 leading-relaxed">
            <ul className="ml-4 list-disc space-y-1">
              <li>
                <strong>Im Testmodus (Trial):</strong> Für interne Tests ohne echte Patientendaten
                ist kein AVV erforderlich. Geben Sie bitte keine echten Patientendaten ein,
                solange kein AVV abgeschlossen ist.
              </li>
              <li>
                <strong>Im Produktivbetrieb:</strong> Sobald echte Patientendaten (Name,
                Kontaktdaten) eingetragen werden, ist der AVV zwingend vor der ersten Eingabe
                abzuschließen.
              </li>
            </ul>
          </div>
        </section>

        {/* Inhalt des AVV */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Was regelt der AVV?
          </h2>
          <div className="mt-2 space-y-2 leading-relaxed">
            <p>
              Der AVV legt gemäß Art. 28 Abs. 3 DSGVO insbesondere fest:
            </p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Gegenstand und Dauer der Verarbeitung</li>
              <li>Art und Zweck der Verarbeitung</li>
              <li>Art der personenbezogenen Daten und Kategorien betroffener Personen</li>
              <li>Pflichten und Rechte des Verantwortlichen (Praxis)</li>
              <li>Weisungsgebundenheit des Auftragsverarbeiters (SlotFill)</li>
              <li>Technische und organisatorische Maßnahmen (TOM)</li>
              <li>Regelung zur Unterauftragsverarbeitung (z. B. Supabase, Vercel)</li>
              <li>Löschung oder Rückgabe von Daten nach Vertragsende</li>
            </ul>
          </div>
        </section>

        {/* AVV anfordern */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            AVV anfordern
          </h2>
          <div className="mt-2 space-y-2 leading-relaxed">
            <p>
              Das AVV-Dokument wird vor dem Produktivstart als PDF oder elektronisch
              unterzeichenbares Dokument bereitgestellt.
            </p>
            <p>
              Um den AVV anzufordern oder bei Fragen:{" "}
              <a
                href="mailto:transl.delta@gmail.com?subject=AVV%20SlotFill"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                transl.delta@gmail.com
              </a>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Betreff: &bdquo;AVV SlotFill&ldquo; – bitte Praxisname und Art der geplanten
              Datenverarbeitung kurz beschreiben.
            </p>
          </div>
        </section>

        {/* Subprozessoren */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Unterauftragsverarbeiter (Sub-Prozessoren)
          </h2>
          <div className="mt-2 space-y-2 leading-relaxed">
            <p>
              SlotFill setzt folgende Unterauftragsverarbeiter ein (Entwurf – vor Produktivstart
              vollständig dokumentieren und im AVV verankern):
            </p>
            <ul className="ml-4 list-disc space-y-1">
              <li>
                <strong>Supabase Inc.</strong> – Datenbankhosting und Authentifizierung
                (USA; angemessenes Datenschutzniveau durch SCCs / EU-US Data Privacy Framework
                prüfen)
              </li>
              <li>
                <strong>Vercel Inc.</strong> – Webhosting (USA; SCCs vorhanden)
              </li>
              <li>
                <strong>Twilio Inc.</strong> (optional) – SMS/WhatsApp-Versand, nur wenn
                von der Praxis bewusst konfiguriert (eigene AVV zwischen Praxis und Twilio
                empfohlen)
              </li>
            </ul>
          </div>
        </section>

        {/* Links */}
        <div className="flex flex-wrap gap-4 text-sm">
          <Link
            href={`/${locale}/datenschutz`}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Datenschutzerklärung →
          </Link>
          <Link
            href={`/${locale}/agb`}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            AGB →
          </Link>
          <Link
            href={`/${locale}/impressum`}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Impressum →
          </Link>
        </div>

      </div>
    </main>
  );
}
