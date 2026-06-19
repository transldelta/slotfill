import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { locales, type Locale } from "@/i18n/routing";
import { LocaleHtmlLang } from "@/components/LocaleHtmlLang";

export const metadata: Metadata = {
  title: "Slotfill – Book clinic appointments online",
  description: "Slotfill helps patients book clinic appointments online in a simple, clear flow. Clinics show available appointment options and receive patient requests — multilingual, GDPR-conscious.",
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

  return (
    <NextIntlClientProvider messages={messages}>
      <LocaleHtmlLang locale={locale} />
      {children}
    </NextIntlClientProvider>
  );
}
