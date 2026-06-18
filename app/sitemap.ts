import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase";
import { locales } from "@/i18n/routing";
import { CANONICAL_URL } from "@/lib/brand";
import { STATIC_BLOG_POSTS } from "@/lib/blog-data";

const baseUrl = CANONICAL_URL;

// Öffentliche Seiten, die für jede Locale generiert werden
const PUBLIC_PATHS = ["/", "/for-clinics", "/treatments", "/destinations", "/safety-notes", "/clinic-contact", "/blog", "/kontakt", "/launch"];

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
  try {
    const admin = createClient();
    const { data } = await admin
      .from("blog_posts")
      .select("slug, updated_at")
      .not("published_at", "is", null);
    for (const post of data ?? []) {
      if (!blogSlugs.includes(post.slug)) {
        blogSlugs.push(post.slug);
      }
    }
  } catch {
    // DB nicht erreichbar – statische Slugs reichen aus
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
