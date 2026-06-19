import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n";
import { CANONICAL_URL } from "@/lib/brand";

const APP_URL = CANONICAL_URL;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  const title = `${t("contact.title")} – ClinicSlotHub`;
  const description = t("contact.subtitle");

  return {
    title,
    description,
    metadataBase: new URL(APP_URL),
    alternates: { canonical: "/kontakt" },
    openGraph: {
      title,
      description,
      url: "/kontakt",
      siteName: "ClinicSlotHub",
      locale: "de_DE",
      type: "website",
    },
    twitter: { card: "summary", title, description },
  };
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
