/**
 * Manuelles Blog-Seeding. NICHT automatisch beim Build/Deploy ausführen.
 * Aufruf:  npm run seed-blog
 *
 * Mehrfach ausführbar: vorhandene Slugs werden übersprungen
 * (upsert mit ignoreDuplicates = ON CONFLICT (slug) DO NOTHING).
 *
 * Inhalte:
 * - Keine Heilversprechen.
 * - Keine Rechtsberatung.
 * - Kein „DSGVO-konform" – stattdessen „datenschutzbewusst".
 * - Keine Fake-Testimonials.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { STATIC_BLOG_POSTS } from "../lib/blog-data";

// .env.local laden (falls vorhanden), ohne zusätzliche Abhängigkeit.
function loadEnvLocal() {
  try {
    const file = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of file.split("\n")) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // Keine .env.local – Umgebungsvariablen müssen anderweitig gesetzt sein.
  }
}

// Legacy-Artikel (rückwärtskompatibel, werden übersprungen wenn schon vorhanden)
const LEGACY_POSTS = [
  {
    slug: "willkommen-bei-slotfill",
    title: "Willkommen bei Clentra",
    excerpt: "Wie Clentra Ihrer Praxis hilft, kurzfristige Terminlücken zu füllen.",
    content:
      "Clentra verbindet Ihre Warteliste mit Ihren Terminen. Fällt ein Termin aus, werden passende Patienten über einen sicheren Link informiert – so füllt sich die Lücke oft noch am selben Tag.",
    published_at: "2026-04-15T08:00:00.000Z",
  },
  {
    slug: "weniger-leerlauf-in-der-praxis",
    title: "Weniger Leerlauf in der Praxis",
    excerpt: "Drei einfache Schritte, um kurzfristige Absagen besser aufzufangen.",
    content:
      "1. Pflegen Sie Ihre Warteliste. 2. Markieren Sie ausgefallene Termine. 3. Lassen Sie Clentra die passenden Patienten vorbereiten.",
    published_at: "2026-04-22T08:00:00.000Z",
  },
];

// Alle Artikel: Legacy + neue statische Artikel aus lib/blog-data.ts
const ALL_POSTS = [
  ...LEGACY_POSTS,
  ...STATIC_BLOG_POSTS,
];

async function main() {
  loadEnvLocal();
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY müssen gesetzt sein.");
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const { error } = await supabase
    .from("blog_posts")
    .upsert(ALL_POSTS, { onConflict: "slug", ignoreDuplicates: true });

  if (error) {
    console.error("Seeding fehlgeschlagen:", error.message);
    process.exit(1);
  }
  console.log(`Seeding fertig (${ALL_POSTS.length} Beiträge geprüft).`);
  console.log("Artikel:");
  ALL_POSTS.forEach((p) => console.log(`  - ${p.slug}`));
}

main();
