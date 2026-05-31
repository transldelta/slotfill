import type { Metadata } from "next";
import { DatenschutzContent } from "@/components/legal/DatenschutzContent";

export const metadata: Metadata = {
  title: "Datenschutzerklärung – SlotFill",
  robots: { index: false, follow: false },
};

/** Root-Route /datenschutz – leitet Inhalt über shared Component. */
export default function DatenschutzPage() {
  return <DatenschutzContent backHref="/" locale="de" />;
}
