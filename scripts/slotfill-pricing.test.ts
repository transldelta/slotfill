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

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const msg = (loc: string) => JSON.parse(read(`messages/${loc}.json`)) as Record<string, Record<string, string>>;
const landingBlob = (loc: string) => JSON.stringify(msg(loc).landing ?? {}).toLowerCase();
const PAGE = "app/[locale]/page.tsx";

// ─── 1. Pricing Visibility Guard ──────────────────────────────────────────────

test("Pricing Visibility Guard: Pakete + Preis-Sektion sichtbar auf der Startseite", () => {
  const home = read(PAGE);
  // Eigener, verankerter Pricing-Abschnitt.
  assert.ok(home.includes('id="pricing"'), "Pricing-Sektion (#pricing) fehlt auf der Startseite");
  assert.ok(home.includes('t("pricingTitle")'), "Startseite rendert pricingTitle nicht");
  // Die drei Pakete sind sichtbar.
  for (const plan of ["Starter", "Practice", "Clinic"]) {
    assert.ok(home.includes(`"${plan}"`), `Paket fehlt auf der Startseite: ${plan}`);
  }
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
});
