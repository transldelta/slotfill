import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { locales, type Locale } from "@/i18n/routing";
import { LocaleHtmlLang } from "@/components/LocaleHtmlLang";

export const metadata: Metadata = {
  title: "ClinicSlotHub – Book clinic appointments online",
  description: "ClinicSlotHub helps patients book clinic appointments online in a simple, clear flow. Clinics show available appointment options and receive patient requests — multilingual, GDPR-conscious.",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// WICHTIG: Dieses Layout rendert KEIN <html>/<body>. Das übernimmt ausschließlich
// das Root-Layout (app/layout.tsx). Ein zweites <html>/<body> hier würde zu
// doppelt verschachtelten Dokument-Tags und damit zu einem Hydration-Crash
// (React #418/#423 → "client-side exception") führen.
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  // SICHERHEIT/SAUBERKEIT: Nur öffentliche Namespaces an den Client ausliefern.
  // next-intl shippt alle übergebenen Message-Werte ins HTML/i18n-JSON. Private
  // Namespaces (auth/dashboard/admin/errors/…) dürfen NICHT öffentlich im HTML
  // landen. Öffentliche [locale]-Client-Komponenten nutzen nur diese Namespaces:
  const PUBLIC_NAMESPACES = ["nav", "landing", "pricing", "contact", "common"] as const;
  const publicMessages = Object.fromEntries(
    PUBLIC_NAMESPACES.filter((ns) => ns in (messages as Record<string, unknown>)).map(
      (ns) => [ns, (messages as Record<string, unknown>)[ns]],
    ),
  );

  return (
    <NextIntlClientProvider messages={publicMessages}>
      <LocaleHtmlLang locale={locale} />
      {children}
    </NextIntlClientProvider>
  );
}
