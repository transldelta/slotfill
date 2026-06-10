import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase";
import { locales } from "@/i18n/routing";
import { CANONICAL_URL } from "@/lib/brand";

const baseUrl = CANONICAL_URL;

// Öffentliche Seiten, die für jede Locale generiert werden
const PUBLIC_PATHS = ["/", "/pricing", "/blog", "/kontakt"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Lokalisierte öffentliche Seiten (alle 10 Locales × öffentliche Pfade)
  for (const locale of locales) {
    for (const path of PUBLIC_PATHS) {
      const url =
        path === "/"
          ? `${baseUrl}/${locale}`
          : `${baseUrl}/${locale}${path}`;
      entries.push({ url, lastModified: new Date() });
    }
  }

  // Blog-Beiträge für alle Locales
  let blogSlugs: string[] = [];
  try {
    const admin = createClient();
    const { data } = await admin
      .from("blog_posts")
      .select("slug, updated_at")
      .not("published_at", "is", null);
    for (const post of data ?? []) {
      blogSlugs.push(post.slug);
    }
  } catch {
    // Ignorieren – Blog-Tabelle evtl. nicht vorhanden.
    // Statische Slugs aus blog-data nicht importieren, da dynamisch
  }

  for (const locale of locales) {
    for (const slug of blogSlugs) {
      entries.push({
        url: `${baseUrl}/${locale}/blog/${slug}`,
        lastModified: new Date(),
      });
    }
  }

  return entries;
}
