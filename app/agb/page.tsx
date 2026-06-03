import type { Metadata } from "next";
import { AgbContent } from "@/components/legal/AgbContent";

export const metadata: Metadata = {
  title: "AGB – Clentra",
  robots: { index: false, follow: false },
};

/** Root-Route /agb – leitet Inhalt über shared Component. */
export default function AgbPage() {
  return <AgbContent backHref="/" locale="de" />;
}
