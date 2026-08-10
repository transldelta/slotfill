import type { Metadata } from "next";
import { headers } from "next/headers";
import { locales } from "@/i18n/routing";
import { CANONICAL_URL } from "@/lib/brand";
import TerminBuchenClient from "./TerminBuchenClient";

// Server-Wrapper: erzwingt dynamisches Rendern (kein statisches SSG-Artefakt).
// So liefert die Route bei jedem Abruf frisch die aktuelle, sichere Copy aus —
// inklusive Live-Parity-Marker. Route-Segment-Config muss in einer Server-Datei
// stehen; die interaktive Logik bleibt im Client-Component.
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Canonical + hreflang, damit die fünf Sprachvarianten in der Search Console
// nicht als „Duplikat ohne kanonische Seite" zusammenfallen (gleiches Muster
// wie /kontakt und /pricing).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
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
  };
}

export default function TerminBuchenPage() {
  // headers() markiert die Route als dynamisch (Router-Cache-TTL = 0), wie auf der
  // Startseite — verhindert Auslieferung eines veralteten statischen Artefakts.
  void headers();
  return <TerminBuchenClient />;
}
