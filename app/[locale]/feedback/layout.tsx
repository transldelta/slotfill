import type { Metadata } from "next";
import { locales } from "@/i18n/routing";
import { CANONICAL_URL } from "@/lib/brand";

// Canonical + hreflang für die Feedback-Seite. Die Seite selbst ist eine
// Client-Komponente und kann keine Metadaten exportieren – daher hier im Layout.
// Ohne canonical meldete die Search Console die Sprachvarianten als
// „Duplikat – vom Nutzer nicht als kanonisch festgelegt".
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    metadataBase: new URL(CANONICAL_URL),
    alternates: {
      canonical: `/${locale}/feedback`,
      languages: {
        ...(Object.fromEntries(
          locales.map((l) => [l, `/${l}/feedback`]),
        ) as Record<string, string>),
        "x-default": "/en/feedback",
      },
    },
  };
}

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
