/**
 * Slotfill Pricing & "What We Sell" Guards.
 *
 * Sichern, dass die Startseite klar verkauft: monatlicher SaaS-Zugang für
 * Praxen/Kliniken, sichtbare Pakete (Starter/Practice/Clinic), klare Geldlogik
 * (Patienten zahlen nicht), funktionierende Pricing-CTAs → Kontakt, und keine
 * Stripe-/Checkout-/Patientenzahlungs-Logik.
 *
 * Lauf: tsx --test scripts/slotfill-pricing.test.ts
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { locales } from "../i18n/routing";
import { PRICING_PLANS, PRICE_FROM_BY_KEY } from "../lib/pricing";

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const msg = (loc: string) => JSON.parse(read(`messages/${loc}.json`)) as Record<string, Record<string, string>>;
const landingBlob = (loc: string) => JSON.stringify(msg(loc).landing ?? {}).toLowerCase();
const PAGE = "app/[locale]/page.tsx";
const PRICING_PAGE = "app/[locale]/pricing/page.tsx";

// ─── 1. Pricing Visibility Guard ──────────────────────────────────────────────

test("Pricing Visibility Guard: Pakete + Preis-Sektion sichtbar auf der Startseite", () => {
  const home = read(PAGE);
  // Eigener, verankerter Pricing-Abschnitt.
  assert.ok(home.includes('id="pricing"'), "Pricing-Sektion (#pricing) fehlt auf der Startseite");
  assert.ok(home.includes('t("pricingTitle")'), "Startseite rendert pricingTitle nicht");
  // Die drei Pakete kommen aus der zentralen Preisquelle und werden gerendert.
  assert.ok(home.includes('from "@/lib/pricing"'), "Homepage nutzt die zentrale Preisquelle nicht");
  const planNames = PRICING_PLANS.map((p) => p.name);
  for (const plan of ["Starter", "Practice", "Clinic"]) {
    assert.ok(planNames.includes(plan), `Paket fehlt in der zentralen Preisquelle: ${plan}`);
  }
  assert.ok(home.includes("pricingPlans.map"), "Startseite rendert die Pakete nicht");
  // DE-Texte klar.
  const de = msg("de").landing;
  assert.ok((de.pricingTitle || "").includes("Preise für Praxen und Kliniken"), "DE pricingTitle unklar");
  assert.ok((de.pricingMoneyNote || "").includes("Patienten zahlen nicht auf dieser Website"), "DE Geldlogik-Hinweis fehlt");
  for (const loc of locales) {
    assert.ok((msg(loc).landing.pricingTitle || "").trim().length > 3, `${loc}: pricingTitle fehlt`);
    assert.ok((msg(loc).landing.pricingMoneyNote || "").trim().length > 10, `${loc}: pricingMoneyNote fehlt`);
  }
});

// ─── 2. What We Sell Guard ────────────────────────────────────────────────────

test("What We Sell Guard: monatlicher SaaS-Zugang klar erklärt", () => {
  const home = read(PAGE);
  assert.ok(home.includes('t("sellTitle")') && home.includes('t("sellSubline")'), "Startseite rendert die Verkaufs-Sektion nicht");
  const de = msg("de").landing;
  assert.ok((de.sellSubline || "").toLowerCase().includes("monatlicher saas-zugang"), "DE: 'monatlicher SaaS-Zugang' fehlt");
  const deBlob = landingBlob("de");
  assert.ok(deBlob.includes("online-terminseite"), "DE: 'Online-Terminseite' fehlt");
  assert.ok(deBlob.includes("online erhalten"), "DE: 'Terminanfragen online erhalten' fehlt");
  assert.ok(deBlob.includes("manuell"), "DE: 'manuelle Bestätigung' fehlt");
  // EN eigenständig.
  assert.ok((msg("en").landing.sellSubline || "").toLowerCase().includes("monthly saas access"), "EN: 'monthly SaaS access' fehlt");
});

// ─── 3. No Patient Payment Guard ──────────────────────────────────────────────

test("No Patient Payment Guard: Patienten sind klar Nicht-Zahler, kein Patientenpreis", () => {
  // Positiv: Geldlogik sagt explizit, dass Patienten nicht zahlen.
  assert.ok(landingBlob("en").includes("patients do not pay"), "EN: 'patients do not pay' fehlt");
  assert.ok(landingBlob("de").includes("patienten zahlen nicht"), "DE: 'Patienten zahlen nicht' fehlt");
  // Negativ: keine Patienten-zahlt-/Patientenpreis-/Patienten-Checkout-Aussagen.
  for (const loc of locales) {
    const b = landingBlob(loc);
    for (const bad of ["patient pays", "patient payment", "patient checkout", "patientenpreis", "patient zahlt", "checkout für patienten"]) {
      assert.equal(b.includes(bad), false, `${loc}: unzulässige Patienten-Zahlungs-Aussage "${bad}"`);
    }
  }
});

// ─── 4. No Stripe Checkout Guard ──────────────────────────────────────────────

test("No Stripe Checkout Guard: keine Stripe-/Checkout-/Kreditkarten-Aktivierung öffentlich", () => {
  const home = read(PAGE).toLowerCase();
  for (const bad of ["stripe", "checkout", "credit card", "kreditkarte", "pay now", "jetzt bezahlen"]) {
    assert.equal(home.includes(bad), false, `Startseite enthält Zahlungs-/Checkout-Begriff: "${bad}"`);
  }
  // Pricing-Seite ruft keinen Stripe-Checkout auf.
  const pricing = read("app/[locale]/pricing/page.tsx");
  assert.equal(/\/api\/stripe\/checkout/.test(pricing), false, "Pricing-Seite ruft Stripe-Checkout auf");
});

// ─── 5. Pricing CTA Guard ─────────────────────────────────────────────────────

test("Pricing CTA Guard: Paket-CTAs führen zur Kontakt-/Praxiszugang-Anfrage, keine toten Links", () => {
  const home = read(PAGE);
  // Pricing-CTAs → /<locale>/kontakt.
  assert.ok(home.includes("/kontakt"), "Pricing-CTA ohne Kontakt-/Praxiszugang-Ziel");
  assert.ok(home.includes('t("planStarterCta")') && home.includes('t("planClinicCta")'), "Paket-CTAs werden nicht gerendert");
  // Keine toten Anker.
  assert.equal(/href=["']#["']/.test(home), false, 'toter Anker href="#" auf der Startseite');
  // Pricing-Seite nutzt dieselben Anfrage-CTAs (landing-Namespace) und führt zur Kontaktseite.
  const pricing = read(PRICING_PAGE);
  assert.ok(pricing.includes("planStarterCta") && pricing.includes("planPracticeCta") && pricing.includes("planClinicCta"), "Pricing-Seite nutzt nicht die gemeinsamen Anfrage-CTAs");
  assert.ok(/\/kontakt/.test(pricing), "Pricing-Seite-CTA führt nicht zur Kontaktseite");
  assert.equal(/ctaProfessional|Professional testen/.test(pricing), false, "Pricing-Seite nutzt noch alte Trial-/Professional-CTA");
});

// ─── 6. Pricing Consistency Guard (zentrale Einzelquelle) ─────────────────────

test("Pricing Consistency Guard: Homepage + Pricing-Seite nutzen dieselbe Preisquelle (29/79/149)", () => {
  // Zentrale Preise stehen fest.
  assert.deepEqual(PRICING_PLANS.map((p) => p.priceFrom), [29, 79, 149], "PRICING_PLANS-Preise weichen ab");
  assert.equal(PRICE_FROM_BY_KEY.starter, 29);
  assert.equal(PRICE_FROM_BY_KEY.professional, 79);
  assert.equal(PRICE_FROM_BY_KEY.praxis_plus, 149);
  // Beide Seiten beziehen die Preise aus lib/pricing – nicht aus eigenen Zahlen.
  assert.ok(read(PAGE).includes('from "@/lib/pricing"'), "Homepage importiert die zentrale Preisquelle nicht");
  assert.ok(read(PRICING_PAGE).includes("PRICE_FROM_BY_KEY"), "Pricing-Seite nutzt die zentrale Preisquelle nicht");
  // Pricing-Seite hardcodet keine abweichenden 29/79/149-Literale mehr im Plan-Array.
  assert.equal(/price_monthly:\s*\d+/.test(read(PRICING_PAGE)), false, "Pricing-Seite hardcodet weiterhin feste Preiszahlen");
});

// ─── 7. No Contradictory Pricing Guard ────────────────────────────────────────

test("No Contradictory Pricing Guard: keine 'auf Anfrage'-Preiszeile neben festen Preisen", () => {
  // Die alte 'auf Anfrage'/'on request'-Formulierung darf nicht mehr als Preiszeile dienen.
  assert.equal((msg("de").landing.pricingOnRequest || "").toLowerCase().includes("auf anfrage"), false, "DE: 'auf Anfrage' als Preiszeile noch vorhanden");
  assert.equal((msg("en").landing.pricingOnRequest || "").toLowerCase().includes("on request"), false, "EN: 'on request' als Preiszeile noch vorhanden");
  // Homepage rendert den Startpreis über das gemeinsame Template, nicht 'auf Anfrage' als Preis.
  const home = read(PAGE);
  assert.ok(home.includes('t("pricePerMonthFrom"'), "Homepage rendert keinen 'ab/from'-Startpreis");
  assert.ok(read(PRICING_PAGE).includes('"pricePerMonthFrom"'), "Pricing-Seite rendert keinen 'ab/from'-Startpreis");
});

// ─── 8. Starting Price Guard ──────────────────────────────────────────────────

test("Starting Price Guard: 'ab/from … € / Monat'-Logik je Locale", () => {
  const de = msg("de").landing.pricePerMonthFrom || "";
  assert.ok(de.includes("ab") && de.includes("{price}") && de.toLowerCase().includes("monat"), "DE pricePerMonthFrom-Format falsch");
  const en = msg("en").landing.pricePerMonthFrom || "";
  assert.ok(/from/i.test(en) && en.includes("{price}") && /month/i.test(en), "EN pricePerMonthFrom-Format falsch");
  for (const loc of locales) {
    assert.ok((msg(loc).landing.pricePerMonthFrom || "").includes("{price}"), `${loc}: pricePerMonthFrom ohne {price}-Platzhalter`);
  }
});

// ─── 9. Market Review Guard ───────────────────────────────────────────────────

test("Market Review Guard: Orientierungspreis + Aktivierung/Angebot nach Prüfung", () => {
  const de = (msg("de").landing.pricingMoneyNote || "").toLowerCase();
  assert.ok(de.includes("orientierungspreise") && de.includes("prüfung") && de.includes("ausgewählte"), "DE pricingMoneyNote ohne Orientierungs-/Prüfungs-/Markt-Hinweis");
  const en = (msg("en").landing.pricingMoneyNote || "").toLowerCase();
  assert.ok(en.includes("indicative") && en.includes("review") && en.includes("selected markets"), "EN pricingMoneyNote ohne Orientierungs-/Review-/Markt-Hinweis");
});

// ─── 10. Pricing Brand & No-Checkout Guard ────────────────────────────────────

test("Pricing Brand & No-Checkout Guard: ClinicSlotHub, kein sichtbares Slotfill, keine Checkout-Aktivierung", () => {
  for (const f of [PAGE, PRICING_PAGE]) {
    const src = read(f);
    // Kein sichtbares Alt-Branding 'Slotfill' (Komponentenname SlotFillLogo bleibt erlaubt).
    assert.equal(/\bSlotfill\b/.test(src.replace(/SlotFillLogo/g, "")), false, `${f}: sichtbares Alt-Branding 'Slotfill'`);
    // Keine echte Zahlungs-/Checkout-Aktivierung (Erwähnung von "kein Stripe" in Kommentaren bleibt erlaubt).
    assert.equal(/loadStripe|redirectToCheckout|new\s+Stripe\(|stripe\.checkout|\/api\/stripe/i.test(src), false, `${f}: echte Checkout-/Stripe-Aktivierung`);
    // Keine sichtbaren Kauf-CTAs (statt Anfrage).
    for (const bad of ["jetzt kaufen", "buy now", "pay now", "credit card required", "kreditkarte erforderlich"]) {
      assert.equal(src.toLowerCase().includes(bad), false, `${f}: sichtbarer Kauf-CTA "${bad}"`);
    }
  }
  // Patienten-Nichtzahlung bleibt klar.
  assert.ok((msg("de").landing.pricingMoneyNote || "").includes("Patienten zahlen nicht auf dieser Website"), "DE Geldlogik fehlt");
  assert.ok((msg("en").landing.pricingMoneyNote || "").toLowerCase().includes("patients do not pay"), "EN Geldlogik fehlt");
});

// ─── 11. Public Technical Terms Guard ─────────────────────────────────────────

test("Public Technical Terms Guard: keine internen Technikbegriffe in öffentlicher Marketing-Copy", () => {
  // Gilt für die öffentlichen Marketing-Namespaces (landing + pricing). Legal-Seiten
  // (Datenschutz/AGB/AVV) dürfen Sub-Prozessoren rechtlich nennen – die liegen in
  // lib/market-scope.ts / legal-content und sind hier NICHT erfasst.
  const BANNED = [
    "stripe", "twilio", "supabase", "neon", "resend", "brevo", "smtp", "webhook",
    "whatsapp", " sms", "sms ", "/sms", "testmodus", "soft launch", "provider-konfiguration",
    "externe anbieter", "anbietergebühren", "anbieterkosten", "integriert, aber nicht aktiv",
  ];
  // Nur sichtbare VALUES prüfen (Key-Namen wie 'stripeNotLive' sind nicht öffentlich sichtbar).
  const values = (o: unknown): string[] => {
    if (typeof o === "string") return [o];
    if (o && typeof o === "object") return Object.values(o).flatMap(values);
    return [];
  };
  for (const loc of locales) {
    const m = msg(loc);
    const blob = [...values(m.landing ?? {}), ...values(m.pricing ?? {})].join(" ").toLowerCase();
    for (const term of BANNED) {
      assert.equal(blob.includes(term), false, `${loc}: interner Technikbegriff in öffentlicher Copy: "${term.trim()}"`);
    }
  }
  // Die öffentliche Pricing-Seite rendert nur die bereinigten Hinweis-Keys.
  const pricing = read(PRICING_PAGE);
  assert.equal(/Twilio|Supabase|Stripe-Preis/.test(pricing), false, "Pricing-Seite zeigt internen Technikbegriff im Code-sichtbaren Text");
});
