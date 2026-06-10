import Link from "next/link";
import { getLegalContent, isRtlLocale, isLegalDraft } from "@/lib/legal-content";

/**
 * Datenschutzerklärung-Inhalt – lokalisiert, datenschutzbewusst
 *
 * DE: Vollständige deutsche Datenschutzerklärung (rechtlich maßgeblich).
 * Non-DE: Lokalisierter Titel + Zusammenfassung + Verweis auf dt. Originalfassung.
 *
 * KEINE Garantie "DSGVO-konform" – stattdessen "datenschutzbewusst vorbereitet".
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
            <><strong>Hinweis:</strong>{" "}
            Diese Datenschutzerklärung ist als vorbereitetes Muster für den SaaS-Prototyp hinterlegt und datenschutzbewusst gestaltet.
            Sie ersetzt keine Rechtsberatung. Vor dem produktiven Einsatz mit echten Kunden ist eine Prüfung
            durch einen Datenschutzbeauftragten oder Rechtsanwalt erforderlich.</>
          ) : (
            <><strong>Note:</strong>{" "}
            This privacy policy is a prepared template for the SaaS prototype. It does not constitute legal advice.
            A review by a qualified privacy lawyer is required before going live with real customers.</>
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
              <p className="mt-2">
                ClinicSlotHub, betrieben durch Brahim Ben Abla<br />
                Schlesier Straße 64<br />
                76227 Karlsruhe, Deutschland<br />
                E-Mail:{" "}
                <a href="mailto:transl.delta@gmail.com" className="text-blue-600 hover:underline dark:text-blue-400">
                  transl.delta@gmail.com
                </a>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                (Hinweis: E-Mail-Adresse ist vorläufig. Vor Produktivstart wird eine geschäftliche
                E-Mail-Adresse eingerichtet.)
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              2. Datenschutzbewusster Ansatz
            </h2>
            <div className="mt-2 space-y-2 leading-relaxed">
              <p>ClinicSlotHub wurde mit einem datenschutzbewussten Ansatz entwickelt. Das bedeutet:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Keine automatische Kaltakquise oder Massenversand ohne Einwilligung.</li>
                <li>SMS- und WhatsApp-Nachrichten werden nur versendet, wenn die Praxis einen externen Provider bewusst aktiviert hat.</li>
                <li>Im Testmodus (Trial) werden keine echten Patientennachrichten versendet.</li>
                <li>Persönliche Namen des Betreibers erscheinen nicht in automatischer Kommunikation.</li>
                <li>Für die Verarbeitung von Patientendaten ist ein AVV (Art. 28 DSGVO) erforderlich.</li>
              </ul>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                &bdquo;Datenschutzbewusst vorbereitet&ldquo; bedeutet: technische und organisatorische
                Maßnahmen wurden geplant und teilweise umgesetzt – nicht: vollständige DSGVO-Konformität
                ist garantiert.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              3. Welche Daten werden verarbeitet?
            </h2>
            <div className="mt-2 space-y-3 leading-relaxed">
              <div>
                <h3 className="font-medium">3.1 Praxis-Account-Daten</h3>
                <p className="mt-1">Name, E-Mail-Adresse, Passwort (gehashed), Rechnungsinformationen. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.</p>
              </div>
              <div>
                <h3 className="font-medium">3.2 Patientendaten (Auftragsverarbeitung)</h3>
                <p className="mt-1">Eingetragen von der Praxis (z. B. Name, Telefonnummer). ClinicSlotHub verarbeitet diese im Auftrag der Praxis (Art. 28 DSGVO). Die Praxis ist Verantwortliche/r.</p>
              </div>
              <div>
                <h3 className="font-medium">3.3 Technische Nutzungsdaten</h3>
                <p className="mt-1">Server-Logs (IP, Zeitstempel) zur Fehlerdiagnose. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              4. Drittanbieter und Auftragsverarbeiter
            </h2>
            <ul className="mt-2 ml-4 list-disc space-y-1 leading-relaxed">
              <li><strong>Supabase</strong> (Datenbank, Authentifizierung) – gemäß Supabase-DPA.</li>
              <li><strong>Vercel</strong> (Hosting) – gemäß Vercel-DPA.</li>
              <li><strong>Twilio</strong> (optional, SMS/WhatsApp) – nur wenn von der Praxis bewusst konfiguriert. Separate DPA erforderlich.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              5. Ihre Rechte als betroffene Person
            </h2>
            <ul className="mt-2 ml-4 list-disc space-y-1 leading-relaxed">
              <li>Auskunft (Art. 15)</li>
              <li>Berichtigung (Art. 16)</li>
              <li>Löschung (Art. 17)</li>
              <li>Einschränkung (Art. 18)</li>
              <li>Datenübertragbarkeit (Art. 20)</li>
              <li>Widerspruch (Art. 21)</li>
              <li>Beschwerde bei Aufsichtsbehörde (Art. 77)</li>
            </ul>
            <p className="mt-2 leading-relaxed">
              Zuständige Aufsichtsbehörde:{" "}
              <a href="https://www.baden-wuerttemberg.datenschutz.de" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                LfDI Baden-Württemberg
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              6. Auftragsverarbeitungsvertrag (AVV)
            </h2>
            <p className="mt-2 leading-relaxed">
              Praxen, die Patientendaten eingeben, schließen einen AVV gemäß Art. 28 DSGVO ab.
              Informationen unter{" "}
              <Link href={`/${locale}/avv`} className="text-blue-600 hover:underline dark:text-blue-400">
                clinicslothub.com/avv
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              7. Cookies und Tracking
            </h2>
            <p className="mt-2 leading-relaxed">
              ClinicSlotHub verwendet technisch notwendige Cookies (Sitzungscookies). Keine Tracking-
              oder Marketing-Cookies ohne Einwilligung.{" "}
              <span className="rounded bg-amber-100 px-1 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                [zu prüfen]
              </span>
            </p>
          </section>

          <section className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <strong>Empfehlung:</strong> Diese Datenschutzerklärung vor dem Produktivstart durch
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
              <p>ClinicSlotHub — operated by Brahim Ben Abla</p>
              <p>Schlesier Straße 64, 76227 Karlsruhe, Germany</p>
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
