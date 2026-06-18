import type { MetadataRoute } from "next";
import { CANONICAL_URL } from "@/lib/brand";
import { PRODUCT_LOCALES } from "@/lib/pivot-content";

const baseUrl = CANONICAL_URL;

// Nur aktive öffentliche Produktsprachen (EN/FR/ES) und sichere Scheduling-OS-Seiten.
// Keine deutschen Produktseiten, keine alten Visibility-/Booking-/Waitlist-Routen,
// keine Hochrisiko-Länder-Landingpages.
const PUBLIC_PATHS = ["/", "/demo", "/for-clinics", "/safety-notes", "/clinic-contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of PRODUCT_LOCALES) {
    for (const path of PUBLIC_PATHS) {
      const url = path === "/" ? `${baseUrl}/${locale}` : `${baseUrl}/${locale}${path}`;
      entries.push({ url, lastModified: new Date() });
    }
  }
  return entries;
}
