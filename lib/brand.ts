/**
 * lib/brand.ts – Zentrale Markenkommunikations-Konfiguration
 *
 * REGEL: Persönliche Namen erscheinen NICHT in automatischer Kommunikation.
 * Ausnahme: Impressum / Legal-Pflichtseiten (gesetzlich vorgeschrieben).
 *
 * Alle öffentlich sichtbaren E-Mails, Formulare, Trial-Nachrichten und
 * Onboarding-Mails laufen unter "SlotFill Team" – ohne Privatname.
 *
 * Keine automatische Kaltakquise.
 * Keine echten SMS/WhatsApp ohne bewusste Provider-Konfiguration.
 * Kommunikation ist ausschließlich Inbound/Transactional.
 */

/** Markenname – immer "SlotFill". */
export const BRAND_NAME = "SlotFill" as const;

/** Team-Absendername für alle automatischen Mails und Signaturen. */
export const BRAND_TEAM_NAME = "SlotFill Team" as const;

/**
 * Support-E-Mail (Transactional-Rückmeldungen).
 * Kein persönlicher Name, keine Gmail-Adresse.
 */
export const SUPPORT_EMAIL: string =
  process.env.SUPPORT_EMAIL ?? "support@slotfill.de";

/**
 * Kontakt-E-Mail (Eingang von Kontaktformularen).
 * Kein persönlicher Name, keine Gmail-Adresse.
 */
export const CONTACT_EMAIL: string =
  process.env.CONTACT_EMAIL ?? "kontakt@slotfill.de";

/** Öffentliche App-URL für Links in E-Mails. */
export const PUBLIC_APP_URL: string =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://slotfill.de";

/**
 * Sicherheits-Flag: persönliche Signaturen sind verboten.
 * Wert ist immer false – darf im Code nicht überschrieben werden.
 */
export const PERSONAL_SIGNATURE_ALLOWED = false as const;

/**
 * Pfade, in denen persönliche Anbieterinformationen gesetzlich
 * vorgeschrieben sind (Impressum, Datenschutz, AGB).
 * Außerhalb dieser Pfade: keine persönlichen Namen.
 */
export const PERSONAL_NAME_ALLOWED_PATHS = [
  "/impressum",
  "/datenschutz",
  "/agb",
] as const;

/**
 * Erlaubte Kommunikationsmodi.
 * "inbound" = Nutzer kontaktiert uns (Kontaktformular, Registrierung).
 * "transactional" = systeminterne Nachrichten (Trial-Bestätigung, Zahlung).
 * Outbound-Marketing (Kaltakquise) ist verboten.
 */
export const ALLOWED_COMMUNICATION_MODES = [
  "inbound",
  "transactional",
] as const;

export type CommunicationMode = (typeof ALLOWED_COMMUNICATION_MODES)[number];

/** Gibt true zurück, wenn ein Kommunikationsmodus erlaubt ist. */
export function isCommunicationAllowed(mode: string): boolean {
  return ALLOWED_COMMUNICATION_MODES.includes(mode as CommunicationMode);
}
