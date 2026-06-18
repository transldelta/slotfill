/**
 * Public Positioning & Safety Guards — ClinicSlotHub: Modern Clinic Scheduling OS.
 *
 * Public product languages: EN (main), FR, ES. No German public product copy.
 * No external services, no patient data, no medical promises, no PII in mockups.
 *
 * Lauf: tsx --test scripts/public-positioning.test.ts
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getPivot, flattenPivot, PRODUCT_LOCALES, MOCK_ROWS } from "../lib/pivot-content";
import { runSafetyTower, scanPublicCopy, POSITIONING } from "../lib/safety-tower";

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
// Kommentare entfernen — Safety-Kommentare ("no payments", "no patient names")
// sind Dokumentation, kein Verstoß.
const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

const PIVOT_PAGES = [
  "app/[locale]/page.tsx",
  "app/[locale]/demo/page.tsx",
  "app/[locale]/for-clinics/page.tsx",
  "app/[locale]/safety-notes/page.tsx",
  "app/[locale]/clinic-contact/page.tsx",
  "components/pivot/PivotShell.tsx",
  "components/pivot/DashboardMockup.tsx",
];
const allPivotSrc = PIVOT_PAGES.map(read).join("\n");

// Marketing-Text (ohne Safety-Disclaimer-Body, der bewusst "no diagnosis" etc. enthält).
function marketing(locale: string): string {
  const d = getPivot(locale);
  const { safety, ...rest } = d;
  return JSON.stringify({ ...rest, safety: { title: safety.title } }).toLowerCase();
}

// ─── 9. Scheduling-OS-Positionierung ──────────────────────────────────────────

test("Positioning: Modern Clinic Scheduling OS in allen Produktsprachen", () => {
  for (const loc of PRODUCT_LOCALES) {
    const d = getPivot(loc);
    assert.equal(d.tagline, "Modern Clinic Scheduling OS");
    assert.ok(d.hero.h1.includes("Modern Clinic Scheduling OS"), `${loc}: H1 fehlt`);
  }
  const en = flattenPivot(getPivot("en")).toLowerCase();
  for (const must of ["simple scheduling", "walk-in queue", "available slots", "today board", "room", "waiting", "completed", "available"]) {
    assert.ok(en.includes(must), `EN Scheduling-Begriff fehlt: ${must}`);
  }
});

// ─── 1. Public Locale Guard (EN/FR/ES) ────────────────────────────────────────

test("Public Locale Guard: nur en/fr/es sind Produktsprachen + Sitemap", () => {
  assert.deepEqual([...PRODUCT_LOCALES], ["en", "fr", "es"]);
  const sm = read("app/sitemap.ts");
  assert.ok(sm.includes("PRODUCT_LOCALES"), "Sitemap nutzt PRODUCT_LOCALES nicht");
  for (const bad of ['"de"', '"ar"', '"hi"', '"bn"', '"ru"', '"zh"', '"pt"', "locales"]) {
    assert.equal(sm.includes(bad), false, `Sitemap referenziert nicht-Produktsprache/all-locales: ${bad}`);
  }
});

test("Middleware: Public Language Gate leitet nicht-EN/FR/ES Locales auf /en", () => {
  const mw = read("middleware.ts");
  assert.ok(mw.includes('new Set(["en", "fr", "es"])') || /PRODUCT_LOCALES\s*=\s*new Set\(\["en", "fr", "es"\]\)/.test(mw), "Language Gate fehlt");
  assert.ok(/url\.pathname\s*=\s*"\/en"/.test(mw), "Gate leitet nicht auf /en");
  assert.ok(mw.includes("status: 308"), "kein 308");
});

// ─── 2. No German Public Product Copy ─────────────────────────────────────────

test("No German Product Copy: EN/FR/ES enthalten keine deutschen Produktwörter", () => {
  const german = ["terminverwaltung", "warteschlange", "praxis", "klinikplanung", "anfrage senden", "demo ansehen", "kostenlos testen", "deutschland", "preise vergleichen"];
  for (const loc of PRODUCT_LOCALES) {
    const t = marketing(loc);
    for (const g of german) assert.equal(t.includes(g), false, `${loc}: deutsches Produktwort "${g}"`);
  }
});

// ─── 3. Translation Quality ───────────────────────────────────────────────────

test("Translation Quality: keine Platzhalter, FR/ES sprachlich eigenständig", () => {
  for (const loc of PRODUCT_LOCALES) {
    const t = marketing(loc);
    for (const ph of ["lorem", "ipsum", "coming soon", "xxxx", "placeholder"]) {
      assert.equal(t.includes(ph), false, `${loc}: Platzhalter "${ph}"`);
    }
    // Code-Marker "TODO" (Großschreibung) — "todo"/"todos" (Spanisch) ist erlaubt.
    assert.equal(/\bTODO\b/.test(flattenPivot(getPivot(loc))), false, `${loc}: TODO-Marker`);
  }
  // FR/ES müssen eigene Sprache tragen (nicht nur EN-Fallback).
  assert.ok(getPivot("fr").hero.subline.toLowerCase().includes("rendez-vous"), "FR nicht französisch");
  assert.ok(getPivot("es").hero.subline.toLowerCase().includes("citas"), "ES nicht spanisch");
  // EN-Fallback-Leak: FR/ES Subline darf nicht identisch mit EN sein.
  assert.notEqual(getPivot("fr").hero.subline, getPivot("en").hero.subline);
  assert.notEqual(getPivot("es").hero.subline, getPivot("en").hero.subline);
});

// ─── 4. Anonymous Mockup Guard ────────────────────────────────────────────────

test("Anonymous Mockup: keine Patientennamen / PII", () => {
  const src = stripComments(read("components/pivot/DashboardMockup.tsx")) + JSON.stringify(MOCK_ROWS);
  const pii = ["Sarah", "Ahmed", "Maria", "John", "Fatima", "Mohammed", "Ana", "Carlos", "Patient Name", "diagnosis", "symptom", "medical record", "DOB", "insurance"];
  // E-Mail-/Telefon-Muster nur in den Beispieldaten (nicht im Import-Alias) verbieten.
  assert.equal(/@|phone|\+\d{6,}/i.test(JSON.stringify(MOCK_ROWS)), false, "Mockup-Daten enthalten Kontakt-PII");
  for (const p of pii) assert.equal(src.toLowerCase().includes(p.toLowerCase()), false, `Mockup enthält PII/Name: ${p}`);
  // Erlaubte anonyme Tokens vorhanden.
  assert.ok(/Appointment #|Walk-in #|Room \d/.test(JSON.stringify(MOCK_ROWS)), "anonyme Tokens fehlen");
});

// ─── 5. Forbidden Region Wording ──────────────────────────────────────────────

test("Forbidden Region Wording: keine Schwellenland-/Region-only-Sprache öffentlich", () => {
  const bad = ["emerging countries", "emerging healthcare markets", "schwellenländer", "africa-only", "asia-only", "south america-only", "latin america-only", "third world", "poor clinics", "low-income", "developing world", "developing countries", "unterentwickelte"];
  const blob = (PRODUCT_LOCALES.map((l) => flattenPivot(getPivot(l))).join(" ") + allPivotSrc).toLowerCase();
  for (const b of bad) assert.equal(blob.includes(b), false, `verbotene Region-Sprache: ${b}`);
});

// ─── 6. High-Regulation Targeting ─────────────────────────────────────────────

test("High-Regulation Targeting: keine aktive Bewerbung von DE/EU/USA/UK/CA/AU", () => {
  const targets = ["germany", "deutschland", "european union", " eu ", "united states", " usa ", "united kingdom", " uk ", "canada", "kanada", "australia", "australien"];
  const blob = (PRODUCT_LOCALES.map((l) => flattenPivot(getPivot(l))).join(" ") + allPivotSrc).toLowerCase();
  for (const t of targets) assert.equal(blob.includes(t), false, `Hochregulierungs-Targeting: ${t.trim()}`);
});

// ─── 7. Medical Promise Guard ─────────────────────────────────────────────────

test("Medical Promise Guard: keine medizinischen Versprechen in Marketing-Copy", () => {
  const bad = ["best clinic", "guaranteed patients", "guaranteed bookings", "guaranteed revenue", "guaranteed result", "risk-free", "medical recommendation", "treatment recommendation", "emergency support", "success guarantee", "ai doctor", "cure"];
  for (const loc of PRODUCT_LOCALES) {
    const t = marketing(loc); // ohne Safety-Disclaimer-Body
    for (const b of bad) assert.equal(t.includes(b), false, `${loc}: medizinisches Versprechen "${b}"`);
  }
});

test("Safety Tower: Marketing-Copy aller Produktsprachen ohne verbotene Claims", () => {
  const sources = PRODUCT_LOCALES.map((l) => {
    const d = getPivot(l);
    const { safety, ...rest } = d;
    return JSON.stringify({ ...rest, safety: { title: safety.title } });
  });
  const res = runSafetyTower(sources);
  assert.equal(res.status, "green", "verbotene Claims: " + JSON.stringify(res.violations));
});

test("Safety Tower: Scanner erkennt verbotene Claims; Positionierung bleibt raus aus Medizin/Buchung/Zahlung", () => {
  for (const bad of ["best clinic", "guaranteed result", "book surgery now", "risk-free", "commission per surgery"]) {
    assert.equal(scanPublicCopy(`xx ${bad} yy`).status, "red", `nicht erkannt: ${bad}`);
  }
  assert.equal(POSITIONING.isMedicalProvider, false);
  assert.equal(POSITIONING.isBookingPlatform, false);
  assert.equal(POSITIONING.storesPatientData, false);
  assert.equal(POSITIONING.takesPayment, false);
});

// ─── 8. External Activation Guard ─────────────────────────────────────────────

test("External Activation Guard: keine externen Dienste in den öffentlichen Seiten", () => {
  for (const f of [...PIVOT_PAGES, "app/sitemap.ts"]) {
    const src = stripComments(read(f));
    for (const bad of [/from\s+["']@supabase\/supabase-js["']/, /\bstripe\b/i, /createCheckout/i, /nodemailer/i, /from\s+["']resend["']/, /twilio/i, /<input\s+type=["']file/i, /multipart\/form-data/i, /\bfetch\s*\(/]) {
      assert.equal(bad.test(src), false, `${f}: externe/aktive Logik (${bad})`);
    }
  }
});

// ─── 10. Sitemap Guard ────────────────────────────────────────────────────────

test("Sitemap Guard: nur sichere Scheduling-OS-Seiten, keine alten Routen", () => {
  const sm = read("app/sitemap.ts");
  for (const good of ["/", "/demo", "/for-clinics", "/safety-notes", "/clinic-contact"]) {
    assert.ok(sm.includes(`"${good}"`), `Sitemap fehlt ${good}`);
  }
  for (const bad of ["/pricing", "/launch", "/public-launch", "/share", "/termin-buchen", "/blog", "/kontakt", "/treatments", "/destinations"]) {
    assert.equal(sm.includes(`"${bad}"`), false, `Sitemap enthält alte Route ${bad}`);
  }
});

// ─── 11. CTA Safety Guard ─────────────────────────────────────────────────────

test("CTA Safety: nur mailto / interne Demo-Links, keine Zahlung/Speicherung", () => {
  const home = read("app/[locale]/page.tsx");
  assert.ok(home.includes("mailto:") && home.includes("/demo"), "sichere CTAs fehlen");
  for (const f of PIVOT_PAGES) {
    const src = stripComments(read(f));
    assert.equal(/checkout|stripe|payment|<form/i.test(src), false, `${f}: unsichere CTA/Form`);
  }
});

test("Pivot-Contact: kein Patienten-Formular / kein Upload", () => {
  const src = read("app/[locale]/clinic-contact/page.tsx");
  assert.equal(/<form|<input|<textarea|upload/i.test(src), false, "Contact enthält Formular/Upload");
  assert.ok(src.includes("mailto:"), "kein einfacher Kontaktweg");
});

// ─── 12. Mobile/UX Guard ──────────────────────────────────────────────────────

test("Mobile/UX: Homepage nicht leer, Mockup + klare CTAs + Demo-Route", () => {
  const home = read("app/[locale]/page.tsx");
  assert.ok(home.includes("DashboardMockup"), "Mockup fehlt auf Homepage");
  assert.ok(home.includes("d.hero.h1") && home.includes("d.cta.requestAccess") && home.includes("d.cta.viewDemo"), "Hero/CTAs fehlen");
  assert.ok(existsSync(join(ROOT, "app/[locale]/demo/page.tsx")), "Demo-Route fehlt");
  // Treatments/Destinations (Medical-Tourism-Reste) sind entfernt.
  assert.equal(existsSync(join(ROOT, "app/[locale]/treatments/page.tsx")), false, "treatments-Seite noch vorhanden");
  assert.equal(existsSync(join(ROOT, "app/[locale]/destinations/page.tsx")), false, "destinations-Seite noch vorhanden");
});

// ─── 13. Technology Discipline Guard ──────────────────────────────────────────

test("Tech Discipline: keine neuen riskanten Dependencies / experimentelle Pakete", () => {
  const pkg = JSON.parse(read("package.json")) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
  const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
  for (const risky of ["@stripe/stripe-js", "openai", "@vercel/analytics", "mixpanel", "segment", "@sentry/nextjs"]) {
    assert.equal(risky in deps, false, `riskante neue Dependency: ${risky}`);
  }
  // Stack bleibt Next/React/Tailwind.
  assert.ok("next" in deps && "react" in deps && "tailwindcss" in deps, "Kern-Stack fehlt");
});

// ─── Safety Notes Pflicht-Disclaimer ──────────────────────────────────────────

test("Safety-Body enthält die Pflicht-Disclaimer (keine medizinische Beratung/Diagnose/Notfall/Zahlung)", () => {
  for (const loc of PRODUCT_LOCALES) {
    const b = getPivot(loc).safety.body.toLowerCase();
    const ok =
      (b.includes("not a medical") || b.includes("pas un outil de conseil") || b.includes("no es una herramienta")) &&
      (b.includes("diagn")) &&
      (b.includes("payment") || b.includes("paiement") || b.includes("pago"));
    assert.ok(ok, `${loc}: Safety-Disclaimer unvollständig`);
  }
});

// ─── Freeze alter Routen (Phase 2 bleibt aktiv) ───────────────────────────────

test("Middleware friert alte Routen ein (inkl. treatments/destinations → Home)", () => {
  const mw = read("middleware.ts");
  assert.ok(mw.includes("status: 308"), "kein 308-Freeze");
  assert.ok(mw.includes('pricing: "/for-clinics"'), "pricing-Freeze fehlt");
  for (const k of ["launch", "public-launch", "share", "blog", "treatments", "destinations"]) {
    assert.ok(new RegExp(`"?${k}"?:\\s*""`).test(mw), `Freeze (→ Home) fehlt: ${k}`);
  }
  assert.ok(mw.includes('kontakt: "/clinic-contact"') && mw.includes('"termin-buchen": "/clinic-contact"'), "Kontakt-Freeze fehlt");
});
