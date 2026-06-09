import type { Metadata } from "next";
import { AvvContent } from "@/components/legal/AvvContent";
import { locales, type Locale } from "@/i18n/routing";

export const metadata: Metadata = {
  title: "AVV – Auftragsverarbeitungsvertrag – PraxisFlow",
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleAvvPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale = locales.includes(locale as Locale) ? locale : "de";
  return <AvvContent backHref={`/${safeLocale}`} locale={safeLocale} />;
}
