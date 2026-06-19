/**
 * Slotfill Public Positioning Guards.
 *
 * Slotfill ist die öffentliche Marke für eine einfache Patienten-Terminbuchung.
 * Diese Guards stellen sicher, dass die abgelehnte Board-/OS-/Visibility-Richtung
 * öffentlich nicht zurückkehrt, die Marke "Slotfill" ist, die Buchungsroute
 * existiert und keine medizinischen/Trial-/Automatisierungs-Versprechen erscheinen.
 *
 * Lauf: tsx --test scripts/slotfill-positioning.test.ts
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { PUBLIC_BRAND_NAME } from "../lib/brand";
import { locales, RETIRED_LOCALES } from "../i18n/routing";

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const msg = (loc: string) => JSON.parse(read(`messages/${loc}.json`)) as Record<string, Record<string, string>>;
const landingBlob = (loc: string) => JSON.stringify(msg(loc).landing ?? {}).toLowerCase();

const PAGE = "app/[locale]/page.tsx";
const LAYOUT = "app/[locale]/layout.tsx";
const LOGO = "components/ui/SlotFillLogo.tsx";

// ─── 1. Slotfill Brand Guard ──────────────────────────────────────────────────

test("Slotfill Brand Guard: öffentliche Marke ist Slotfill, nicht ClinicSlotHub", () => {
  assert.equal(PUBLIC_BRAND_NAME, "Slotfill", `PUBLIC_BRAND_NAME soll 'Slotfill' sein, ist: ${PUBLIC_BRAND_NAME}`);
  // Wordmark/Logo nutzt die öffentliche Marke.
  assert.ok(read(LOGO).includes("PUBLIC_BRAND_NAME"), "Logo nutzt PUBLIC_BRAND_NAME nicht");
  // nav.brand ist in allen Locales Slotfill.
  for (const loc of locales) {
    assert.equal(msg(loc).nav?.brand, "Slotfill", `${loc}: nav.brand ist nicht 'Slotfill'`);
  }
  // Öffentliche Landing-Metadaten/Schema hardcoden ClinicSlotHub nicht.
  for (const f of [PAGE, LAYOUT]) {
    assert.equal(read(f).includes('"ClinicSlotHub"'), false, `${f}: ClinicSlotHub als öffentliche Hauptmarke hardcodet`);
  }
  // Keine abgelehnte Hauptpositionierung öffentlich.
  for (const f of [PAGE, LAYOUT]) {
    const src = read(f);
    for (const bad of ["Modern Clinic Scheduling OS", "Visibility Engine"]) {
      assert.equal(src.includes(bad), false, `${f}: abgelehnte Positionierung "${bad}"`);
    }
  }
  for (const loc of locales) {
    const b = landingBlob(loc);
    assert.equal(b.includes("clinicslothub"), false, `${loc}: ClinicSlotHub in Landing-Copy`);
    assert.equal(b.includes("modern clinic scheduling os"), false, `${loc}: Scheduling-OS in Landing-Copy`);
  }
});

// ─── 2. Patient Booking Positioning Guard ─────────────────────────────────────

test("Patient Booking Positioning Guard: Slotfill = Online-Terminbuchung", () => {
  const en = msg("en");
  assert.ok(en.landing.heroTitle.toLowerCase().includes("book clinic appointments online"), "EN heroTitle fehlt Patienten-Buchungsbotschaft");
  assert.ok(en.landing.ctaPrimary.toLowerCase().includes("book appointment"), "EN ctaPrimary ist nicht 'Book appointment'");
  assert.ok((en.nav.bookAppointment || "").toLowerCase().includes("book appointment"), "nav.bookAppointment fehlt");
  // Anfragelogik (kein Garantie-/Auto-Versprechen): Online-Booking-Sektion spricht von Anfrage + Bestätigung durch die Klinik.
  const b = landingBlob("en");
  assert.ok(b.includes("appointment request") || b.includes("appointment requests"), "EN Landing erwähnt keine appointment request");
  assert.ok(b.includes("confirm") || b.includes("available"), "EN Landing erwähnt keine Verfügbarkeit/Bestätigung");
});

// ─── 3. Booking Route Guard ───────────────────────────────────────────────────

test("Booking Route Guard: /book/[slug] + /termin-buchen vorhanden und verlinkt", () => {
  assert.ok(existsSync(join(ROOT, "app/book/[slug]/page.tsx")), "Buchungsroute /book/[slug] fehlt");
  assert.ok(existsSync(join(ROOT, "app/[locale]/termin-buchen/page.tsx")), "/termin-buchen fehlt");
  const home = read(PAGE);
  assert.ok(home.includes("/termin-buchen"), "Homepage verlinkt die Buchungsroute /termin-buchen nicht");
  assert.ok(home.includes("/book/testpraxis-delta"), "Homepage verlinkt die Demo-Praxis /book/testpraxis-delta nicht");
});

// ─── 4. No Old Pivot Guard ────────────────────────────────────────────────────

test("No Old Pivot Guard: keine Scheduling-OS-/Board-/Visibility-/Emerging-Reste öffentlich", () => {
  const forbidden = [
    "one board for today",
    "run the clinic day",
    "today board",
    "walk-in queue",
    "open slots",
    "how clinicslothub makes money",
    "modern clinic scheduling os",
    "interactive board",
    "visibility engine",
    "treatment areas",
    "medical tourism",
    "emerging markets",
    "soft launch",
    "try for free",
    "14-day free trial",
  ];
  const srcs = [read(PAGE).toLowerCase(), read(LAYOUT).toLowerCase(), ...locales.map(landingBlob)];
  for (const s of srcs) {
    for (const bad of forbidden) {
      assert.equal(s.includes(bad), false, `Alt-Pivot-Text öffentlich gefunden: "${bad}"`);
    }
  }
});

// ─── 7. Allowed Locale Guard ──────────────────────────────────────────────────

test("Allowed Locale Guard: nur EN/DE/FR/ES/PT aktiv, stillgelegte → 308 /en", () => {
  assert.deepEqual([...locales].slice().sort(), ["de", "en", "es", "fr", "pt"]);
  for (const r of RETIRED_LOCALES) {
    assert.equal((locales as readonly string[]).includes(r), false, `stillgelegte Locale noch aktiv: ${r}`);
  }
  const mw = read("middleware.ts");
  assert.ok(mw.includes("RETIRED_LOCALES"), "Middleware kennt RETIRED_LOCALES nicht");
  assert.ok(/status:\s*308/.test(mw) && mw.includes('"/en"'), "Middleware leitet stillgelegte Locales nicht per 308 auf /en");
});

// ─── 8. Language Switcher Guard ───────────────────────────────────────────────

test("Language Switcher Guard: zeigt nur die 5 aktiven Sprachen", () => {
  const src = read("components/language-switcher.tsx");
  for (const name of ["Deutsch", "English", "Français", "Español", "Português"]) {
    assert.ok(src.includes(name), `Sprache fehlt im Switcher: ${name}`);
  }
  for (const gone of ["中文", "हिन्दी", "العربية", "বাংলা", "Русский"]) {
    assert.equal(src.includes(gone), false, `stillgelegte Sprache noch im Switcher: ${gone}`);
  }
});

// ─── 9. Sitemap Locale Guard ──────────────────────────────────────────────────

test("Sitemap Locale Guard: Sitemap nutzt nur die aktiven Locales", () => {
  const sm = read("app/sitemap.ts");
  assert.ok(sm.includes("locales"), "Sitemap nutzt routing.locales nicht");
  for (const r of ["ar", "hi", "bn", "ru", "zh"]) {
    assert.equal(new RegExp(`["'/]${r}["'/]`).test(sm), false, `Sitemap hardcodet stillgelegte Locale: ${r}`);
  }
});

// ─── 10. Copy Quality Guard ───────────────────────────────────────────────────

test("Copy Quality Guard: keine Platzhalter/TODO, zentrale CTAs gefüllt, FR/ES/PT/DE eigenständig", () => {
  for (const loc of locales) {
    const m = msg(loc);
    const blob = landingBlob(loc);
    for (const ph of ["lorem ipsum", "coming soon"]) {
      assert.equal(blob.includes(ph), false, `${loc}: Platzhalter "${ph}"`);
    }
    assert.equal(/\bTODO\b/.test(JSON.stringify(m.landing ?? {})), false, `${loc}: TODO-Marker`);
    for (const k of ["heroTitle", "ctaPrimary", "ctaSecondary"]) {
      assert.ok((m.landing?.[k] ?? "").trim().length > 2, `${loc}: landing.${k} leer/zu kurz`);
    }
  }
  // Eigenständige Hero-Übersetzung (keine reine EN-Kopie).
  const en = msg("en").landing.heroTitle;
  for (const loc of ["de", "fr", "es", "pt"]) {
    assert.notEqual(msg(loc).landing.heroTitle, en, `${loc}: heroTitle identisch mit EN`);
  }
});

// ─── 11. Duplicate Logic Guard ────────────────────────────────────────────────

test("Duplicate Logic Guard: ein Produkt, eine Haupt-H1, keine Board+Booking-Mischung", () => {
  const raw = read(PAGE);
  const h1 = (raw.match(/<h1[\s>]/g) ?? []).length;
  assert.ok(h1 <= 1, `mehr als eine <h1> auf der Homepage (${h1})`);
  const home = raw.toLowerCase();
  for (const board of ["today board", "walk-in queue", "one board for today", "scheduling os"]) {
    assert.equal(home.includes(board), false, `konkurrierende Board-Positionierung: "${board}"`);
  }
});

// ─── 5. Medical Safety Guard ──────────────────────────────────────────────────

test("Medical Safety Guard: keine medizinischen/Trial-/Automatisierungs-Versprechen", () => {
  const banned = [
    "diagnosis",
    "treatment recommendation",
    "medical advice",
    "guaranteed appointment",
    "emergency",
    "stripe checkout",
    "sms automation",
    "whatsapp automation",
    "file upload",
    "medical record storage",
    "try for free",
    "free trial",
    "14-day",
    "soft launch",
  ];
  const home = read(PAGE).toLowerCase();
  for (const loc of locales) {
    const b = landingBlob(loc);
    for (const bad of banned) {
      assert.equal(b.includes(bad), false, `${loc}: verbotener Begriff in Landing-Copy: "${bad}"`);
    }
  }
  for (const bad of banned) {
    assert.equal(home.includes(bad), false, `Homepage enthält verbotenen Begriff: "${bad}"`);
  }
});

// ─── 6. Button Guard ──────────────────────────────────────────────────────────

test("Button Guard: keine toten CTAs, Book-CTA führt zur Booking-Route", () => {
  const home = read(PAGE);
  assert.equal(/href=["']#["']/.test(home), false, "toter Anker href=\"#\" auf Homepage");
  assert.equal(/<button[^>]*>\s*<\/button>/.test(home), false, "leerer Button auf Homepage");
  // Primärer Buchungs-CTA führt zur Booking-Route, Demo-CTA zur Demo-Praxis.
  assert.ok(home.includes('href={`/${locale}/termin-buchen`}'), "Book-appointment-CTA ohne Booking-Ziel");
  assert.ok(home.includes('href="/book/testpraxis-delta"'), "Demo-Clinic-CTA ohne Ziel");
});
