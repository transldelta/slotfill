import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://slotfill.de";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  const title = `${t("contact.title")} – SlotFill`;
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
      siteName: "SlotFill",
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
