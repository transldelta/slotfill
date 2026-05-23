import de from "@/messages/de.json";

// Verfügbare Sprachen. Weitere Sprachen einfach als JSON in /messages
// anlegen und hier eintragen – der Rest des Codes bleibt unverändert.
const dictionaries: Record<string, Record<string, unknown>> = { de };

const DEFAULT_LOCALE = "de";

// Vorerst fest auf Deutsch. Später per Cookie/Header umschaltbar,
// indem diese Funktion z. B. den Wert aus cookies() liest.
function getLocale(): string {
  return DEFAULT_LOCALE;
}

// Texte werden über einen Punkt-Pfad geholt, z. B. "auth.loginTitle".
// {platzhalter} im Text werden durch die übergebenen Werte ersetzt.
function translate(
  locale: string,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const dict = dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
  const value = key
    .split(".")
    .reduce<unknown>(
      (acc, part) =>
        acc && typeof acc === "object"
          ? (acc as Record<string, unknown>)[part]
          : undefined,
      dict,
    );

  let text = typeof value === "string" ? value : key;
  if (vars) {
    for (const [name, replacement] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(replacement));
    }
  }
  return text;
}

export type Translator = (
  key: string,
  vars?: Record<string, string | number>,
) => string;

// Für Server-Komponenten und Server-Actions.
export async function getTranslations(): Promise<Translator> {
  const locale = getLocale();
  return (key, vars) => translate(locale, key, vars);
}

// Für Client-Komponenten.
export function useTranslations(): Translator {
  const locale = getLocale();
  return (key, vars) => translate(locale, key, vars);
}
