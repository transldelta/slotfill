import type { Metadata } from "next";
import { headers } from "next/headers";
import { locales } from "@/i18n/routing";
import { CANONICAL_URL, PUBLIC_BRAND_NAME } from "@/lib/brand";
import { getPageSeo } from "@/lib/page-seo";
import TerminBuchenClient from "./TerminBuchenClient";

// Server-Wrapper: erzwingt dynamisches Rendern (kein statisches SSG-Artefakt).
// So liefert die Route bei jedem Abruf frisch die aktuelle, sichere Copy aus —
// inklusive Live-Parity-Marker. Route-Segment-Config muss in einer Server-Datei
// stehen; die interaktive Logik bleibt im Client-Component.
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Title/Description + Canonical + hreflang, damit die fünf Sprachvarianten in
// der Search Console nicht als „Duplikat ohne kanonische Seite" zusammenfallen
// (gleiches Muster wie /kontakt und /pricing). Ohne eigenen Title/Description
// erbte die Seite die Werte aus dem [locale]-Layout und war je Sprache
// textgleich mit /feedback und der Startseite – die Duplikat-Meldung blieb
// dadurch trotz korrekter Canonicals bestehen. Die seitenspezifischen Texte
// stehen in lib/page-seo.ts.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { title, description } = getPageSeo("booking", locale);

  return {
    title,
    description,
    metadataBase: new URL(CANONICAL_URL),
    alternates: {
      canonical: `/${locale}/termin-buchen`,
      languages: {
        ...(Object.fromEntries(
          locales.map((l) => [l, `/${l}/termin-buchen`]),
        ) as Record<string, string>),
        "x-default": "/en/termin-buchen",
      },
    },
    openGraph: {
      title,
      description,
      url: `/${locale}/termin-buchen`,
      siteName: PUBLIC_BRAND_NAME,
      type: "website",
    },
  };
}

export default function TerminBuchenPage() {
  // headers() markiert die Route als dynamisch (Router-Cache-TTL = 0), wie auf der
  // Startseite — verhindert Auslieferung eines veralteten statischen Artefakts.
  void headers();
  return <TerminBuchenClient />;
}
