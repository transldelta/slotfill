import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // Routing kennt weiterhin alle Locales (Legal-/Altstruktur), aber öffentliche
  // Produktsprachen sind nur EN/FR/ES — andere werden per Middleware auf /en
  // geleitet (siehe middleware.ts) und stehen NICHT in der Sitemap.
  locales: ['de', 'en', 'zh', 'hi', 'es', 'ar', 'fr', 'pt', 'bn', 'ru'],
  defaultLocale: 'en',
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];
export const locales = routing.locales;
export const defaultLocale = routing.defaultLocale;
