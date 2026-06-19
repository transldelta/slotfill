import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n";
import { CANONICAL_URL } from "@/lib/brand";

const APP_URL = CANONICAL_URL;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  const title = `${t("pricing.title")} – ClinicSlotHub`;
  const description = t("pricing.subtitle");

  return {
    title,
    description,
    metadataBase: new URL(APP_URL),
    alternates: { canonical: "/pricing" },
    openGraph: {
      title,
      description,
      url: "/pricing",
      siteName: "ClinicSlotHub",
      locale: "de_DE",
      type: "website",
    },
    twitter: { card: "summary", title, description },
  };
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
