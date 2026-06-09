/**
 * lib/brand.ts – Zentrale Markenkommunikations-Konfiguration
 *
 * REGEL: Persönliche Namen erscheinen NICHT als Absender in automatischer Kommunikation.
 * Ausnahme: Impressum / Legal-Pflichtseiten (gesetzlich vorgeschrieben).
 * CONTACT_EMAIL / SUPPORT_EMAIL: persönliche E-Mail als Übergangslösung bis zur
 * Einrichtung einer geschäftlichen Adresse – kein Klarname im Absender.
 *
 * Alle öffentlich sichtbaren E-Mails, Formulare, Trial-Nachrichten und
 * Onboarding-Mails laufen unter "Clentra Team" – ohne Privatname.
 *
 * Keine automatische Kaltakquise.
 * Keine echten SMS/WhatsApp ohne bewusste Provider-Konfiguration.
 * Kommunikation ist ausschließlich Inbound/Transactional.
 */

/** Markenname – immer "Clentra". */
export const BRAND_NAME = "Clentra" as const;

/** Team-Absendername für alle automatischen Mails und Signaturen. */
export const BRAND_TEAM_NAME = "Clentra Team" as const;

/**
 * Support-E-Mail (Transactional-Rückmeldungen).
 * Fallback: persönliche E-Mail des Betreibers bis zur Einrichtung einer
 * geschäftlichen Adresse. Für Produktion SUPPORT_EMAIL als Umgebungsvariable
 * setzen (z. B. eine verifizierte Resend-Domain).
 */
export const SUPPORT_EMAIL: string =
  process.env.SUPPORT_EMAIL ?? "transl.delta@gmail.com";

/**
 * Kontakt-E-Mail (Eingang von Kontaktformularen).
 * Fallback: persönliche E-Mail des Betreibers bis zur Einrichtung einer
 * geschäftlichen Adresse. Für Produktion CONTACT_EMAIL als Umgebungsvariable
 * setzen.
 */
export const CONTACT_EMAIL: string =
  process.env.CONTACT_EMAIL ?? "transl.delta@gmail.com";

/**
 * Öffentliche App-URL für Links in E-Mails und Metadata.
 * Produktion: NEXT_PUBLIC_APP_URL=https://slotfill-pi.vercel.app setzen.
 * Kein Hardcode einer Custom-Domain (solange diese nicht aktiv ist).
 */
export const PUBLIC_APP_URL: string =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://slotfill-pi.vercel.app";

/**
 * Sicherheits-Flag: persönliche Signaturen sind verboten.
 * Wert ist immer false – darf im Code nicht überschrieben werden.
 */
export const PERSONAL_SIGNATURE_ALLOWED = false as const;

/**
 * Pfade, in denen persönliche Anbieterinformationen gesetzlich
 * vorgeschrieben sind (Impressum, Datenschutz, AGB, AVV).
 * Außerhalb dieser Pfade: keine persönlichen Namen.
 */
export const PERSONAL_NAME_ALLOWED_PATHS = [
  "/impressum",
  "/datenschutz",
  "/agb",
  "/avv",
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
