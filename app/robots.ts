import type { MetadataRoute } from "next";
import { locales } from "@/i18n/routing";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  // Private Pfade blockieren – sowohl ohne als auch mit Locale-Präfix
  const privatePaths = ["/dashboard/", "/admin/", "/api/", "/auth/"];
  const disallowList = [
    ...privatePaths,
    // Mit Locale-Präfix für alle 10 Sprachen
    ...locales.flatMap((locale) =>
      privatePaths.map((p) => `/${locale}${p}`),
    ),
  ];

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: disallowList,
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
