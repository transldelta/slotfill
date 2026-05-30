import { locales, defaultLocale, type Locale } from '@/i18n/routing';

/**
 * Parst den Accept-Language-Header und gibt die beste passende Locale zurück.
 * Keine Cookies. Keine Client-Detektoren.
 * Fallback: defaultLocale (de).
 */
export function detectLocaleFromAcceptLanguage(header: string | null): Locale {
  if (!header) return defaultLocale;

  // Parse "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7"
  const parts = header
    .split(',')
    .map((part) => {
      const [lang, q] = part.trim().split(';q=');
      const quality = q ? parseFloat(q) : 1.0;
      const base = lang.trim().split('-')[0].toLowerCase();
      return { base, quality };
    })
    .filter((p) => !isNaN(p.quality))
    .sort((a, b) => b.quality - a.quality);

  for (const { base } of parts) {
    if (locales.includes(base as Locale)) {
      return base as Locale;
    }
  }

  return defaultLocale;
}
