import type { Metadata } from "next";
import { DatenschutzContent } from "@/components/legal/DatenschutzContent";
import { locales, type Locale } from "@/i18n/routing";

export const metadata: Metadata = {
  title: "Datenschutzerklärung – ClinicSlotHub",
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleDatenschutzPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale = locales.includes(locale as Locale) ? locale : "de";
  return <DatenschutzContent backHref={`/${safeLocale}`} locale={safeLocale} />;
}
