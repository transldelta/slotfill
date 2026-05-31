import Link from "next/link";

/**
 * Impressum-Inhalt – § 5 DDG (Digitale-Dienste-Gesetz)
 *
 * Persönliche Daten des Anbieters erscheinen ausschließlich auf dieser Seite
 * (gesetzliche Pflicht). In automatischer Kommunikation, Marketing und Trial-Mails
 * wird ausschließlich „SlotFill Team" als Absender verwendet.
 *
 * ENTWURF – vor Veröffentlichung durch einen Rechtsanwalt prüfen lassen.
 */
export function ImpressumContent({ backHref = "/" }: { backHref?: string }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <Link href={backHref} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
        SlotFill
      </Link>

      <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
        Impressum
      </h1>

      {/* Draft-Hinweis */}
      <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300">
        <strong>Hinweis:</strong> Dieser Text ist ein vorläufiger Entwurf und wurde noch nicht
        abschließend rechtlich geprüft. Vor dem Produktivstart muss er durch finale, rechtlich
        geprüfte Texte ersetzt werden. Er ersetzt keine Rechtsberatung.
      </p>

      <div className="mt-8 space-y-6 text-sm text-slate-700 dark:text-slate-300">

        {/* § 5 DDG – Pflichtangaben */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Angaben gemäß § 5 DDG
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
            Kontakt
          </h2>
          <div className="mt-2 space-y-1">
            <p>
              E-Mail:{" "}
              <a
                href="mailto:transl.delta@gmail.com"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                transl.delta@gmail.com
              </a>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              (Hinweis: Diese Adresse ist vorläufig. Vor Produktivstart wird eine dedizierte
              geschäftliche E-Mail-Adresse eingerichtet.)
            </p>
          </div>
        </section>

        {/* Verantwortlich für Inhalte */}
        <section>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
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
            Haftungsausschluss
          </h2>
          <div className="mt-2 space-y-3">
            <div>
              <h3 className="font-medium text-slate-800 dark:text-slate-200">Haftung für Inhalte</h3>
              <p className="mt-1 leading-relaxed">
                Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt.
                Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch
                keine Gewähr übernommen werden. Die Inhalte ersetzen keine rechtliche,
                medizinische oder datenschutzrechtliche Beratung.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-800 dark:text-slate-200">Haftung für Links</h3>
              <p className="mt-1 leading-relaxed">
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte
                wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch
                keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der
                jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
              </p>
            </div>
          </div>
        </section>

        {/* Interner Hinweis */}
        <section className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <strong>Intern:</strong> Persönliche Anbieterinformationen erscheinen ausschließlich
            auf dieser Seite (gesetzliche Pflicht nach § 5 DDG). In automatischer Kommunikation,
            E-Mails, Trial-Benachrichtigungen und Marketing wird ausschließlich
            &bdquo;SlotFill Team&ldquo; als Absender verwendet.
          </p>
        </section>

      </div>
    </main>
  );
}
