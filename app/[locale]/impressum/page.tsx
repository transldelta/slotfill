import type { Metadata } from "next";
import { ImpressumContent } from "@/components/legal/ImpressumContent";
import { locales, type Locale } from "@/i18n/routing";

export const metadata: Metadata = {
  title: "Impressum – SlotFill",
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleImpressumPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale = locales.includes(locale as Locale) ? locale : "de";
  return <ImpressumContent backHref={`/${safeLocale}`} locale={safeLocale} />;
}
