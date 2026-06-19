"use client";

import { useEffect } from "react";

/**
 * Setzt <html lang> und dir passend zur aktiven Locale.
 * Das <html>-Element wird ausschließlich vom Root-Layout (app/layout.tsx)
 * gerendert; hier wird nur das Attribut clientseitig aktualisiert, damit
 * pro Locale die korrekte Sprache/Schreibrichtung gilt. Reiner Effekt —
 * kein Hydration-Mismatch.
 */
export function LocaleHtmlLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);
  return null;
}
