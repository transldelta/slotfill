import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locales } from "@/i18n/routing";
import { CANONICAL_URL, PUBLIC_BRAND_NAME } from "@/lib/brand";

// Lokalisierte SEO-Metadaten für die Pricing-Seite. Die Seite selbst ist eine
// Client-Komponente und kann keine Metadaten exportieren – daher hier im Layout.
// Quelle der Copy: landing.pricingTitle / landing.pricingSubline (bereits lokalisiert).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing" });
  const title = `${t("pricingTitle")} – ${PUBLIC_BRAND_NAME}`;
  const description = t("pricingSubline");

  return {
    title,
    description,
    metadataBase: new URL(CANONICAL_URL),
    alternates: {
      canonical: `/${locale}/pricing`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `/${l}/pricing`]),
      ) as Record<string, string>,
    },
    openGraph: {
      title,
      description,
      url: `/${locale}/pricing`,
      siteName: PUBLIC_BRAND_NAME,
      type: "website",
    },
  };
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
