import Link from "next/link";

/**
 * AGB-Inhalt – Allgemeine Geschäftsbedingungen – ENTWURF
 *
 * B2B-SaaS für medizinische / therapeutische Praxen.
 * Vor Produktivstart durch einen auf IT-Recht spezialisierten Rechtsanwalt prüfen lassen.
 */
export function AgbContent({
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
        Allgemeine Geschäftsbedingungen (AGB)
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Stand: Mai 2026</p>

      {/* Draft-Hinweis */}
      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300">
        <strong>ENTWURF – nicht rechtskräftig.</strong> Dieser Text ist ein vorläufiger Entwurf
        und wurde noch nicht abschließend rechtlich geprüft. Er ersetzt keine Rechtsberatung und
        darf nicht als finale AGB verwendet werden. Vor dem Produktivstart muss eine rechtsanwaltliche
        Prüfung erfolgen.
      </div>

      <div className="mt-8 space-y-8 text-sm text-slate-700 dark:text-slate-300">

        {/* § 1 */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            § 1 Geltungsbereich
          </h2>
          <div className="mt-2 space-y-2 leading-relaxed">
            <p>
              (1) Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen
              SlotFill (betrieben durch Brahim Ben Abla, Schlesier Straße 64, 76227 Karlsruhe –
              nachfolgend &bdquo;Anbieter&ldquo;) und dem Nutzer der Plattform (nachfolgend &bdquo;Praxis&ldquo; oder
              &bdquo;Nutzerin/Nutzer&ldquo;).
            </p>
            <p>
              (2) SlotFill richtet sich ausschließlich an gewerbliche Nutzerinnen und Nutzer
              (Unternehmer im Sinne des § 14 BGB), insbesondere an Arzt- und Therapiepraxen.
              Verbraucher im Sinne des § 13 BGB sind vom Nutzungsvertrag ausgeschlossen.
            </p>
            <p>
              (3) Abweichende Bedingungen der Praxis werden nicht anerkannt, es sei denn, der
              Anbieter stimmt ihrer Geltung ausdrücklich schriftlich zu.
            </p>
          </div>
        </section>

        {/* § 2 */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            § 2 Leistungsbeschreibung
          </h2>
          <div className="mt-2 space-y-2 leading-relaxed">
            <p>
              (1) SlotFill ist eine webbasierte SaaS-Plattform zur Verwaltung von Patientenwarte­listen
              und zur Vorbereitung von Benachrichtigungen bei frei gewordenen Behandlungs­terminen.
            </p>
            <p>
              (2) Die Plattform bereitet Nachrichten an Patienten vor (Nachrichtenvorlagen,
              Warteschlangen). Ein tatsächlicher Versand per SMS oder WhatsApp erfolgt
              <strong> ausschließlich dann</strong>, wenn die Praxis einen externen Nachrichten­anbieter
              (z. B. Twilio) bewusst und eigenständig konfiguriert und aktiviert hat.
            </p>
            <p>
              (3) Im Testmodus (Trial) werden keine echten SMS oder WhatsApp-Nachrichten versendet.
              Alle Nachrichten werden simuliert (Dry-Run), bis ein Provider aktiv konfiguriert wird.
            </p>
            <p>
              (4) Der Anbieter übernimmt keine Garantie dafür, dass die Nutzung der Plattform
              zu einer bestimmten Auslastung der Praxis, zu Terminfüllungen oder sonstigen
              geschäftlichen Ergebnissen führt.
            </p>
          </div>
        </section>

        {/* § 3 */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            § 3 Testphase (Trial)
          </h2>
          <div className="mt-2 space-y-2 leading-relaxed">
            <p>
              (1) Der Anbieter bietet eine kostenfreie Testphase von <strong>14 Tagen</strong> an.
              Für die Testphase ist keine Kreditkarte erforderlich.
            </p>
            <p>
              (2) Während der Testphase sind alle Hauptfunktionen der Plattform nutzbar.
              Es werden jedoch <strong>keine echten SMS oder WhatsApp-Nachrichten</strong> versendet,
              es sei denn, die Praxis konfiguriert ausdrücklich einen externen Messaging-Provider.
            </p>
            <p>
              (3) Nach Ablauf der Testphase ohne Abschluss eines Abonnements werden die Daten
              der Praxis für einen Übergangszeitraum aufbewahrt und danach gelöscht.
              Der genaue Zeitraum wird vor Beginn der Testphase kommuniziert.
            </p>
            <p>
              (4){" "}
              <span className="rounded bg-amber-100 px-1 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                [zu prüfen]
              </span>{" "}
              Der Anbieter behält sich vor, die Testphase ohne Angabe von Gründen zu beenden
              oder die Bedingungen anzupassen.
            </p>
          </div>
        </section>

        {/* § 4 */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            § 4 Messaging-Dienste und externe Provider
          </h2>
          <div className="mt-2 space-y-2 leading-relaxed">
            <p>
              (1) Die Plattform integriert sich optional mit externen Messaging-Diensten
              (z. B. Twilio für SMS/WhatsApp). Die Nutzung solcher Dienste ist freiwillig und
              erfordert die eigenständige Einrichtung und Bezahlung eines eigenen Accounts
              beim jeweiligen Drittanbieter.
            </p>
            <p>
              (2) Die Kosten des externen Providers (z. B. Twilio-Nachrichten-Kosten) trägt
              allein die Praxis. Der Anbieter (SlotFill) ist kein Reseller und haftet nicht
              für Kosten oder Ausfälle des externen Providers.
            </p>
            <p>
              (3) <strong>Keine automatische Kaltakquise:</strong> Die Plattform darf
              ausschließlich zur Kommunikation mit Patienten genutzt werden, die der
              Praxis bereits bekannt sind und eine Aufnahme auf die Warteliste beantragt haben.
              Der massenhafte, unaufgeforderte Versand von Nachrichten (Kaltakquise) ist verboten.
            </p>
            <p>
              (4) Die Praxis ist allein verantwortlich dafür, dass vor dem Versand von
              Nachrichten an Patienten die erforderliche datenschutzrechtliche Einwilligung
              oder eine andere geeignete Rechtsgrundlage vorliegt.
            </p>
          </div>
        </section>

        {/* § 5 */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            § 5 Datenschutz und Auftragsverarbeitung (AVV)
          </h2>
          <div className="mt-2 space-y-2 leading-relaxed">
            <p>
              (1) Soweit die Praxis personenbezogene Daten von Patienten in die Plattform
              eingibt (z. B. Namen, Telefonnummern), ist der Anbieter Auftragsverarbeiter
              im Sinne des Art. 4 Nr. 8 DSGVO. Die Praxis ist in diesem Fall Verantwortlicher
              im Sinne des Art. 4 Nr. 7 DSGVO.
            </p>
            <p>
              (2) <strong>Vor der Eingabe von Patientendaten ist der Abschluss eines
              Auftragsverarbeitungsvertrags (AVV) gemäß Art. 28 DSGVO zwingend erforderlich.</strong>{" "}
              Ein AVV kann unter{" "}
              <Link
                href={`/${locale}/avv`}
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                slotfill.de/avv
              </Link>{" "}
              angefordert werden.
            </p>
            <p>
              (3) Die Plattform ist datenschutzbewusst konzipiert. Es kann jedoch keine
              Garantie für die vollständige DSGVO-Konformität der Nutzung durch die Praxis
              übernommen werden. Die Praxis trägt die Verantwortung für die rechtmäßige
              Verarbeitung der Patientendaten.
            </p>
            <p>
              (4){" "}
              <span className="rounded bg-amber-100 px-1 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                [zu prüfen]
              </span>{" "}
              Weitere Datenschutzdetails sind der{" "}
              <Link
                href={`/${locale}/datenschutz`}
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                Datenschutzerklärung
              </Link>{" "}
              zu entnehmen.
            </p>
          </div>
        </section>

        {/* § 6 */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            § 6 Haftung
          </h2>
          <div className="mt-2 space-y-2 leading-relaxed">
            <p>
              (1){" "}
              <span className="rounded bg-amber-100 px-1 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                [zu prüfen]
              </span>{" "}
              Der Anbieter haftet unbeschränkt für Schäden aus der Verletzung des Lebens,
              des Körpers oder der Gesundheit sowie für Schäden, die auf einer vorsätzlichen
              oder grob fahrlässigen Pflichtverletzung des Anbieters oder seiner Erfüllungsgehilfen
              beruhen.
            </p>
            <p>
              (2){" "}
              <span className="rounded bg-amber-100 px-1 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                [zu prüfen]
              </span>{" "}
              Für leicht fahrlässige Verletzungen wesentlicher Vertragspflichten
              (Kardinalpflichten) haftet der Anbieter der Höhe nach begrenzt auf den
              vorhersehbaren, vertragstypischen Schaden.
            </p>
            <p>
              (3) Der Anbieter übernimmt keine Haftung für den wirtschaftlichen Erfolg
              der Praxis, für Terminfüllungsquoten oder für Schäden, die durch den Einsatz
              des externen Messaging-Providers entstehen.
            </p>
            <p>
              (4) Für Datenverluste haftet der Anbieter nur, wenn diese auf ein Verschulden
              des Anbieters zurückzuführen sind und die Praxis regelmäßige Datensicherungen
              vorgenommen hat.
            </p>
          </div>
        </section>

        {/* § 7 */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            § 7 Vertragslaufzeit und Kündigung
          </h2>
          <div className="mt-2 space-y-2 leading-relaxed">
            <p>
              (1) Nach der Testphase wird der Vertrag auf Monatsbasis abgeschlossen,
              sofern die Praxis ein kostenpflichtiges Abonnement wählt.
            </p>
            <p>
              (2){" "}
              <span className="rounded bg-amber-100 px-1 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                [zu prüfen]
              </span>{" "}
              Die Kündigung ist mit einer Frist von 14 Tagen zum Monatsende möglich.
            </p>
            <p>
              (3) Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.
              Ein wichtiger Grund liegt insbesondere vor, wenn die Praxis gegen diese AGB
              verstößt, insbesondere das Verbot der Kaltakquise oder die Pflicht zum AVV-Abschluss.
            </p>
          </div>
        </section>

        {/* § 8 */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            § 8 Schlussbestimmungen
          </h2>
          <div className="mt-2 space-y-2 leading-relaxed">
            <p>
              (1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des
              UN-Kaufrechts (CISG).
            </p>
            <p>
              (2) Gerichtsstand ist Karlsruhe, sofern die Praxis Kaufmann oder juristische
              Person des öffentlichen Rechts ist.
            </p>
            <p>
              (3) Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt
              die Wirksamkeit der übrigen Bestimmungen unberührt.
            </p>
            <p>
              (4){" "}
              <span className="rounded bg-amber-100 px-1 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                [zu prüfen]
              </span>{" "}
              Änderungen dieser AGB werden der Praxis per E-Mail mitgeteilt.
              Sie gelten als genehmigt, wenn die Praxis nicht innerhalb von vier Wochen
              nach Zugang der Änderungsmitteilung schriftlich widerspricht.
            </p>
          </div>
        </section>

        {/* Hinweis AVV */}
        <section className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Wichtig:</strong> Für die Verarbeitung von Patientendaten ist ein
            Auftragsverarbeitungsvertrag (AVV) gemäß Art. 28 DSGVO erforderlich.{" "}
            <Link
              href={`/${locale}/avv`}
              className="underline hover:no-underline"
            >
              Zum AVV →
            </Link>
          </p>
        </section>

      </div>
    </main>
  );
}
