import type { Metadata } from "next";
import { locales } from "@/i18n/routing";
import { CANONICAL_URL, PUBLIC_BRAND_NAME } from "@/lib/brand";
import { getPageSeo } from "@/lib/page-seo";

// Title/Description + Canonical + hreflang für die Feedback-Seite. Die Seite
// selbst ist eine Client-Komponente und kann keine Metadaten exportieren –
// daher hier im Layout.
// Ohne canonical meldete die Search Console die Sprachvarianten als
// „Duplikat – vom Nutzer nicht als kanonisch festgelegt". Ohne eigenen
// Title/Description erbte die Seite die Werte aus dem [locale]-Layout und war
// je Sprache textgleich mit /termin-buchen und der Startseite – dieselbe
// Meldung blieb dadurch bestehen. Die seitenspezifischen Texte stehen in
// lib/page-seo.ts.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { title, description } = getPageSeo("feedback", locale);

  return {
    title,
    description,
    metadataBase: new URL(CANONICAL_URL),
    alternates: {
      canonical: `/${locale}/feedback`,
      languages: {
        ...(Object.fromEntries(
          locales.map((l) => [l, `/${l}/feedback`]),
        ) as Record<string, string>),
        "x-default": "/en/feedback",
      },
    },
    openGraph: {
      title,
      description,
      url: `/${locale}/feedback`,
      siteName: PUBLIC_BRAND_NAME,
      type: "website",
    },
  };
}

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
