import Link from "next/link";
import { getLegalContent, isRtlLocale, isLegalDraft } from "@/lib/legal-content";

/**
 * Datenschutzerklärung-Inhalt – lokalisiert, datenschutzbewusst
 *
 * DE: Vollständige deutsche Datenschutzerklärung (rechtlich maßgeblich).
 * Non-DE: Lokalisierter Titel + Zusammenfassung + Verweis auf dt. Originalfassung.
 *
 * KEINE Garantie "DSGVO-konform" – stattdessen "datenschutzbewusst vorbereitet".
 * ENTWURF – vor produktivem Einsatz durch Datenschutzbeauftragten/Rechtsanwalt prüfen lassen.
 */
export function DatenschutzContent({
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
        {c.datenschutzTitle}
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{c.standDate}</p>

      {/* Draft-Hinweis */}
      {isDraft && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300">
          {isDE ? (
            <><strong>ENTWURF – datenschutzbewusst vorbereitet, rechtlich noch nicht abschließend geprüft.</strong>{" "}
            Diese Datenschutzerklärung ist ein vorläufiger Entwurf. Sie ersetzt keine Rechtsberatung und ist
            keine Garantie für vollständige DSGVO-Konformität. Vor dem produktiven Einsatz muss eine
            Prüfung durch einen Datenschutzbeauftragten oder Rechtsanwalt erfolgen.</>
          ) : (
            <><strong>DRAFT – privacy-conscious approach, not yet fully reviewed.</strong>{" "}
            This policy is a preliminary draft. It does not constitute legal advice and is not a
            guarantee of full GDPR compliance.</>
          )}
        </div>
      )}

      {/* Maßgeblichkeits-Banner für Nicht-DE */}
      {!isDE && c.authorityNotice && (
        <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-300">
          <p>{c.authorityNotice}</p>
          <p className="mt-2">
            <Link href="/de/datenschutz" className="font-medium underline hover:no-underline">
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
              1. Verantwortlicher
            </h2>
            <div className="mt-2 space-y-1 leading-relaxed">
              <p>Verantwortlicher im Sinne der DSGVO:</p>
              <p className="mt-2 font-medium">Clentra</p>
              <p>Brahim Ben Abla<br />
                Schlesier Straße 64<br />
                76227 Karlsruhe, Deutschland<br />
                E-Mail:{" "}
                <a href="mailto:transl.delta@gmail.com" className="text-blue-600 hover:underline dark:text-blue-400">
                  transl.delta@gmail.com
                </a>
              </p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Hinweis: Clentra verarbeitet im Auftrag der Praxen auch Daten von Patienten.
                In diesem Rahmen ist die Praxis Verantwortliche/r, Clentra Auftragsverarbeiter (Art. 28 DSGVO).
                Ein Auftragsverarbeitungsvertrag (AVV) ist gesetzlich vorgeschrieben.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              2. Datenschutzbewusster Ansatz
            </h2>
            <div className="mt-2 space-y-2 leading-relaxed">
              <p>Clentra wurde mit einem datenschutzbewussten Ansatz entwickelt. Das bedeutet:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Datensparsame Erhebung – nur was für den Betrieb erforderlich ist.</li>
                <li>Keine automatische Kaltakquise oder Massenversand ohne Einwilligung.</li>
                <li>SMS- und WhatsApp-Nachrichten werden nur versendet, wenn die Praxis einen externen Provider bewusst aktiviert hat.</li>
                <li>Im Testmodus (Trial) werden keine echten Patientennachrichten versendet.</li>
                <li>Persönliche Namen des Betreibers erscheinen nicht in automatischer Kommunikation.</li>
                <li>Für die Verarbeitung von Patientendaten ist ein AVV (Art. 28 DSGVO) erforderlich.</li>
              </ul>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                &bdquo;Datenschutzbewusst vorbereitet&ldquo; bedeutet: technische und organisatorische
                Maßnahmen wurden geplant und umgesetzt – nicht: vollständige DSGVO-Konformität
                ist garantiert. Für rechtssichere Einschätzung bitte anwaltliche Beratung einholen.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              3. Welche Daten werden verarbeitet?
            </h2>
            <div className="mt-2 space-y-3 leading-relaxed">
              <div>
                <h3 className="font-medium">3.1 Website-Zugriffe und technische Logs</h3>
                <p className="mt-1">
                  Beim Aufrufen dieser Website werden technische Zugriffsdaten verarbeitet
                  (IP-Adresse, Zeitstempel, aufgerufene Seiten, Browser-Typ). Diese Daten dienen
                  ausschließlich der Fehlerdiagnose und dem Betrieb. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.
                </p>
              </div>
              <div>
                <h3 className="font-medium">3.2 Praxis-/Admin-Accounts</h3>
                <p className="mt-1">
                  Name, E-Mail-Adresse, Passwort (gehashed), Einstellungen, Abonnementstatus.
                  Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
                </p>
              </div>
              <div>
                <h3 className="font-medium">3.3 Termin- und Buchungsanfragen</h3>
                <p className="mt-1">
                  Name, E-Mail-Adresse, Telefonnummer (optional), gewünschter Termin, Anliegen/Notiz,
                  Datenschutz-Einwilligung, Buchungsstatus.
                  Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung) bzw. bei Patienten
                  im Auftrag der Praxis (Art. 28 DSGVO).
                </p>
              </div>
              <div>
                <h3 className="font-medium">3.4 Feedback und Bewertungen</h3>
                <p className="mt-1">
                  Bewertungstext, Sternebewertung, Zeitstempel. Sofern anonym erhoben:
                  kein Personenbezug. Bei namentlicher Zuordnung: Art. 6 Abs. 1 lit. b DSGVO.
                </p>
              </div>
              <div>
                <h3 className="font-medium">3.5 Patientendaten (Auftragsverarbeitung)</h3>
                <p className="mt-1">
                  Von der Praxis eingetragene Daten (z. B. Name, Telefonnummer, Termin, Anliegen).
                  Clentra verarbeitet diese ausschließlich im Auftrag der Praxis (Art. 28 DSGVO).
                  Die Praxis ist Verantwortliche/r – ein AVV ist abzuschließen.
                </p>
              </div>
              <div>
                <h3 className="font-medium">3.6 Audit-Logs und System-Logs</h3>
                <p className="mt-1">
                  Automatisch generierte Protokolle zu Systemereignissen (z. B. E-Mail-Versand,
                  Buchungsbestätigungen, Fehler). Dienen der Nachvollziehbarkeit und Sicherheit.
                  Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              4. Drittanbieter und Auftragsverarbeiter
            </h2>
            <div className="mt-2 leading-relaxed">
              <p className="mb-2">Folgende Dienstleister werden eingesetzt (je mit eigenem DPA):</p>
              <ul className="ml-4 list-disc space-y-2">
                <li>
                  <strong>Vercel Inc.</strong> (San Francisco, USA) – Hosting und Deployment.
                  Standard Contractual Clauses (SCC) gemäß Vercel-DPA.
                </li>
                <li>
                  <strong>Supabase Inc.</strong> – Datenbank und Authentifizierung.
                  Serverstandort EU (Frankfurt). Gemäß Supabase-DPA.
                </li>
                <li>
                  <strong>Resend Inc.</strong> – E-Mail-Versand (Transaktionale Mails).
                  Gemäß Resend-DPA/SCCs.
                </li>
                <li>
                  <strong>STRATO AG</strong> (Berlin, Deutschland) – Domain-Registrierung
                  für clentra.de.
                </li>
                <li>
                  <strong>Twilio Inc.</strong> (optional, SMS/WhatsApp) – nur wenn von der
                  Praxis bewusst aktiviert. Separate DPA erforderlich.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              5. E-Mail-Benachrichtigungen
            </h2>
            <div className="mt-2 space-y-2 leading-relaxed">
              <p>
                Clentra versendet transaktionale E-Mails (Buchungsbestätigungen,
                Willkommensnachrichten, Systembenachrichtigungen) über Resend.
                Diese Mails werden ausschließlich im Zusammenhang mit dem Nutzungsvertrag
                versendet – keine Werbemails ohne Einwilligung.
              </p>
              <p>
                E-Mail-Adressen werden nicht an Dritte zu Marketingzwecken weitergegeben.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              6. Ihre Rechte als betroffene Person
            </h2>
            <ul className="mt-2 ml-4 list-disc space-y-1 leading-relaxed">
              <li>Auskunft (Art. 15 DSGVO)</li>
              <li>Berichtigung (Art. 16 DSGVO)</li>
              <li>Löschung (Art. 17 DSGVO)</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruch (Art. 21 DSGVO)</li>
              <li>Beschwerde bei Aufsichtsbehörde (Art. 77 DSGVO)</li>
            </ul>
            <p className="mt-2 leading-relaxed">
              Zuständige Aufsichtsbehörde:{" "}
              <a
                href="https://www.baden-wuerttemberg.datenschutz.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                Landesbeauftragter für Datenschutz und Informationsfreiheit Baden-Württemberg (LfDI)
              </a>
            </p>
            <p className="mt-2 leading-relaxed">
              Anfragen richten Sie bitte an:{" "}
              <a href="mailto:transl.delta@gmail.com" className="text-blue-600 hover:underline dark:text-blue-400">
                transl.delta@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              7. Auftragsverarbeitungsvertrag (AVV)
            </h2>
            <p className="mt-2 leading-relaxed">
              Praxen, die Patientendaten in Clentra eingeben, sind gesetzlich verpflichtet,
              einen Auftragsverarbeitungsvertrag (AVV) gemäß Art. 28 DSGVO abzuschließen.
              Ohne AVV dürfen keine Patientendaten verarbeitet werden.
              Informationen und Mustervertrag unter{" "}
              <Link href={`/avv`} className="text-blue-600 hover:underline dark:text-blue-400">
                clentra.de/avv
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              8. Cookies und Tracking
            </h2>
            <p className="mt-2 leading-relaxed">
              Clentra verwendet technisch notwendige Cookies (Sitzungscookies für die Authentifizierung).
              Es werden keine Tracking- oder Marketing-Cookies ohne ausdrückliche Einwilligung eingesetzt.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              9. Datensicherheit
            </h2>
            <p className="mt-2 leading-relaxed">
              Clentra setzt technische und organisatorische Maßnahmen (TOMs) ein, um Daten
              zu schützen: verschlüsselte Übertragung (HTTPS/TLS), Zugriffsbeschränkungen,
              Protokollierung sicherheitsrelevanter Ereignisse. Eine absolute Sicherheit
              kann nicht garantiert werden.
            </p>
          </section>

          <section className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <strong>Empfehlung:</strong> Diese Datenschutzerklärung vor dem produktiven Einsatz durch
              einen Datenschutzbeauftragten oder Rechtsanwalt prüfen lassen.
            </p>
          </section>

        </div>
      )}

      {/* ─── Nicht-DE: lokalisierte Zusammenfassung ────────────────────────── */}
      {!isDE && (
        <div className="mt-8 space-y-6 text-sm text-slate-700 dark:text-slate-300">

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {c.dsSection1}
            </h2>
            <div className="mt-2 space-y-1 leading-relaxed">
              <p className="font-medium">Clentra</p>
              <p>Brahim Ben Abla</p>
              <p>Schlesier Str. 64, 76227 Karlsruhe, Germany</p>
              <p>
                Email:{" "}
                <a href="mailto:transl.delta@gmail.com" className="text-blue-600 hover:underline dark:text-blue-400">
                  transl.delta@gmail.com
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {c.dsSection2}
            </h2>
            <ul className="mt-3 space-y-2 leading-relaxed">
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-green-600">✓</span>
                {c.dsKeyPurposeLimitation}
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-green-600">✓</span>
                {c.dsKeyNoTracking}
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-amber-600">!</span>
                {c.dsKeyAVVRequired}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {c.dsSection5}
            </h2>
            <p className="mt-2 leading-relaxed">
              GDPR Art. 15–22: Access, Rectification, Erasure, Restriction, Portability,
              Objection, Complaint to supervisory authority.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {c.dsSection6}
            </h2>
            <p className="mt-2 leading-relaxed">
              {c.dsKeyAVVRequired}{" "}
              <Link href={`/${locale}/avv`} className="text-blue-600 hover:underline dark:text-blue-400">
                {c.avvTitle} →
              </Link>
            </p>
          </section>

        </div>
      )}
    </main>
  );
}
