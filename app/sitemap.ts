import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/pricing", "/blog", "/kontakt", "/impressum", "/datenschutz", "/agb"];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }));

  // Veröffentlichte Blog-Beiträge ergänzen – robust, falls Tabelle fehlt.
  try {
    const admin = createClient();
    const { data } = await admin
      .from("blog_posts")
      .select("slug, updated_at")
      .not("published_at", "is", null);
    for (const post of data ?? []) {
      entries.push({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
      });
    }
  } catch {
    // Ignorieren – Blog-Tabelle evtl. nicht vorhanden.
  }

  return entries;
}
