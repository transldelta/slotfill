import Link from "next/link";
import { getLegalContent, isRtlLocale, isLegalDraft } from "@/lib/legal-content";

/**
 * AGB-Inhalt – lokalisiert
 *
 * DE: Vollständige deutsche AGB (rechtlich maßgeblich).
 * Non-DE: Lokalisierter Titel, Draft-Hinweis, Verweis auf dt. Originalfassung,
 *         Zusammenfassung der Kernpunkte in der Zielsprache.
 *         Keine deutschen Abschnittsüberschriften auf nicht-deutschen Seiten.
 *
 * Keine persönlichen Namen in automatischer Kommunikation.
 * Keine echte SMS/WhatsApp ohne bewusste Provider-Konfiguration.
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
          <strong>{isDE ? "ENTWURF –" : "DRAFT –"}</strong> {c.draftNotice.replace(/^(ENTWURF|DRAFT)\s*[–-]\s*/, "")}
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
              § 1 Geltungsbereich
            </h2>
            <div className="mt-2 space-y-2 leading-relaxed">
              <p>
                (1) Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen
                PraxisFlow (betrieben durch Brahim Ben Abla, Schlesier Straße 64, 76227 Karlsruhe –
                nachfolgend &bdquo;Anbieter&ldquo;) und dem Nutzer der Plattform (nachfolgend &bdquo;Praxis&ldquo; oder
                &bdquo;Nutzerin/Nutzer&ldquo;).
              </p>
              <p>
                (2) PraxisFlow richtet sich ausschließlich an gewerbliche Nutzerinnen und Nutzer
                (Unternehmer im Sinne des § 14 BGB), insbesondere an Arzt- und Therapiepraxen.
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
                (1) PraxisFlow ist eine webbasierte SaaS-Plattform zur Verwaltung von Patientenwarte­listen
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
                (2) Die Kosten des externen Providers trägt allein die Praxis. Der Anbieter
                (PraxisFlow) ist kein Reseller und haftet nicht für Kosten oder Ausfälle des
                externen Providers.
              </p>
              <p>
                (3) <strong>Keine automatische Kaltakquise:</strong> Die Plattform darf
                ausschließlich zur Kommunikation mit Patienten genutzt werden, die der
                Praxis bereits bekannt sind und eine Aufnahme auf die Warteliste beantragt haben.
                Der massenhafte, unaufgeforderte Versand von Nachrichten (Kaltakquise) ist verboten.
              </p>
              <p>
                (4) Die Praxis ist allein verantwortlich dafür, dass vor dem Versand von
                Nachrichten die erforderliche datenschutzrechtliche Einwilligung vorliegt.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              § 5 Datenschutz und Auftragsverarbeitung (AVV)
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
                Ein AVV kann unter{" "}
                <Link href={`/${locale}/avv`} className="text-blue-600 hover:underline dark:text-blue-400">
                  slotfill-pi.vercel.app/avv
                </Link>{" "}
                angefordert werden.
              </p>
              <p>
                (3) Die Plattform ist datenschutzbewusst konzipiert. Es kann jedoch keine
                Garantie für die vollständige DSGVO-Konformität übernommen werden.
              </p>
              <p>
                (4){" "}
                <span className="rounded bg-amber-100 px-1 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  [zu prüfen]
                </span>{" "}
                Weitere Datenschutzdetails sind der{" "}
                <Link href={`/${locale}/datenschutz`} className="text-blue-600 hover:underline dark:text-blue-400">
                  Datenschutzerklärung
                </Link>{" "}
                zu entnehmen.
              </p>
            </div>
          </section>

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
                des Körpers oder der Gesundheit sowie für vorsätzliche oder grob fahrlässige
                Pflichtverletzungen.
              </p>
              <p>
                (2){" "}
                <span className="rounded bg-amber-100 px-1 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  [zu prüfen]
                </span>{" "}
                Für leicht fahrlässige Verletzungen wesentlicher Vertragspflichten
                haftet der Anbieter begrenzt auf den vorhersehbaren, vertragstypischen Schaden.
              </p>
              <p>
                (3) Der Anbieter übernimmt keine Haftung für den wirtschaftlichen Erfolg
                der Praxis oder für Schäden durch den externen Messaging-Provider.
              </p>
            </div>
          </section>

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
              </p>
            </div>
          </section>

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
                (3) Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt
                die Wirksamkeit der übrigen Bestimmungen unberührt.
              </p>
              <p>
                (4){" "}
                <span className="rounded bg-amber-100 px-1 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  [zu prüfen]
                </span>{" "}
                Änderungen dieser AGB werden per E-Mail mitgeteilt und gelten als genehmigt,
                wenn die Praxis nicht innerhalb von vier Wochen schriftlich widerspricht.
              </p>
            </div>
          </section>

          <section className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Wichtig:</strong> Für die Verarbeitung von Patientendaten ist ein
              Auftragsverarbeitungsvertrag (AVV) gemäß Art. 28 DSGVO erforderlich.{" "}
              <Link href={`/${locale}/avv`} className="underline hover:no-underline">
                Zum AVV →
              </Link>
            </p>
          </section>

        </div>
      )}

      {/* ─── Nicht-DE: lokalisierte Zusammenfassung ────────────────────────── */}
      {!isDE && (
        <div className="mt-8 space-y-6 text-sm text-slate-700 dark:text-slate-300">

          {/* Key facts as bullet list */}
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

          {/* AVV hint */}
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
