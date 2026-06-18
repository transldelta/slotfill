"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { locales, type Locale } from "@/i18n/routing";

const LANGUAGE_NAMES: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
  zh: "中文",
  hi: "हिन्दी",
  es: "Español",
  ar: "العربية",
  fr: "Français",
  pt: "Português",
  bn: "বাংলা",
  ru: "Русский",
};

// Lokalisierte aria-labels (Accessibility) — keine deutschen Labels auf fremden Locales.
const ARIA_CHANGE_LANGUAGE: Record<Locale, string> = {
  de: "Sprache wechseln",
  en: "Change language",
  zh: "切换语言",
  hi: "भाषा बदलें",
  es: "Cambiar idioma",
  ar: "تغيير اللغة",
  fr: "Changer de langue",
  pt: "Mudar idioma",
  bn: "ভাষা পরিবর্তন করুন",
  ru: "Сменить язык",
};

const LANGUAGE_LABELS: Record<Locale, string> = {
  de: "DE",
  en: "EN",
  zh: "ZH",
  hi: "HI",
  es: "ES",
  ar: "AR",
  fr: "FR",
  pt: "PT",
  bn: "BN",
  ru: "RU",
};

type Props = {
  currentLocale: Locale;
  currentPath: string; // z.B. "/", "/pricing", "/blog", "/blog/slug"
};

export function LanguageSwitcher({ currentLocale, currentPath }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  // Schließen bei Klick außerhalb
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function switchLocale(locale: Locale) {
    setOpen(false);
    // Pfad-Swap: /{currentLocale}/rest → /{newLocale}/rest
    const normalizedPath = currentPath.startsWith("/") ? currentPath : `/${currentPath}`;
    const newPath = `/${locale}${normalizedPath === "/" ? "" : normalizedPath}`;
    router.push(newPath);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={ARIA_CHANGE_LANGUAGE[currentLocale] ?? "Change language"}
        className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <span>{LANGUAGE_LABELS[currentLocale]}</span>
        <svg
          className="h-3 w-3 opacity-60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 w-40 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => switchLocale(locale)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-slate-100 dark:hover:bg-slate-800 ${
                locale === currentLocale
                  ? "font-semibold text-blue-600 dark:text-blue-400"
                  : "text-slate-700 dark:text-slate-200"
              }`}
            >
              <span className="w-6 text-xs font-mono opacity-60">{LANGUAGE_LABELS[locale]}</span>
              <span>{LANGUAGE_NAMES[locale]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
