import type { Metadata } from "next";
import { AvvContent } from "@/components/legal/AvvContent";

export const metadata: Metadata = {
  title: "AVV – Auftragsverarbeitungsvertrag – Clentra",
  robots: { index: false, follow: false },
};

/** Root-Route /avv – leitet Inhalt über shared Component. */
export default function AvvPage() {
  return <AvvContent backHref="/" locale="de" />;
}
