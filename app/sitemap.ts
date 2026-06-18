import type { MetadataRoute } from "next";
import { locales } from "@/i18n/routing";
import { CANONICAL_URL } from "@/lib/brand";

const baseUrl = CANONICAL_URL;

// Nur die neuen, sicheren Pivot-Routen (International Clinic Visibility Engine).
// Alte Wartelisten-/Booking-/Launch-/Pricing-/Blog-Routen sind eingefroren
// (per Middleware 308-redirect) und gehören NICHT in die Sitemap.
const PUBLIC_PATHS = ["/", "/for-clinics", "/treatments", "/destinations", "/safety-notes", "/clinic-contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const path of PUBLIC_PATHS) {
      const url = path === "/" ? `${baseUrl}/${locale}` : `${baseUrl}/${locale}${path}`;
      entries.push({ url, lastModified: new Date() });
    }
  }
  return entries;
}
