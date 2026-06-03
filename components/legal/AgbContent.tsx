import Link from "next/link";
import { getLegalContent, isRtlLocale, isLegalDraft } from "@/lib/legal-content";

/**
 * AGB-Inhalt – B2B SaaS, lokalisiert
 *
 * DE: Vollständige deutsche AGB (rechtlich maßgeblich).
 * Non-DE: Lokalisierter Titel, Draft-Hinweis, Verweis auf dt. Originalfassung,
 *         Zusammenfassung der Kernpunkte in der Zielsprache.
 *
 * ENTWURF – vor produktivem Einsatz durch einen Rechtsanwalt prüfen lassen.
 */
export function AgbContent({
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
        {c.agbTitle}
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{c.standDate}</p>

      {/* Draft-Hinweis */}
      {isDraft && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300">
          <strong>{isDE ? "ENTWURF –" : "DRAFT –"}</strong>{" "}
          {isDE
            ? "Dieser Text ist ein vorläufiger Entwurf. Er ersetzt keine Rechtsberatung und ist vor produktivem Einsatz durch einen Rechtsanwalt zu prüfen."
            : "This text is a preliminary draft. It does not constitute legal advice and must be reviewed by a qualified attorney before going live."}
        </div>
      )}

      {/* Maßgeblichkeits-Banner für Nicht-DE */}
      {!isDE && c.authorityNotice && (
        <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-300">
          <p>{c.authorityNotice}</p>
          <p className="mt-2">
            <Link
              href="/de/agb"
              className="font-medium underline hover:no-underline"
            >
              {c.authorityLinkLabel}
            </Link>
          </p>
        </div>
      )}

      {/* ─── Deutsche Vollversion ──────────────────────────────────────────── */}
      {isDE && (
        <div className="mt-8 space-y-8 text-sm text-slate-700 dark:text-slate-300">

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              § 1 Geltungsbereich und Vertragsparteien
            </h2>
            <div className="mt-2 space-y-2 leading-relaxed">
              <p>
                (1) Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen
                Clentra (betrieben durch Brahim Ben Abla, Schlesier Str. 64, 76227 Karlsruhe –
                nachfolgend &bdquo;Anbieter&ldquo;) und dem Nutzer der Plattform (nachfolgend &bdquo;Praxis&ldquo; oder
                &bdquo;Nutzerin/Nutzer&ldquo;).
              </p>
              <p>
                (2) Clentra richtet sich ausschließlich an gewerbliche Nutzerinnen und Nutzer
                (Unternehmer im Sinne des § 14 BGB), insbesondere an Arzt- und Therapiepraxen,
                Kliniken und Gesundheitsanbieter.
                Verbraucher im Sinne des § 13 BGB sind vom Nutzungsvertrag ausgeschlossen.
              </p>
              <p>
                (3) Abweichende Bedingungen der Praxis werden nicht anerkannt, es sei denn, der
                Anbieter stimmt ihrer Geltung ausdrücklich schriftlich zu.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              § 2 Leistungsbeschreibung
            </h2>
            <div className="mt-2 space-y-2 leading-relaxed">
              <p>
                (1) Clentra ist eine webbasierte SaaS-Plattform für Terminbuchung, Anfrageverwaltung,
                automatische Terminbestätigung, E-Mail-Benachrichtigung, Feedback und interne
                Praxisautomatisierung.
              </p>
              <p>
                (2) Die automatische Terminbestätigung (Auto-Confirm) funktioniert ausschließlich
                bei korrekter Konfiguration der Öffnungszeiten, Slotlängen und aktiviertem
                Feature-Flag. Eine Garantie für Terminfüllungen oder bestimmte Auslastungsgrade
                wird nicht übernommen.
              </p>
              <p>
                (3) E-Mail-Benachrichtigungen (Buchungsbestätigungen, Anfragen) werden über den
                konfigurierten E-Mail-Provider (Resend) versendet. SMS- und WhatsApp-Nachrichten
                werden <strong>ausschließlich dann</strong> versendet, wenn die Praxis einen externen
                Messaging-Anbieter (z. B. Twilio) bewusst konfiguriert hat.
              </p>
              <p>
                (4) Clentra erbringt keine medizinischen Leistungen und ersetzt keine ärztliche
                Beratung, Diagnose oder Behandlung. Termine und Behandlungsverhältnisse entstehen
                ausschließlich zwischen Patient und Praxis.
              </p>
              <p>
                (5) Die Praxis bleibt verantwortlich für Öffnungszeiten, Verfügbarkeiten, Inhalte,
                Patientendaten und alle medizinischen Entscheidungen.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              § 3 Testphase (Pilot-/Testbetrieb)
            </h2>
            <div className="mt-2 space-y-2 leading-relaxed">
              <p>
                (1) Der Anbieter bietet eine kostenfreie Testphase von <strong>14 Tagen</strong> an.
                Für die Testphase ist keine Kreditkarte erforderlich.
              </p>
              <p>
                (2) Während der Testphase sind alle Hauptfunktionen der Plattform nutzbar.
                Es werden keine echten SMS oder WhatsApp-Nachrichten versendet, es sei denn,
                die Praxis konfiguriert ausdrücklich einen externen Messaging-Provider.
                E-Mail-Benachrichtigungen werden simuliert (Dry-Run), sofern kein
                E-Mail-Provider konfiguriert ist.
              </p>
              <p>
                (3) Nach Ablauf der Testphase ohne Abschluss eines Abonnements werden die Daten
                der Praxis für einen angemessenen Übergangszeitraum aufbewahrt und danach gelöscht.
              </p>
              <p>
                (4) Der Anbieter behält sich vor, die Testphase ohne Angabe von Gründen zu beenden
                oder die Konditionen der Testphase anzupassen.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              § 4 Abonnement und Zahlung
            </h2>
            <div className="mt-2 space-y-2 leading-relaxed">
              <p>
                (1) Nach der Testphase kann die Praxis ein kostenpflichtiges Abonnement abschließen.
                Die aktuellen Preise sind auf der Preisseite einsehbar.
              </p>
              <p>
                (2) Abonnements werden monatlich im Voraus abgerechnet. Preisänderungen werden
                mit einer Frist von mindestens 30 Tagen per E-Mail angekündigt.
              </p>
              <p>
                (3) Die Zahlung erfolgt über den konfigurierten Zahlungsdienstleister. Keine
                Zahlungsdaten werden auf Servern des Anbieters gespeichert.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              § 5 Messaging-Dienste und externe Provider
            </h2>
            <div className="mt-2 space-y-2 leading-relaxed">
              <p>
                (1) Die Plattform kann sich optional mit externen Messaging-Diensten
                (z. B. Twilio für SMS/WhatsApp) verbinden. Die Nutzung solcher Dienste ist freiwillig
                und erfordert die eigenständige Einrichtung und Bezahlung eines eigenen Accounts
                beim jeweiligen Drittanbieter.
              </p>
              <p>
                (2) Die Kosten des externen Providers trägt allein die Praxis. Der Anbieter
                (Clentra) ist kein Reseller und haftet nicht für Kosten oder Ausfälle des
                externen Providers.
              </p>
              <p>
                (3) <strong>Keine automatische Kaltakquise:</strong> Die Plattform darf
                ausschließlich zur Kommunikation mit bekannten Patienten genutzt werden.
                Der massenhafte, unaufgeforderte Versand von Nachrichten (Kaltakquise) ist verboten.
              </p>
              <p>
                (4) Die Praxis ist allein verantwortlich dafür, dass die erforderliche
                datenschutzrechtliche Einwilligung vor dem Versand von Nachrichten vorliegt.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              § 6 Datenschutz und Auftragsverarbeitung (AVV)
            </h2>
            <div className="mt-2 space-y-2 leading-relaxed">
              <p>
                (1) Soweit die Praxis personenbezogene Daten von Patienten in die Plattform
                eingibt, ist der Anbieter Auftragsverarbeiter im Sinne des Art. 4 Nr. 8 DSGVO.
                Die Praxis ist Verantwortlicher im Sinne des Art. 4 Nr. 7 DSGVO.
              </p>
              <p>
                (2) <strong>Vor der Eingabe von Patientendaten ist der Abschluss eines
                Auftragsverarbeitungsvertrags (AVV) gemäß Art. 28 DSGVO zwingend erforderlich.</strong>{" "}
                Ein Muster-AVV ist unter{" "}
                <Link href="/avv" className="text-blue-600 hover:underline dark:text-blue-400">
                  clentra.de/avv
                </Link>{" "}
                abrufbar.
              </p>
              <p>
                (3) Die Plattform ist datenschutzbewusst konzipiert. Es kann jedoch keine
                Garantie für die vollständige DSGVO-Konformität übernommen werden.
              </p>
              <p>
                Weitere Datenschutzdetails sind der{" "}
                <Link href="/datenschutz" className="text-blue-600 hover:underline dark:text-blue-400">
                  Datenschutzerklärung
                </Link>{" "}
                zu entnehmen.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              § 7 Verfügbarkeit und Support
            </h2>
            <div className="mt-2 space-y-2 leading-relaxed">
              <p>
                (1) Der Anbieter bemüht sich um eine hohe Verfügbarkeit der Plattform, übernimmt
                jedoch keine Garantie für eine ununterbrochene Verfügbarkeit. Wartungsarbeiten
                werden nach Möglichkeit angekündigt.
              </p>
              <p>
                (2) Support erfolgt per E-Mail. Eine bestimmte Reaktionszeit wird nicht garantiert.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              § 8 Haftung
            </h2>
            <div className="mt-2 space-y-2 leading-relaxed">
              <p>
                (1) Der Anbieter haftet unbeschränkt für Schäden aus der Verletzung des Lebens,
                des Körpers oder der Gesundheit sowie für vorsätzliche oder grob fahrlässige
                Pflichtverletzungen.
              </p>
              <p>
                (2) Für leicht fahrlässige Verletzungen wesentlicher Vertragspflichten
                (Kardinalpflichten) haftet der Anbieter begrenzt auf den vorhersehbaren,
                vertragstypischen Schaden.
              </p>
              <p>
                (3) Der Anbieter übernimmt keine Haftung für den wirtschaftlichen Erfolg
                der Praxis, für Schäden durch fehlerhafte Konfiguration, für Schäden durch externe
                Messaging-Provider oder für Datenverluste, die auf Handlungen der Praxis zurückzuführen sind.
              </p>
              <p>
                (4) Clentra erbringt keine medizinischen Leistungen. Eine Haftung für
                medizinische Entscheidungen, die auf Basis von Plattformdaten getroffen wurden,
                ist ausgeschlossen.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              § 9 Vertragslaufzeit und Kündigung
            </h2>
            <div className="mt-2 space-y-2 leading-relaxed">
              <p>
                (1) Nach der Testphase wird der Vertrag auf Monatsbasis abgeschlossen,
                sofern die Praxis ein kostenpflichtiges Abonnement wählt.
              </p>
              <p>
                (2) Die Kündigung ist mit einer Frist von 14 Tagen zum Monatsende möglich.
              </p>
              <p>
                (3) Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.
              </p>
              <p>
                (4) Nach Vertragsende werden Daten der Praxis innerhalb eines angemessenen
                Zeitraums unwiderruflich gelöscht. Die Praxis kann vorab eine Datenexport-Anfrage
                stellen.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              § 10 Änderungen des Dienstes und der AGB
            </h2>
            <div className="mt-2 space-y-2 leading-relaxed">
              <p>
                (1) Der Anbieter behält sich vor, die Plattform jederzeit zu ändern, zu erweitern
                oder einzustellen. Wesentliche Änderungen werden rechtzeitig per E-Mail mitgeteilt.
              </p>
              <p>
                (2) Änderungen dieser AGB werden per E-Mail mit einer Ankündigungsfrist von
                mindestens 30 Tagen mitgeteilt. Widerspricht die Praxis nicht innerhalb dieser Frist,
                gelten die neuen AGB als akzeptiert.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              § 11 Schlussbestimmungen
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
                (3) Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt
                die Wirksamkeit der übrigen Bestimmungen unberührt.
              </p>
            </div>
          </section>

          <section className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Wichtig:</strong> Für die Verarbeitung von Patientendaten ist ein
              Auftragsverarbeitungsvertrag (AVV) gemäß Art. 28 DSGVO erforderlich.{" "}
              <Link href="/avv" className="underline hover:no-underline">
                Zum AVV →
              </Link>
            </p>
          </section>

        </div>
      )}

      {/* ─── Nicht-DE: lokalisierte Zusammenfassung ────────────────────────── */}
      {!isDE && (
        <div className="mt-8 space-y-6 text-sm text-slate-700 dark:text-slate-300">

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {c.agbSection2} / {c.agbSection3}
            </h2>
            <ul className="mt-3 space-y-2 leading-relaxed">
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-green-600">✓</span>
                {c.agbKeyTrialDays}
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-green-600">✓</span>
                {c.agbKeyNoSmsTrial}
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-green-600">✓</span>
                {c.agbKeyProviderOptional}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {c.agbSection1} / {c.agbSection4}
            </h2>
            <ul className="mt-3 space-y-2 leading-relaxed">
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-blue-600">ℹ</span>
                {c.agbKeyB2bOnly}
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-red-600">✗</span>
                {c.agbKeyNoColdOutreach}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {c.agbSection5} / {c.agbSection8}
            </h2>
            <ul className="mt-3 space-y-2 leading-relaxed">
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-amber-600">!</span>
                {c.agbKeyDpaRequired}
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-blue-600">ℹ</span>
                {c.agbKeyGermanLaw}
              </li>
            </ul>
          </section>

          <section className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>{c.importantLabel}:</strong> {c.agbKeyDpaRequired}{" "}
              <Link href={`/${locale}/avv`} className="underline hover:no-underline">
                {c.avvTitle} →
              </Link>
            </p>
          </section>

        </div>
      )}
    </main>
  );
}
