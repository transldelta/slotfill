/**
 * ClinicSlotHub SEO & Indexability Foundation Guards.
 *
 * Sichern die technische Auffindbarkeits-Basis: robots/sitemap, lokalisierte
 * Title/Description/Canonical/hreflang auf den Kernseiten, Markenkonsistenz in
 * Metadaten, indexierbare Kernseiten + noindex auf Legal.
 *
 * Lauf: tsx --test scripts/seo-foundation.test.ts
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { locales } from "../i18n/routing";

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const has = (p: string) => existsSync(join(ROOT, p));

const HOME = "app/[locale]/page.tsx";
const PRICING_LAYOUT = "app/[locale]/pricing/layout.tsx";
const KONTAKT = "app/[locale]/kontakt/page.tsx";
const ROOT_LAYOUT = "app/[locale]/layout.tsx";

// ─── 1. SEO Foundation Guard ──────────────────────────────────────────────────

test("SEO Foundation Guard: robots + sitemap + lokalisierte Metadaten vorhanden", () => {
  assert.ok(has("app/robots.ts"), "app/robots.ts fehlt");
  assert.ok(has("app/sitemap.ts"), "app/sitemap.ts fehlt");
  // Kernseiten liefern eigene Metadaten (Title/Description).
  for (const f of [HOME, PRICING_LAYOUT, KONTAKT]) {
    const src = read(f);
    assert.ok(/generateMetadata/.test(src), `${f}: kein generateMetadata`);
    assert.ok(src.includes("title") && src.includes("description"), `${f}: Title/Description fehlt`);
    assert.ok(src.includes("canonical"), `${f}: canonical fehlt`);
    assert.ok(/languages/.test(src), `${f}: hreflang (languages) fehlt`);
  }
  // Root-Locale-Layout hat einen Title-Fallback.
  assert.ok(read(ROOT_LAYOUT).includes("title:"), "Locale-Layout ohne Title-Fallback");
});

// ─── 2. Brand SEO Guard ───────────────────────────────────────────────────────

test("Brand SEO Guard: Metadaten nutzen ClinicSlotHub, kein Slotfill/ClinicsLotHub", () => {
  for (const f of [HOME, PRICING_LAYOUT, KONTAKT, ROOT_LAYOUT]) {
    const src = read(f);
    // Markenname kommt aus der Einzelquelle oder ist exakt ClinicSlotHub.
    assert.ok(src.includes("PUBLIC_BRAND_NAME") || src.includes("ClinicSlotHub"), `${f}: kein ClinicSlotHub in Metadaten`);
    // Keine alten/falschen Markenwörter im öffentlichen Metadaten-Code.
    assert.equal(/\bSlotfill\b/.test(src.replace(/SlotFillLogo/g, "")), false, `${f}: altes 'Slotfill' in Metadaten`);
    assert.equal(src.includes("ClinicsLotHub"), false, `${f}: falsche Schreibweise 'ClinicsLotHub'`);
  }
});

// ─── 3. Indexability Guard ────────────────────────────────────────────────────

test("Indexability Guard: Kernseiten crawlbar, private blockiert, Legal noindex", () => {
  const robots = read("app/robots.ts");
  assert.ok(/allow:\s*"\/"/.test(robots), "robots erlaubt '/' nicht");
  for (const p of ["/dashboard/", "/admin/", "/api/", "/auth/"]) {
    assert.ok(robots.includes(`"${p}"`), `robots blockiert ${p} nicht`);
  }
  assert.ok(robots.includes("sitemap"), "robots referenziert die Sitemap nicht");
  // Sitemap deckt aktive Locales + öffentliche Pfade ab.
  const sitemap = read("app/sitemap.ts");
  assert.ok(sitemap.includes("locales"), "Sitemap nutzt routing.locales nicht");
  for (const p of ["/pricing", "/blog", "/kontakt"]) {
    assert.ok(sitemap.includes(`"${p}"`), `Sitemap enthält ${p} nicht`);
  }
  // Legal-Seiten sind noindex (kein Boilerplate-Index), Kernseiten NICHT.
  for (const legal of ["agb", "datenschutz", "impressum", "avv"]) {
    assert.ok(/index:\s*false/.test(read(`app/[locale]/${legal}/page.tsx`)), `${legal}: nicht noindex`);
  }
  assert.equal(/index:\s*false/.test(read(HOME)), false, "Startseite fälschlich noindex");
  assert.equal(/index:\s*false/.test(read(PRICING_LAYOUT)), false, "Pricing fälschlich noindex");
});

// ─── 4. Pricing SEO Consistency Guard ─────────────────────────────────────────

test("Pricing SEO Consistency Guard: Title + ab/from-Preise + Geldlogik je Locale", () => {
  const msg = (loc: string) => JSON.parse(read(`messages/${loc}.json`)) as Record<string, Record<string, string>>;
  for (const loc of locales) {
    const l = msg(loc).landing;
    assert.ok((l.pricingTitle || "").trim().length > 3, `${loc}: pricingTitle fehlt (Pricing-SEO-Title)`);
    assert.ok((l.pricePerMonthFrom || "").includes("{price}"), `${loc}: 'ab/from'-Preis-Template fehlt`);
    assert.ok((l.pricingMoneyNote || "").length > 10, `${loc}: pricingMoneyNote (Geldlogik) fehlt`);
  }
  // Geldlogik klar: Patienten zahlen nicht + Aktivierung nach Prüfung.
  assert.ok(msg("de").landing.pricingMoneyNote.includes("Patienten zahlen nicht auf dieser Website"), "DE Geldlogik fehlt");
  assert.ok(/Prüfung/.test(msg("de").landing.pricingMoneyNote), "DE 'nach Prüfung' fehlt");
  assert.ok(msg("en").landing.pricingMoneyNote.toLowerCase().includes("patients do not pay"), "EN Geldlogik fehlt");
});
