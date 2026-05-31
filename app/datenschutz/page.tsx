import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Datenschutzerklärung – SlotFill",
  robots: { index: false, follow: false },
};

/**
 * Datenschutzerklärung – ENTWURF
 *
 * Datenschutzbewusst konzipiert – keine Garantie für vollständige DSGVO-Konformität.
 * Vor Produktivstart durch einen Datenschutz-Rechtsanwalt oder DSB prüfen lassen.
 *
 * WICHTIG: Diese Seite enthält den Namen des Verantwortlichen (gesetzliche Pflicht
 * gemäß Art. 13/14 DSGVO). Außerhalb dieser Legal-Seite erscheint kein persönlicher Name
 * in automatischer Kommunikation (nur „SlotFill Team&ldquo;).
 */
export default function DatenschutzPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <Link href="/" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
        SlotFill
      </Link>

      <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
        Datenschutzerklärung
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Stand: Mai 2026</p>

      {/* Draft-Hinweis */}
      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300">
        <strong>ENTWURF – datenschutzbewusst vorbereitet, rechtlich noch nicht abschließend geprüft.</strong>{" "}
        Diese Datenschutzerklärung ist ein vorläufiger Entwurf. Sie gibt den aktuellen
        Stand der Datenschutzmaßnahmen wieder, ersetzt jedoch keine Rechtsberatung und ist
        keine Garantie für vollständige DSGVO-Konformität. Vor dem Produktivstart muss eine
        Prüfung durch einen Datenschutzbeauftragten oder Rechtsanwalt erfolgen.
      </div>

      <div className="mt-8 space-y-8 text-sm text-slate-700 dark:text-slate-300">

        {/* 1. Verantwortlicher */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            1. Verantwortlicher
          </h2>
          <div className="mt-2 space-y-1 leading-relaxed">
            <p>Verantwortlicher im Sinne der DSGVO:</p>
            <p className="mt-2">
              SlotFill, betrieben durch Brahim Ben Abla<br />
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

        {/* 2. Grundsätze */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            2. Datenschutzbewusster Ansatz
          </h2>
          <div className="mt-2 space-y-2 leading-relaxed">
            <p>
              SlotFill wurde mit einem datenschutzbewussten Ansatz entwickelt. Das bedeutet:
            </p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Keine automatische Kaltakquise oder Massenversand ohne Einwilligung.</li>
              <li>
                SMS- und WhatsApp-Nachrichten werden nur versendet, wenn die Praxis einen
                externen Provider bewusst aktiviert hat.
              </li>
              <li>Im Testmodus (Trial) werden keine echten Patientennachrichten versendet.</li>
              <li>Persönliche Namen des Betreibers erscheinen nicht in automatischer Kommunikation.</li>
              <li>
                Für die Verarbeitung von Patientendaten ist ein AVV (Art. 28 DSGVO)
                zwischen Praxis und SlotFill erforderlich.
              </li>
            </ul>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              „Datenschutzbewusst vorbereitet&ldquo; bedeutet: technische und organisatorische
              Maßnahmen wurden geplant und teilweise umgesetzt – nicht: vollständige
              DSGVO-Konformität ist garantiert.
            </p>
          </div>
        </section>

        {/* 3. Welche Daten */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            3. Welche Daten werden verarbeitet?
          </h2>
          <div className="mt-2 space-y-3 leading-relaxed">
            <div>
              <h3 className="font-medium text-slate-800 dark:text-slate-200">
                3.1 Praxis-Account-Daten (Registrierung)
              </h3>
              <p className="mt-1">
                Name der Praxis, E-Mail-Adresse, Passwort (gehashed), Rechnungs­informationen
                (soweit anfallend). Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertrags­erfüllung).
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-800 dark:text-slate-200">
                3.2 Patientendaten (Auftragsverarbeitung)
              </h3>
              <p className="mt-1">
                Werden von der Praxis eingetragen: z. B. Patientenname, Telefonnummer, E-Mail,
                Wartelistenstatus. SlotFill verarbeitet diese Daten ausschließlich im Auftrag
                der Praxis (Art. 28 DSGVO). Die Praxis ist Verantwortliche/r.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-800 dark:text-slate-200">
                3.3 Technische Nutzungsdaten
              </h3>
              <p className="mt-1">
                Server-Logs (IP-Adresse, Zeitstempel, aufgerufene Seiten) zur Fehlerdiagnose
                und Sicherheit. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).
              </p>
            </div>
          </div>
        </section>

        {/* 4. Drittanbieter */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            4. Drittanbieter und Auftragsverarbeiter
          </h2>
          <div className="mt-2 space-y-2 leading-relaxed">
            <p>
              SlotFill nutzt folgende Dienste (Auswahl, Stand Entwurf – vor Produktivstart
              vollständig dokumentieren):
            </p>
            <ul className="ml-4 list-disc space-y-1">
              <li>
                <strong>Supabase</strong> (Datenbank, Authentifizierung) – Datenverarbeitung
                gemäß Supabase-DPA.
              </li>
              <li>
                <strong>Vercel</strong> (Hosting) – Datenverarbeitung gemäß Vercel-DPA.
              </li>
              <li>
                <strong>Twilio</strong> (optional, SMS/WhatsApp) – nur wenn von der Praxis
                bewusst konfiguriert. Separate DPA mit Twilio erforderlich.
              </li>
            </ul>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Mit allen Auftragsverarbeitern werden Auftragsverarbeitungsverträge abgeschlossen.
            </p>
          </div>
        </section>

        {/* 5. Betroffenenrechte */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            5. Ihre Rechte als betroffene Person
          </h2>
          <div className="mt-2 space-y-2 leading-relaxed">
            <p>Sie haben das Recht auf:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Auskunft (Art. 15 DSGVO)</li>
              <li>Berichtigung (Art. 16 DSGVO)</li>
              <li>Löschung (Art. 17 DSGVO)</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruch (Art. 21 DSGVO)</li>
              <li>Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)</li>
            </ul>
            <p className="mt-2">
              Zuständige Aufsichtsbehörde (vorläufig):{" "}
              <a
                href="https://www.baden-wuerttemberg.datenschutz.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                Landesbeauftragter für den Datenschutz und die Informationsfreiheit
                Baden-Württemberg
              </a>
            </p>
          </div>
        </section>

        {/* 6. AVV */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            6. Auftragsverarbeitungsvertrag (AVV)
          </h2>
          <div className="mt-2 space-y-2 leading-relaxed">
            <p>
              Praxen, die Patientendaten in SlotFill eingeben, schließen mit SlotFill einen
              AVV gemäß Art. 28 DSGVO ab. Informationen dazu finden Sie unter{" "}
              <Link href="/avv" className="text-blue-600 hover:underline dark:text-blue-400">
                slotfill.de/avv
              </Link>.
            </p>
          </div>
        </section>

        {/* 7. Cookies */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            7. Cookies und Tracking
          </h2>
          <div className="mt-2 space-y-2 leading-relaxed">
            <p>
              SlotFill verwendet technisch notwendige Cookies für die Authentifizierung
              (Sitzungscookies). Es werden keine Tracking-Cookies oder Marketing-Cookies
              ohne Einwilligung gesetzt.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span className="rounded bg-amber-100 px-1 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                [zu prüfen]
              </span>{" "}
              Cookie-Banner-Anforderungen vor Produktivstart prüfen.
            </p>
          </div>
        </section>

        {/* Hinweis */}
        <section className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <strong>Empfehlung:</strong> Diese Datenschutzerklärung vor dem Produktivstart durch
            einen Datenschutzbeauftragten oder auf Datenschutzrecht spezialisierten Rechtsanwalt
            prüfen lassen. Die Markierung „[zu prüfen]&ldquo; kennzeichnet Stellen, die besonderer
            Aufmerksamkeit bedürfen.
          </p>
        </section>

      </div>
    </main>
  );
}
