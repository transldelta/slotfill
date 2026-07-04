import { defineRouting } from 'next-intl/routing';

// Öffentlich aktive Produktsprachen: EN/DE/FR/ES/PT.
// Default ist EN (Zielmärkte: ausgewählte internationale Märkte) –
// clinicslothub.com ohne Locale-Prefix führt deterministisch auf /en.
// localeDetection ist bewusst aus: keine Accept-Language-/Cookie-Umleitung,
// die Locale ergibt sich ausschließlich aus der URL (Language-Switcher).
// Frühere Sprachen (ar, hi, bn, ru, zh) sind nicht mehr öffentlich aktiv und
// werden in der Middleware per 308 auf /en geleitet.
export const routing = defineRouting({
  locales: ['de', 'en', 'fr', 'es', 'pt'],
  defaultLocale: 'en',
  localePrefix: 'always',
  localeDetection: false,
});

/** Frühere, nicht mehr öffentlich aktive Locales (nur für Middleware-Redirect). */
export const RETIRED_LOCALES = ['ar', 'hi', 'bn', 'ru', 'zh'] as const;

export type Locale = (typeof routing.locales)[number];
export const locales = routing.locales;
export const defaultLocale = routing.defaultLocale;
