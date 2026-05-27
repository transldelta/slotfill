/**
 * Statische Blog-Artikel als Fallback.
 *
 * Zweck: Wenn die Datenbank noch keine veröffentlichten Artikel enthält
 * (z. B. frische Installation, fehlende Seeding), liefern diese statischen
 * Daten trotzdem lesbare Inhalte – für Besucher und Suchmaschinen.
 *
 * Inhaltliche Hinweise:
 * - Keine Heilversprechen.
 * - Keine Rechtsberatung.
 * - Kein „DSGVO-konform" – stattdessen „datenschutzbewusst".
 * - Keine Fake-Testimonials.
 * - Zielgruppe: Arzt-, Zahnarzt- und Facharztpraxen.
 */

export type StaticPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  published_at: string;
};

export const STATIC_BLOG_POSTS: StaticPost[] = [
  {
    slug: "warteliste-arztpraxis-terminluecken",
    title:
      "Warteliste in der Arztpraxis: So lassen sich kurzfristige Terminlücken besser nutzen",
    excerpt:
      "Kurzfristige Terminabsagen gehören zum Praxisalltag. Mit einer gut gepflegten Warteliste können frei werdende Slots häufig noch am selben Tag gefüllt werden.",
    published_at: "2026-05-01T08:00:00.000Z",
    content: `Kurzfristige Terminabsagen sind für viele Arztpraxen ein alltägliches Problem. Ein Patient sagt morgens ab, die Lücke bleibt offen – und damit fehlt nicht nur Umsatz, sondern auch die Möglichkeit, einem wartenden Patienten schnell zu helfen.

Warum eine gepflegte Warteliste den Unterschied macht

Eine Warteliste ist mehr als eine Liste von Namen. Sie ist ein aktives Instrument, um Kapazitäten besser zu nutzen. Entscheidend ist dabei die Qualität der Einträge: Wer steht auf der Liste, welche Termine sind für die jeweilige Person geeignet, und wer ist auch kurzfristig erreichbar?

Praxen, die ihre Warteliste regelmäßig pflegen und nach Dringlichkeit, Terminart und Verfügbarkeit strukturieren, können bei einer Absage schneller reagieren als Praxen, die erst suchen müssen.

Drei praktische Schritte für eine effektive Warteliste

1. Strukturiert aufnehmen: Beim Eintragen in die Warteliste sollte festgehalten werden, welche Terminarten infrage kommen (z. B. Erstgespräch, Folgebehandlung, Routinekontrolle) und ob der Patient auch kurzfristig (selber Tag) verfügbar ist.

2. Regelmäßig aktualisieren: Veraltete Einträge verlangsamen den Prozess. Empfehlenswert ist es, die Warteliste mindestens monatlich zu überprüfen und inaktive Patienten zu entfernen oder nachzufragen.

3. Klare Prioritäten setzen: Patienten mit dringendem Behandlungsbedarf sollten in der Liste priorisiert werden, damit bei einer Lücke zuerst die Richtigen angesprochen werden.

Welche Rolle digitale Tools spielen können

Digitale Praxissoftware kann helfen, diesen Prozess zu vereinfachen. Statt manuell durch Papierlisten zu blättern, lassen sich Patienten mit passenden Kriterien schneller finden. Tools wie SlotFill unterstützen dabei, bei einer Terminlücke geeignete Kandidaten aus der Warteliste vorzubereiten, sodass die Praxis schnell reagieren kann.

Wichtig: Jede Kontaktaufnahme mit Patienten erfordert ihre Einwilligung und sollte datenschutzbewusst gestaltet sein. Vor dem Einsatz digitaler Kommunikationswege empfiehlt sich eine rechtliche Prüfung.

Fazit

Eine gut gepflegte Warteliste ist eine der wirkungsvollsten Maßnahmen, um kurzfristige Terminlücken zu schließen. Mit klarer Struktur, regelmäßiger Pflege und – bei Bedarf – digitaler Unterstützung lässt sich die Auslastung einer Praxis spürbar verbessern.

SlotFill kostenlos testen: Jetzt 14 Tage testen und sehen, wie die Wartelisten-Verwaltung einfacher wird.`,
  },

  {
    slug: "terminausfaelle-reduzieren-benachrichtigungen",
    title:
      "Terminausfälle reduzieren: Warum vorbereitete Benachrichtigungen Praxen entlasten können",
    excerpt:
      "Wenn ein Termin kurzfristig ausfällt, zählt jede Minute. Vorbereitete Benachrichtigungen können helfen, Wartelistenpatienten schnell und gezielt zu informieren – ohne zusätzlichen manuellen Aufwand.",
    published_at: "2026-05-08T08:00:00.000Z",
    content: `Terminausfälle lassen sich nie vollständig vermeiden. Patienten werden krank, Notfälle treten auf, Pläne ändern sich kurzfristig. Für Praxen bedeutet das: Eine Lücke im Kalender, die gefüllt werden möchte – am besten noch am selben Tag.

Das Problem mit der klassischen Telefonliste

Viele Praxen greifen bei einer Absage zum Telefon und rufen nacheinander Patienten von der Warteliste an. Das ist zeitaufwändig, oft frustrierend (niemand geht ran) und bindet Personal, das gleichzeitig Patienten betreut.

Vorbereitete Benachrichtigungen als Alternative

Ein anderer Ansatz: Statt direkt anzurufen, wird für geeignete Wartelistenpatienten ein persönlicher, sicherer Link vorbereitet. Über diesen Link können Patienten selbst entscheiden, ob sie den frei gewordenen Termin annehmen möchten – in ihrem eigenen Tempo, ohne Telefonwarteschlange.

Dieser Ansatz hat mehrere Vorteile:
- Die Praxis kann mehrere Patienten gleichzeitig informieren, ohne jeden einzeln anrufen zu müssen.
- Patienten, die gerade nicht ans Telefon gehen können, haben trotzdem die Chance zu reagieren.
- Der Prozess läuft weitgehend automatisch ab, sobald die Benachrichtigung vorbereitet wurde.

Worauf bei der Umsetzung geachtet werden sollte

Auch wenn die Technik den Prozess vereinfacht, gibt es einige Punkte, die Praxen beachten sollten:

Einwilligung der Patienten: Patienten sollten vorab zugestimmt haben, auf diesem Weg kontaktiert zu werden. Eine entsprechende Einwilligungserklärung beim Aufnehmen in die Warteliste ist empfehlenswert.

Datenschutzbewusste Gestaltung: Personenbezogene Daten sollten nur so lange und in dem Umfang gespeichert werden, wie es für den Zweck notwendig ist. Eine rechtliche Prüfung des Prozesses – insbesondere bei digitaler Kommunikation – ist ratsam.

Klare Kommunikation: Die Benachrichtigung sollte klar und verständlich formuliert sein. Der Patient sollte wissen, was ihn erwartet, wie er reagieren kann, und bis wann der Termin noch verfügbar ist.

Realistische Erwartungen

Vorbereitete Benachrichtigungen lösen nicht jede Lücke. Mancher Termin bleibt trotzdem offen. Aber sie erhöhen die Chance, dass eine Absage nicht zu einem kompletten Ausfall wird – und entlasten gleichzeitig das Praxisteam.

SlotFill unterstützt genau diesen Prozess: Bei einer Terminlücke werden passende Patienten aus der Warteliste vorbereitet, und die Praxis kann mit einem Klick einen sicheren Link an ausgewählte Personen versenden.

Jetzt ausprobieren: Testen Sie SlotFill 14 Tage kostenlos.`,
  },

  {
    slug: "digitale-warteliste-datenschutz-einwilligung",
    title:
      "Digitale Warteliste für Praxen: Was beim Datenschutz und bei Patienteneinwilligungen wichtig ist",
    excerpt:
      "Digitale Wartelisten bieten Praxen mehr Flexibilität – aber auch mehr Verantwortung beim Umgang mit Patientendaten. Dieser Artikel gibt einen praxisnahen Überblick über relevante Aspekte.",
    published_at: "2026-05-15T08:00:00.000Z",
    content: `Der Einsatz digitaler Wartelisten in Arztpraxen wird immer selbstverständlicher. Gleichzeitig bringt die digitale Verarbeitung von Patientendaten Verantwortung mit sich, die nicht unterschätzt werden sollte.

Dieser Artikel gibt einen Überblick über relevante Aspekte – er ersetzt jedoch keine Rechtsberatung. Bei konkreten Fragen empfiehlt sich immer die Rücksprache mit einem auf Datenschutz spezialisierten Anwalt oder dem Datenschutzbeauftragten der Praxis.

Was bei einer digitalen Warteliste als Patientendaten gilt

Bereits der Name eines Patienten in Kombination mit der Information, dass er auf die Warteliste einer Arztpraxis gesetzt wurde, ist ein personenbezogenes Datum. Je nach Kontext kommen Gesundheitsinformationen (z. B. die Art der benötigten Behandlung) hinzu – diese gelten als besonders schutzwürdige Kategorie.

Das bedeutet: Für jede digitale Verarbeitung dieser Daten braucht es eine Rechtsgrundlage, und die Datenschutz-Grundverordnung (DSGVO) setzt hier enge Rahmenbedingungen.

Einwilligung: Wann nötig, wann nicht?

In vielen Fällen kann die Verarbeitung auf einen Vertrag (bzw. die Vertragsanbahnung) gestützt werden – etwa wenn ein Patient explizit darum bittet, auf die Warteliste gesetzt zu werden. In anderen Fällen, insbesondere bei der Kontaktaufnahme über digitale Kanäle (SMS, WhatsApp, E-Mail), ist eine ausdrückliche Einwilligung des Patienten erforderlich.

Empfehlung: Eine schriftliche Einwilligung – z. B. beim Aufnahmegespräch oder über ein Formular – in der der Patient bestätigt, dass er über digitale Kanäle kontaktiert werden darf, ist eine solide Grundlage.

Wichtige Grundsätze für die datenschutzbewusste Praxis

Datensparsamkeit: Nur die Daten erheben, die tatsächlich benötigt werden. Für eine Warteliste sind in der Regel Name, Kontaktdaten und Art des Anliegens ausreichend.

Zweckbindung: Die erhobenen Daten dürfen nur für den Zweck verwendet werden, für den sie erhoben wurden. Wartelistendaten für Marketingzwecke zu nutzen, wäre ohne separate Einwilligung problematisch.

Löschfristen: Patienten, die einen Termin erhalten haben oder nicht mehr auf der Liste sein möchten, sollten zeitnah aus der digitalen Warteliste entfernt werden.

Auftragsverarbeitung: Wenn eine externe Software für die Warteliste genutzt wird, muss ein Auftragsverarbeitungsvertrag (AVV) mit dem Anbieter abgeschlossen werden.

Was SlotFill in diesem Kontext leistet

SlotFill ist als datenschutzbewusstes Tool konzipiert: Patienten können nur dann über digitale Kanäle kontaktiert werden, wenn sie zuvor eingewilligt haben (opt-in). Der Standardmodus arbeitet ohne automatischen Nachrichtenversand – die Praxis behält die Kontrolle darüber, wer kontaktiert wird.

Hinweis: Die Verwendung von SlotFill ersetzt keine individuelle datenschutzrechtliche Prüfung. Jede Praxis ist verpflichtet, den Einsatz von Software für die Patientenkommunikation eigenverantwortlich zu prüfen.

Fazit

Digitale Wartelisten können Praxen erheblich entlasten – wenn sie datenschutzbewusst eingesetzt werden. Der Schlüssel liegt in klaren Einwilligungsprozessen, Datensparsamkeit und einem verlässlichen Anbieter mit AVV.

Kontakt aufnehmen: Bei Fragen zu SlotFill und dem Einsatz in Ihrer Praxis freuen wir uns auf Ihre Nachricht.`,
  },
];

/** Gibt einen Artikel nach Slug zurück, oder null. */
export function getStaticPost(slug: string): StaticPost | null {
  return STATIC_BLOG_POSTS.find((p) => p.slug === slug) ?? null;
}
