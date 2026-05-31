import type { Metadata } from "next";
import { AgbContent } from "@/components/legal/AgbContent";
import { locales, type Locale } from "@/i18n/routing";

export const metadata: Metadata = {
  title: "AGB – SlotFill",
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleAgbPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale = locales.includes(locale as Locale) ? locale : "de";
  return <AgbContent backHref={`/${safeLocale}`} locale={safeLocale} />;
}
