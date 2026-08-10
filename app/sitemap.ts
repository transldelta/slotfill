import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase";
import { locales } from "@/i18n/routing";
import { CANONICAL_URL } from "@/lib/brand";
import { STATIC_BLOG_POSTS } from "@/lib/blog-data";
import { getLocalizedPost } from "@/lib/blog-translations";

const baseUrl = CANONICAL_URL;

// Öffentliche Seiten, die für jede Locale generiert werden.
// Alte Kampagnen-Routen (/launch, /public-launch, /share) sind nicht mehr Teil
// der ClinicSlotHub-Positionierung und werden nicht indexiert.
const PUBLIC_PATHS = ["/", "/pricing", "/blog", "/kontakt", "/termin-buchen"];

// Statische Slug-Liste als Fallback (immer aktuell, da aus blog-data importiert)
const STATIC_SLUGS = STATIC_BLOG_POSTS.map((p) => p.slug);

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

  // Blog-Beiträge: DB-Slugs + statische Fallback-Slugs (dedupliziert)
  let blogSlugs: string[] = [...STATIC_SLUGS];
  const dbSlugs = new Set<string>();
  try {
    const admin = createClient();
    const { data } = await admin
      .from("blog_posts")
      .select("slug, updated_at")
      .not("published_at", "is", null);
    for (const post of data ?? []) {
      dbSlugs.add(post.slug);
      if (!blogSlugs.includes(post.slug)) {
        blogSlugs.push(post.slug);
      }
    }
  } catch {
    // DB nicht erreichbar – statische Slugs reichen aus
  }

  for (const locale of locales) {
    for (const slug of blogSlugs) {
      // Nur URLs aufnehmen, die tatsächlich 200 liefern: DB-Artikel werden in
      // jeder Locale ausgeliefert, statische Artikel nur in Locales mit
      // vorhandener Übersetzung – sonst rendert die Route ein 404.
      if (!dbSlugs.has(slug) && getLocalizedPost(slug, locale) === null) {
        continue;
      }
      entries.push({
        url: `${baseUrl}/${locale}/blog/${slug}`,
        lastModified: new Date(),
      });
    }
  }

  return entries;
}
