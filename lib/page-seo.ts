/**
 * Seitenspezifische SEO-Texte (Title / Description) je Locale.
 *
 * HINTERGRUND: Seiten ohne eigene Metadaten erben Title und Description aus
 * `app/[locale]/layout.tsx` (LAYOUT_META). Dadurch trugen /feedback und
 * /termin-buchen je Sprache exakt denselben Title und dieselbe Description wie
 * die Startseite – die Search Console meldete „Duplikat – vom Nutzer nicht als
 * kanonisch festgelegt", obwohl die Canonicals korrekt gesetzt sind.
 * Jede hier gepflegte Seite bekommt deshalb einen eigenen, zum Seiteninhalt
 * passenden Title und eine eigene Description in allen fünf Produktsprachen.
 *
 * INHALTLICHE REGELN (siehe CLAUDE.md):
 * - Anfrage-Sprache, keine Buchungs-/Bestätigungssprache.
 * - Keine Soforttermin-, 24h- oder Garantie-Versprechen.
 * - Keine Compliance-Garantien, keine medizinische Beratung.
 *
 * Öffentliche Produktsprachen: EN/DE/FR/ES/PT (EN ist Fallback).
 */

export interface PageSeoText {
  title: string;
  description: string;
}

/** /[locale]/feedback – Sternebewertung + optionaler Kommentar, rein intern. */
const FEEDBACK: Record<string, PageSeoText> = {
  en: {
    title: "Give feedback – rate ClinicSlotHub",
    description:
      "Rate ClinicSlotHub from 1 to 5 stars and add an optional comment. Your feedback is stored internally only and is never published automatically.",
  },
  de: {
    title: "Feedback geben – ClinicSlotHub bewerten",
    description:
      "Bewerten Sie ClinicSlotHub mit 1 bis 5 Sternen und geben Sie optional einen Kommentar ab. Ihr Feedback wird ausschließlich intern gespeichert.",
  },
  fr: {
    title: "Donner un avis – évaluer ClinicSlotHub",
    description:
      "Évaluez ClinicSlotHub de 1 à 5 étoiles et ajoutez un commentaire facultatif. Votre avis est conservé uniquement en interne et jamais publié automatiquement.",
  },
  es: {
    title: "Enviar opinión – valorar ClinicSlotHub",
    description:
      "Valore ClinicSlotHub de 1 a 5 estrellas y añada un comentario opcional. Su opinión se guarda solo internamente y nunca se publica de forma automática.",
  },
  pt: {
    title: "Enviar feedback – avaliar o ClinicSlotHub",
    description:
      "Avalie o ClinicSlotHub de 1 a 5 estrelas e acrescente um comentário opcional. O seu feedback é guardado apenas internamente e nunca é publicado automaticamente.",
  },
};

/** /[locale]/termin-buchen – Anfrageformular, Bestätigung erfolgt manuell. */
const BOOKING: Record<string, PageSeoText> = {
  en: {
    title: "Request an appointment – patient request form",
    description:
      "Send an appointment request to your practice online. The practice reviews every request and replies manually by email – a request is not yet a confirmed appointment.",
  },
  de: {
    title: "Termin anfragen – Anfrageformular für Patient:innen",
    description:
      "Senden Sie Ihre Terminanfrage online an Ihre Praxis. Die Praxis prüft jede Anfrage und meldet sich manuell per E-Mail – die Anfrage ist noch keine Terminbestätigung.",
  },
  fr: {
    title: "Demander un rendez-vous – formulaire pour patients",
    description:
      "Envoyez votre demande de rendez-vous en ligne à votre cabinet. Chaque demande est examinée et confirmée manuellement par e-mail : ce n'est pas encore un rendez-vous confirmé.",
  },
  es: {
    title: "Solicitar una cita – formulario para pacientes",
    description:
      "Envíe su solicitud de cita a su consulta en línea. La consulta revisa cada solicitud y responde manualmente por correo electrónico: una solicitud aún no es una cita confirmada.",
  },
  pt: {
    title: "Solicitar uma consulta – formulário para pacientes",
    description:
      "Envie o seu pedido de consulta online ao seu consultório. Cada pedido é analisado e respondido manualmente por e-mail – um pedido ainda não é uma consulta confirmada.",
  },
};

export type SeoPageKey = "feedback" | "booking";

/** Alle gepflegten Seiten – auch von den SEO-Guard-Tests gelesen. */
export const PAGE_SEO: Record<SeoPageKey, Record<string, PageSeoText>> = {
  feedback: FEEDBACK,
  booking: BOOKING,
};

/** Liefert Title/Description einer Seite für eine Locale (EN als Fallback). */
export function getPageSeo(page: SeoPageKey, locale: string): PageSeoText {
  const byLocale = PAGE_SEO[page];
  return byLocale[locale] ?? byLocale.en;
}
