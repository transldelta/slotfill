// Server Component wrapper.
//
// Calling headers() is the canonical Next.js 14 way to opt a route out of
// static pre-rendering and the Router Cache.  Without it, "use client" child
// routes remain SSG (●) and the Router Cache can serve a stale pre-rendered
// payload for up to 5 min after a deploy, so users still see the old version.
//
// With headers() the route becomes dynamic (ƒ) – rendered per request, never
// served from the in-memory Router Cache.
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { locales } from "@/i18n/routing";
import { CANONICAL_URL, PUBLIC_BRAND_NAME } from "@/lib/brand";
export const dynamic = "force-dynamic";

import LocaleContactPageClient from "./LocaleContactPageClient";

// Lokalisierte SEO-Metadaten für die Kontaktseite (Praxiszugang-/Anfragefluss).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  const title = `${t("title")} – ${PUBLIC_BRAND_NAME}`;
  const description = t("subtitle");

  return {
    title,
    description,
    metadataBase: new URL(CANONICAL_URL),
    alternates: {
      canonical: `/${locale}/kontakt`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `/${l}/kontakt`]),
      ) as Record<string, string>,
    },
    openGraph: {
      title,
      description,
      url: `/${locale}/kontakt`,
      siteName: PUBLIC_BRAND_NAME,
      type: "website",
    },
  };
}

export default function LocaleContactPage() {
  void headers(); // marks route as dynamic – bypasses Router Cache
  return <LocaleContactPageClient />;
}
