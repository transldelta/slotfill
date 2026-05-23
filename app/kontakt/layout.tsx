import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: `${t("contact.title")} – SlotFill`,
    description: t("contact.subtitle"),
  };
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
