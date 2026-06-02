import type { Metadata } from "next";
import { ImpressumContent } from "@/components/legal/ImpressumContent";

export const metadata: Metadata = {
  title: "Impressum – SlotFill",
  robots: { index: false, follow: false },
};

/** Root-Route /impressum – leitet Inhalt über shared Component. */
export default function ImpressumPage() {
  return <ImpressumContent backHref="/" locale="de" />;
}
