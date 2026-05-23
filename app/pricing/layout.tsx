import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: `${t("pricing.title")} – SlotFill`,
    description: t("pricing.subtitle"),
  };
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
