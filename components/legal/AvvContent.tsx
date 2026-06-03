import Link from "next/link";
import { getLegalContent, isRtlLocale, isLegalDraft } from "@/lib/legal-content";

/**
 * AVV / DPA – Auftragsverarbeitungsvertrag (Muster/Entwurf)
 *
 * Pflichtseite für Praxen, die Patientendaten in Clentra eingeben.
 * Ein unterzeichneter AVV ist gemäß Art. 28 DSGVO erforderlich.
 *
 * MUSTER / ENTWURF – vor produktivem Einsatz rechtlich prüfen lassen.
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

      {/* Muster/Entwurf-Banner – immer sichtbar */}
      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300">
        <strong>{isDE ? "Muster / Entwurf –" : "Template / Draft –"}</strong>{" "}
        {isDE
          ? <>Dieses Dokument ist ein Musterentwurf und wurde noch nicht abschließend rechtlich geprüft.
            Vor produktivem Einsatz bitte durch einen Rechtsanwalt oder Datenschutzbeauftragten
            prüfen und individuell unterzeichnen lassen. Bei Fragen:{" "}
            <a href="mailto:transl.delta@gmail.com" className="underline hover:no-underline">
              transl.delta@gmail.com
            </a>.</>
          : <>This document is a template/draft and has not yet been fully reviewed.
            Please have it reviewed and individually signed by a qualified attorney or DPO before going live.
            For questions:{" "}
            <a href="mailto:transl.delta@gmail.com" className="underline hover:no-underline">
              transl.delta@gmail.com
            </a>.</>
        }
      </div>

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
                  Wenn Ihre Praxis Patientendaten (z. B. Namen, Telefonnummern, Termindaten) in
                  Clentra eingibt, verarbeitet Clentra diese Daten in Ihrem Auftrag. In diesem
                  Fall sind Sie als Praxis <strong>Verantwortliche/r</strong> im Sinne des
                  Art. 4 Nr. 7 DSGVO und Clentra ist <strong>Auftragsverarbeiter</strong> im
                  Sinne des Art. 4 Nr. 8 DSGVO.
                </p>
                <p>
                  Gemäß Art. 28 Abs. 3 DSGVO ist ein schriftlicher Auftragsverarbeitungsvertrag (AVV)
                  <strong> gesetzlich vorgeschrieben</strong>. Ohne abgeschlossenen AVV dürfen keine
                  Patientendaten in Clentra eingegeben werden.
                </p>
              </>
            ) : (
              <>
                <p>
                  When your practice enters patient data (e.g. names, phone numbers, appointment data)
                  into Clentra, Clentra processes that data on your behalf. Your practice is the
                  <strong> data controller</strong> (Art. 4(7) GDPR) and Clentra is the
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

        {/* Muster-AVV – Inhalt */}
        {isDE && (
          <>
            <section>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Muster-AVV – Inhalt (Entwurf)
              </h2>
              <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-4 dark:border-slate-700 dark:bg-slate-800/50">

                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">§ 1 Gegenstand und Dauer</h3>
                  <p className="mt-1 leading-relaxed">
                    Dieser Vertrag regelt die Auftragsverarbeitung zwischen der Praxis
                    (Verantwortlicher, nachfolgend &bdquo;Auftraggeber&ldquo;) und Clentra, betrieben durch
                    Brahim Ben Abla, Schlesier Straße 64, 76227 Karlsruhe (Auftragsverarbeiter,
                    nachfolgend &bdquo;Auftragnehmer&ldquo;). Die Laufzeit entspricht der Laufzeit des
                    Hauptvertrags (Nutzungsvertrag Clentra).
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">§ 2 Art und Zweck der Verarbeitung</h3>
                  <p className="mt-1 leading-relaxed">
                    Der Auftragnehmer verarbeitet personenbezogene Daten ausschließlich
                    zur Bereitstellung der Clentra-Plattform (Terminverwaltung, Buchungsanfragen,
                    Benachrichtigungen, Feedback) im Auftrag des Auftraggebers. Eine Verarbeitung
                    zu eigenen Zwecken ist ausgeschlossen.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">§ 3 Kategorien betroffener Personen und Datenarten</h3>
                  <div className="mt-1 leading-relaxed space-y-1">
                    <p><strong>Betroffene Personen:</strong> Patienten der Praxis, ggf. deren Kontaktpersonen.</p>
                    <p><strong>Datenarten:</strong> Name, E-Mail-Adresse, Telefonnummer, gewünschter Termin,
                    Anliegen/Notiz, Buchungsstatus, Bewertungsdaten.</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Keine Verarbeitung besonderer Kategorien personenbezogener Daten (Art. 9 DSGVO)
                      ohne ausdrückliche gesonderte Vereinbarung.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">§ 4 Technische und organisatorische Maßnahmen (TOMs)</h3>
                  <ul className="mt-1 ml-4 list-disc space-y-1 leading-relaxed">
                    <li>Verschlüsselte Datenübertragung (HTTPS/TLS)</li>
                    <li>Zugriffskontrollen und Authentifizierung (Supabase Auth)</li>
                    <li>Row-Level Security in der Datenbank</li>
                    <li>Protokollierung sicherheitsrelevanter Ereignisse (Audit-Log)</li>
                    <li>Regelmäßige Datensicherung durch Supabase</li>
                    <li>Zugriff auf Produktionsdaten nur für autorisiertes Personal</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">§ 5 Unterauftragsverarbeiter</h3>
                  <p className="mt-1 leading-relaxed">
                    Der Auftragnehmer setzt folgende Unterauftragsverarbeiter ein:
                  </p>
                  <ul className="mt-1 ml-4 list-disc space-y-1 leading-relaxed">
                    <li><strong>Supabase Inc.</strong> – Datenbankhosting, Authentifizierung (EU-Serverstandort; SCCs)</li>
                    <li><strong>Vercel Inc.</strong> – Webhosting und Deployment (USA; SCCs)</li>
                    <li><strong>Resend Inc.</strong> – E-Mail-Versand (transaktionale Mails; SCCs)</li>
                    <li><strong>Twilio Inc.</strong> (optional) – SMS/WhatsApp, nur bei bewusster Konfiguration durch die Praxis</li>
                  </ul>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Änderungen der Unterauftragnehmer werden dem Auftraggeber rechtzeitig mitgeteilt.
                    Der Auftraggeber kann Änderungen widersprechen.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">§ 6 Löschung und Rückgabe</h3>
                  <p className="mt-1 leading-relaxed">
                    Nach Beendigung des Hauptvertrags werden alle personenbezogenen Daten
                    auf Wunsch des Auftraggebers zurückgegeben oder unwiderruflich gelöscht,
                    sofern keine gesetzliche Aufbewahrungspflicht entgegensteht.
                    Der Auftraggeber kann einen Datenexport vor Vertragsende anfordern.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">§ 7 Kontrollrechte des Auftraggebers</h3>
                  <p className="mt-1 leading-relaxed">
                    Der Auftraggeber hat das Recht, die Einhaltung der Datenschutzvorschriften
                    und dieses Vertrags durch den Auftragnehmer zu überprüfen (Audits, Inspektionen).
                    Anfragen richten Sie an:{" "}
                    <a href="mailto:transl.delta@gmail.com" className="text-blue-600 hover:underline dark:text-blue-400">
                      transl.delta@gmail.com
                    </a>
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">§ 8 Meldepflichten</h3>
                  <p className="mt-1 leading-relaxed">
                    Der Auftragnehmer informiert den Auftraggeber unverzüglich über bekannt
                    gewordene Datenschutzverletzungen (Art. 33 DSGVO). Die Meldung enthält
                    alle verfügbaren Informationen zur Verletzung und möglichen Auswirkungen.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">§ 9 Unterstützungspflichten</h3>
                  <p className="mt-1 leading-relaxed">
                    Der Auftragnehmer unterstützt den Auftraggeber bei der Erfüllung von
                    Betroffenenrechten (Auskunft, Löschung, Berichtigung) sowie bei der
                    Erstellung von Datenschutz-Folgenabschätzungen (Art. 35 DSGVO), soweit
                    technisch und organisatorisch möglich.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">§ 10 Weisungsgebundenheit</h3>
                  <p className="mt-1 leading-relaxed">
                    Der Auftragnehmer verarbeitet Daten ausschließlich nach dokumentierten
                    Weisungen des Auftraggebers. Weisungen werden schriftlich oder per E-Mail erteilt.
                    Rechtswidrige Weisungen werden dem Auftraggeber unverzüglich gemeldet.
                  </p>
                </div>

              </div>
            </section>
          </>
        )}

        {/* Was regelt der AVV (Nicht-DE-Zusammenfassung) */}
        {!isDE && (
          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {c.avvWhatSection}
            </h2>
            <div className="mt-2 leading-relaxed">
              <ul className="ml-4 list-disc space-y-1">
                <li>Subject matter and duration of processing</li>
                <li>Nature and purpose of the processing</li>
                <li>Type of personal data and categories of data subjects</li>
                <li>Obligations and rights of the controller (practice)</li>
                <li>Binding instructions to the processor (Clentra)</li>
                <li>Technical and organisational measures (TOMs)</li>
                <li>Sub-processing arrangements (e.g. Supabase, Vercel, Resend)</li>
                <li>Data deletion or return upon contract termination</li>
                <li>Incident notification obligations</li>
                <li>Rights of access and audit</li>
              </ul>
            </div>
          </section>
        )}

        {/* AVV anfordern */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {c.avvRequestSection}
          </h2>
          <div className="mt-2 space-y-2 leading-relaxed">
            <p>
              {isDE
                ? "Das individuelle AVV-Dokument wird als PDF oder elektronisch unterzeichenbares Dokument bereitgestellt. Bitte vor dem Produktivstart anfordern."
                : "The individual DPA document will be provided as a PDF or electronically signable document. Please request it before going live."}
            </p>
            <p>
              {isDE ? "Anfragen per E-Mail:" : "Contact by email:"}{" "}
              <a
                href="mailto:transl.delta@gmail.com?subject=AVV%20Clentra"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                transl.delta@gmail.com
              </a>
            </p>
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
