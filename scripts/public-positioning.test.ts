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
  "components/pivot/InteractiveDemo.tsx",
  "components/pivot/PricingPlans.tsx",
  "components/pivot/RequestAccess.tsx",
];
const allPivotSrc = PIVOT_PAGES.map(read).join("\n");

// Marketing-Text (ohne Safety-Disclaimer-Body, der bewusst "no diagnosis" etc. enthält).
function marketing(locale: string): string {
  const d = getPivot(locale);
  const { safety, ...rest } = d;
  return JSON.stringify({ ...rest, safety: { title: safety.title } }).toLowerCase();
}

// ─── 9. Scheduling-OS-Positionierung ──────────────────────────────────────────

test("Positioning: Produktlabel bleibt 'Modern Clinic Scheduling OS', H1 ist einfache Botschaft", () => {
  for (const loc of PRODUCT_LOCALES) {
    const d = getPivot(loc);
    // Produktname bleibt als kleines Label erhalten ...
    assert.equal(d.tagline, "Modern Clinic Scheduling OS");
    // ... aber der H1 ist bewusst einfacher als der Produktname (Commercial Simplicity).
    assert.ok(d.hero.h1.length > 10, `${loc}: H1 fehlt`);
    assert.notEqual(d.hero.h1, d.tagline, `${loc}: H1 darf nicht der Produktname sein`);
    assert.equal(d.hero.h1.includes("Modern Clinic Scheduling OS"), false, `${loc}: H1 soll einfacher sein als das Produktlabel`);
  }
  // EN-H1 trägt die klare Tages-Board-Botschaft.
  assert.ok(getPivot("en").hero.h1.toLowerCase().includes("one board for today's clinic work"), "EN H1 ohne klare Board-Botschaft");
  const en = flattenPivot(getPivot("en")).toLowerCase();
  for (const must of ["walk-in queue", "available slots", "today board", "room", "waiting", "completed", "available"]) {
    assert.ok(en.includes(must), `EN Scheduling-Begriff fehlt: ${must}`);
  }
});

// ─── Phase 12.1 — Commercial Rejection Audit existiert ────────────────────────

test("Commercial Rejection Audit: Datei existiert mit Technical GO / Commercial NO-GO", () => {
  const p = "docs/commercial-rejection-audit-8b71ebc.md";
  assert.ok(existsSync(join(ROOT, p)), "Audit-Datei fehlt");
  const md = read(p).toLowerCase();
  assert.ok(md.includes("technical go") && md.includes("commercial no-go"), "GO/NO-GO-Urteil fehlt");
  assert.ok(md.includes("button"), "Button-Funktionsproblem nicht dokumentiert");
  assert.ok(md.includes("unclear") || md.includes("concept"), "Konzept-Unklarheit nicht dokumentiert");
});

// ─── Phase 12.2 — Hero Clarity Guard ──────────────────────────────────────────

test("Hero Clarity Guard: Startseite in 5s verständlich (Tagesboard)", () => {
  const en = flattenPivot(getPivot("en")).toLowerCase();
  for (const must of ["one board for today's clinic work", "appointments", "walk-ins", "rooms", "open slots", "front-desk board"]) {
    assert.ok(en.includes(must.toLowerCase()), `Hero-Klarheit fehlt: "${must}"`);
  }
  const home = read("app/[locale]/page.tsx");
  for (const ref of ["d.hero.h1", "d.hero.subline", "d.problem", "d.money.title"]) {
    assert.ok(home.includes(ref), `Homepage rendert ${ref} nicht`);
  }
});

// ─── Phase 12.3 — Button Function Guard ───────────────────────────────────────

test("Button Function Guard: keine toten CTAs, alle Buttons mit sichtbarer Aktion", () => {
  const files = [
    "app/[locale]/page.tsx",
    "app/[locale]/demo/page.tsx",
    "components/pivot/InteractiveDemo.tsx",
    "components/pivot/PricingPlans.tsx",
    "components/pivot/RequestAccess.tsx",
    "components/pivot/PivotShell.tsx",
  ];
  for (const f of files) {
    const src = read(f);
    assert.equal(/href=["']#["']/.test(src), false, `${f}: toter Anker href="#"`);
    assert.equal(/<button[^>]*>\s*<\/button>/.test(src), false, `${f}: leerer Button`);
    // Kein dauerhaft deaktivierter Button (disabled ohne Bedingung).
    assert.equal(/disabled(\s|>)/.test(src), false, `${f}: CTA dauerhaft disabled`);
  }
  // Interaktive Demo-Buttons haben Handler.
  const demo = read("components/pivot/InteractiveDemo.tsx");
  assert.ok((demo.match(/onClick=/g) || []).length >= 4, "Demo-Buttons ohne onClick-Aktion");
  // Pricing-Buttons haben ein Ziel/Aktion.
  const plans = read("components/pivot/PricingPlans.tsx");
  assert.ok(plans.includes("onClick="), "Pricing-Button ohne Aktion");
  assert.ok(plans.includes("d.access.pilotRequest"), "Pricing zeigt keine sichtbare 'Pilot request'-Bestätigung");
  // Request access: sichtbarer Mail-Fallback + Copy-Funktion.
  const ra = read("components/pivot/RequestAccess.tsx");
  assert.ok(ra.includes("mailto:"), "Request access ohne mailto");
  assert.ok(ra.includes("d.access.emailIntro") && ra.includes("{email}"), "Request access ohne sichtbaren Mail-Fallback");
  assert.ok(ra.includes("navigator.clipboard") && ra.includes("d.access.copyEmail"), "Copy-email-Funktion fehlt");
  // Hero-CTAs sind aktiv: View-Demo-Anker + mailto im Quelltext.
  const home = read("app/[locale]/page.tsx");
  assert.ok(home.includes('href="#demo"') && home.includes("mailto:"), "Hero-CTAs ohne Ziel");
});

// ─── Phase 12.4 — Interactive Demo Guard ──────────────────────────────────────

test("Interactive Demo Guard: client-seitig, interaktiv, ohne Speicherung", () => {
  // Kommentar-Doku ("no localStorage") ist kein Verstoß — vor dem Scan entfernen.
  const demo = stripComments(read("components/pivot/InteractiveDemo.tsx"));
  assert.ok(demo.includes('"use client"'), "Demo ist keine Client-Komponente");
  assert.ok(demo.includes("useState"), "Demo ohne React-State");
  for (const bad of [/localStorage/, /sessionStorage/, /indexedDB/, /\bfetch\s*\(/, /\/api\//, /supabase/i]) {
    assert.equal(bad.test(demo), false, `Demo nutzt unerlaubte Persistenz/Dienst: ${bad}`);
  }
  // Erwartete Tabs + Aktionen (Dict) — exakt die geforderten Begriffe.
  const en = getPivot("en");
  assert.deepEqual(
    [en.demo.tabs.todayBoard, en.demo.tabs.walkInQueue, en.demo.tabs.openSlots, en.demo.tabs.rooms],
    ["Today Board", "Walk-in Queue", "Open Slots", "Rooms"],
  );
  assert.equal(en.demo.actions.addWalkIn, "Add sample walk-in");
  assert.equal(en.demo.actions.markCompleted, "Mark sample as completed");
  assert.equal(en.demo.actions.reset, "Reset demo");
  const flat = flattenPivot(en).toLowerCase();
  assert.ok(flat.includes("safe sample demo"), "Safe-Sample-Hinweis fehlt");
  assert.ok(flat.includes("no real patient data"), "Hinweis 'no real patient data' fehlt");
  // Demo rendert Tabs + Aktions-Handler tatsächlich.
  for (const ref of ["d.demo.tabs", "d.demo.actions", "addWalkIn", "markCompleted", "showOpenSlots", "reset"]) {
    assert.ok(demo.includes(ref), `Demo rendert ${ref} nicht`);
  }
});

// ─── Phase 12.5 — Revenue Clarity Guard ───────────────────────────────────────

test("Revenue Clarity Guard: Geldlogik klar (monatlich, Patienten zahlen nicht)", () => {
  const en = getPivot("en");
  assert.ok(en.money.title.toLowerCase().includes("how clinicslothub makes money"), "Money-Titel fehlt");
  assert.ok(en.money.intro.toLowerCase().includes("monthly subscription"), "'monthly subscription' fehlt");
  assert.ok(en.money.intro.toLowerCase().includes("patients do not pay on this website"), "'Patients do not pay' fehlt");
  const names = en.money.plans.map((p) => p.name);
  for (const n of ["Starter", "Clinic Pro", "Clinic Plus"]) assert.ok(names.includes(n), `Plan fehlt: ${n}`);
  const prices = en.money.plans.map((p) => p.price).join(" ");
  assert.ok(prices.includes("from $29/month") && prices.includes("from $79/month"), "Plan-Preise fehlen");
  assert.ok(/no payment is processed on this website/i.test(en.money.note), "Kein-Zahlung-Hinweis fehlt");
  for (const loc of PRODUCT_LOCALES) assert.equal(getPivot(loc).money.plans.length, 3, `${loc}: nicht 3 Pläne`);
  // Homepage rendert Money-Sektion + sichere CTAs, kein Checkout.
  const home = stripComments(read("app/[locale]/page.tsx"));
  assert.ok(home.includes("d.money.title") && home.includes("PricingPlans"), "Money-Sektion fehlt auf Homepage");
  assert.equal(/checkout|stripe|<form|createCheckout/i.test(home), false, "Homepage enthält Checkout/Form");
  const plans = stripComments(read("components/pivot/PricingPlans.tsx"));
  assert.equal(/checkout|stripe|createCheckout|<form/i.test(plans), false, "Pricing aktiviert Zahlung");
});

// ─── Phase 12.6 — Buyer Focus Guard ───────────────────────────────────────────

test("Buyer Focus Guard: Klinik ist Hauptkunde, Patient nur kompakt", () => {
  for (const loc of PRODUCT_LOCALES) {
    const d = getPivot(loc);
    assert.ok(/clinic|clínica|cliniqu/.test(flattenPivot(d).toLowerCase()), `${loc}: Klinik nicht adressiert`);
    assert.ok(d.patientsLine.length <= 160, `${loc}: Patientenzeile zu lang`);
  }
  const en = flattenPivot(getPivot("en")).toLowerCase();
  assert.ok(en.includes("front desk") || en.includes("front-desk") || en.includes("reception"), "EN adressiert nicht Klinik-Empfang");
  // Homepage rendert nur die kompakte Patientenzeile, keinen großen Patienten-Block.
  const home = read("app/[locale]/page.tsx");
  assert.ok(home.includes("d.patientsLine"), "kompakte Patientenzeile fehlt");
  assert.equal(home.includes("d.forPatients"), false, "großer Patienten-Block (forPatients) auf Homepage");
});

// ─── Phase 12.7 — No Overload Guard ───────────────────────────────────────────

test("No Overload Guard: kurze Blöcke, keine Textwüste, Safety nicht dominant", () => {
  const d = getPivot("en");
  assert.ok(d.problem.pains.length >= 3 && d.problem.pains.length <= 5, "Pain-Karten 3–5 erwartet");
  for (const p of d.problem.pains) assert.ok(p.length <= 60, `Pain zu lang: "${p}"`);
  assert.equal(d.money.plans.length, 3, "3 Pläne erwartet");
  for (const p of d.money.plans) assert.ok(p.for.length <= 120, `Plan-Beschreibung zu lang: "${p.name}"`);
  assert.ok(d.hero.supporting.length <= 140, "Hero-Supporting zu lang");
  const long: string[] = [];
  const walk = (v: unknown) => {
    if (typeof v === "string") { if (v.length > 230) long.push(v); }
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  const { safety, ...rest } = d;
  walk(rest);
  assert.equal(long.length, 0, `zu lange Textblöcke: ${JSON.stringify(long)}`);
  // Safety bleibt kompakt; Geldlogik ist sichtbarer Hauptinhalt.
  const home = read("app/[locale]/page.tsx");
  assert.ok(home.includes("d.money.title"), "Geldlogik fehlt als Hauptinhalt");
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
  const src = stripComments(read("components/pivot/InteractiveDemo.tsx")) + JSON.stringify(MOCK_ROWS);
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
  assert.ok(home.includes("InteractiveDemo"), "Interaktives Board fehlt auf Homepage");
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
