/**
 * Slotfill Human Healthcare Visual Guards.
 *
 * Sichern den menschlichen, weniger boxigen Healthcare-Auftritt der Startseite:
 * echte Bildflächen (HealthcareImage) statt reiner Card-Grids, korrekt
 * verdrahtete lokale Bild-Slots, Healthcare-Vertikalen und keine Fake-Bildmuster.
 *
 * Lauf: tsx --test scripts/slotfill-visuals.test.ts
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SLOTFILL_IMAGES } from "../lib/slotfill-images";
import { locales } from "../i18n/routing";

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const msg = (loc: string) => JSON.parse(read(`messages/${loc}.json`)) as Record<string, Record<string, string>>;
const PAGE = "app/[locale]/page.tsx";
const LOGO = "components/ui/SlotFillLogo.tsx";
const IMG_COMPONENT = "components/ui/HealthcareImage.tsx";
const IMG_MANIFEST = "lib/slotfill-images.ts";

// ─── 1. Human Healthcare Visual Guard ─────────────────────────────────────────

test("Human Healthcare Visual Guard: Hero/Patient/Provider/Trust nutzen echte Bildflächen", () => {
  const home = read(PAGE);
  assert.ok(home.includes("HealthcareImage"), "Startseite nutzt keine HealthcareImage-Bildfläche");
  // Die zentralen menschlichen Healthcare-Slots sind im Hero/Flow verdrahtet.
  for (const key of [
    "heroDoctorConsultation",
    "patientMobileBooking",
    "clinicReception",
    "clinicTeam",
    "healthcareTrust",
  ]) {
    assert.ok(home.includes(`imageKey="${key}"`), `Bild-Slot fehlt im Hero/Flow: ${key}`);
  }
});

// ─── 2. Image Manifest Integrity Guard ────────────────────────────────────────

test("Image Manifest Guard: lokale .png-Slots, kein Hotlink, definierter enabled-Schalter", () => {
  for (const [k, m] of Object.entries(SLOTFILL_IMAGES)) {
    assert.match(m.file, /^[a-z0-9-]+\.png$/, `${k}: ungültiger Slot-Dateiname ${m.file}`);
    assert.equal(typeof m.enabled, "boolean", `${k}: enabled-Schalter fehlt`);
  }
  // Bild-Slots werden lokal unter /public/images/slotfill aufgelöst (kein externer Hotlink).
  assert.equal(/https?:\/\//.test(read(IMG_MANIFEST)), false, "Bild-Manifest enthält externen Hotlink");
  // Die Komponente fällt ohne aktiviertes Foto auf eine markenkonforme Platzhalterfläche zurück (kein 404-Bild).
  assert.ok(read(IMG_COMPONENT).includes("showPhoto"), "HealthcareImage hat keinen Platzhalter-Fallback");
});

// ─── 3. Less Boxy Landingpage Guard ───────────────────────────────────────────

test("Less Boxy Landingpage Guard: mehrere große Bildflächen + Bild/Text-Wechsel", () => {
  const home = read(PAGE);
  const imageBands = (home.match(/<HealthcareImage/g) ?? []).length;
  assert.ok(imageBands >= 5, `zu wenige Bildflächen (${imageBands}) – Seite wirkt weiterhin boxig`);
  // Editorial: Bild/Text-Sektionen im 2-Spalten-Grid (kein reines Card-Grid).
  assert.ok(home.includes("lg:grid-cols-2"), "kein Bild/Text-Editorial-Layout (2 Spalten)");
});

// ─── 4. Healthcare Vertical Tiles Guard ───────────────────────────────────────

test("Healthcare Vertical Guard: Use-Case-Editorial zeigt nur Gesundheits-Vertikalen", () => {
  const home = read(PAGE);
  assert.ok(home.includes("verticalTiles") && home.includes("verticalPills"), "Use-Case-Editorial (Kacheln + Pills) fehlt");
  for (const k of ["useCase1", "useCase2", "useCase3", "useCase4", "useCase5", "useCase6"]) {
    assert.ok(home.includes(`t("${k}")`), `Healthcare-Vertikale ${k} fehlt`);
  }
  // Keine fremden Branchen in der Bildschicht.
  for (const bad of ["hairdresser", "barber", "yoga", "restaurant", "hotel", "fitness"]) {
    assert.equal(home.toLowerCase().includes(bad), false, `fremde Branche in der Startseite: ${bad}`);
  }
});

// ─── 5. No Fake Imagery / Dead CTA Guard ──────────────────────────────────────

test("No Fake Imagery Guard: keine Fake-Logos/Testimonials/externen Bild-URLs, keine toten CTAs", () => {
  const home = read(PAGE);
  for (const bad of ["testimonial", "logo-cloud", "trusted-by", "as-seen-on"]) {
    assert.equal(home.toLowerCase().includes(bad), false, `Fake-Bildmuster gefunden: ${bad}`);
  }
  // Bilder stammen aus dem lokalen Slot-Manifest, nicht aus externen URLs.
  assert.equal(/src=["']https?:/.test(home), false, "externe Bild-URL in der Startseite");
  // Keine toten Anker.
  assert.equal(/href=["']#["']/.test(home), false, 'toter Anker href="#" auf der Startseite');
});

// ─── 6. Header Wordmark Guard ─────────────────────────────────────────────────

test("Header Wordmark Guard: saubere Wordmark, kein billiger Gradient-Text-Clip ('SlotV')", () => {
  const logo = read(LOGO);
  // Der transparente Gradient-Text-Clip (Ursache der 'SlotV'-Wirkung) ist entfernt.
  assert.equal(logo.includes("WebkitTextFillColor"), false, "Wordmark nutzt weiterhin transparenten Gradient-Text-Clip");
  // Wordmark bleibt an die zentrale Markenquelle gebunden.
  assert.ok(logo.includes("PUBLIC_BRAND_NAME"), "Wordmark nutzt PUBLIC_BRAND_NAME nicht");
  // Mobile-Header zeigt das Logo platzsparend (Icon-only-Option vorhanden).
  assert.ok(logo.includes("hideWordmarkOnMobile"), "Logo bietet keine Icon-only-Option für Mobile");
  assert.ok(read(PAGE).includes("hideWordmarkOnMobile"), "Header nutzt die Icon-only-Option auf Mobile nicht");
});

// ─── 7. FAQ Guard ─────────────────────────────────────────────────────────────

test("FAQ Guard: FAQ-Sektion + Nav-Link vorhanden, vertrauensbildend, ohne verbotene Claims", () => {
  const home = read(PAGE);
  assert.ok(home.includes('id="faq"'), "FAQ-Sektion (#faq) fehlt");
  assert.ok(home.includes('t("faqTitle")'), "FAQ rendert faqTitle nicht");
  assert.ok(home.includes('tNav("faq")'), "Header-FAQ-Link fehlt");
  for (const loc of locales) {
    const l = msg(loc).landing;
    assert.ok((msg(loc).nav?.faq ?? "").trim().length > 1, `${loc}: nav.faq fehlt`);
    for (const k of ["faq1Q", "faq1A", "faq5Q", "faq5A"]) {
      assert.ok((l[k] ?? "").trim().length > 2, `${loc}: ${k} fehlt`);
    }
  }
  // Geldlogik in FAQ: Patienten zahlen nicht.
  assert.ok((msg("de").landing.faq1A || "").includes("Patienten zahlen nicht"), "DE FAQ ohne Geldlogik");
  assert.ok((msg("en").landing.faq1A || "").toLowerCase().includes("patients do not pay"), "EN FAQ ohne Geldlogik");
  // Keine verbotenen Claims in der EN-FAQ.
  const enBlob = JSON.stringify(msg("en").landing).toLowerCase();
  for (const bad of ["emergency", "medical advice", "guaranteed appointment"]) {
    assert.equal(enBlob.includes(bad), false, `EN FAQ/Copy enthält verbotenen Begriff: "${bad}"`);
  }
});
