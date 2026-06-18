/**
 * Public Emerging Markets Positioning – Tests
 *
 * Prüft die ÖFFENTLICHE Positionierung (en + de) auf den Kernflächen:
 *   - messages/en.json + de.json (landing, pricing)
 *   - app/[locale]/page.tsx (hardcodierte JSON-LD/Meta)
 *   - app/[locale]/launch/page.tsx (en/de Copy)
 *   - app/book/[slug]/page.tsx (Patienten-Buchung)
 *
 * Pflicht: emerging healthcare markets, no patient login, WhatsApp-ready ohne API,
 * phone/reception fallback, request is not confirmation, clinic stays in control.
 * Verboten öffentlich: Soft Launch, Twilio, Resend, Stripe, provider configuration,
 * worldwide/weltweit, guaranteed, 24h/48h/instant, no paying customers, positive
 * "automatic appointment confirmation / medical decision / diagnosis upload".
 *
 * Lauf: tsx --test scripts/public-positioning.test.ts
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getContinuousControlOffice, classifyCountry } from "../lib/emerging-markets-agent";
import { assertNoSecretsInResponse } from "../lib/security-agent";

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const en = JSON.parse(read("messages/en.json")) as Record<string, Record<string, unknown>>;
const de = JSON.parse(read("messages/de.json")) as Record<string, Record<string, unknown>>;

/** Alle String-Werte eines Objekts rekursiv zu einem Text zusammenführen. */
function flatten(obj: unknown): string {
  if (typeof obj === "string") return obj + " ";
  if (Array.isArray(obj)) return obj.map(flatten).join(" ");
  if (obj && typeof obj === "object") return Object.values(obj).map(flatten).join(" ");
  return "";
}

const enLanding = flatten(en.landing).toLowerCase();
const deLanding = flatten(de.landing).toLowerCase();
const enPricing = flatten(en.pricing).toLowerCase();
const dePricing = flatten(de.pricing).toLowerCase();

// Tokens, die in öffentlicher en/de-Copy NIRGENDS vorkommen dürfen.
const FORBIDDEN_PUBLIC = [
  "soft launch",
  "twilio",
  "resend",
  "provider configuration",
  "anbieter-konfiguration",
  "no real messages are sent",
  "trial mode",
  "no paying customers",
  "zahlenden kunden",
  "stripe",
  "worldwide",
  "weltweit",
  "doctolib",
  "guaranteed",
  "guarantee",
  "24h",
  "48h",
  "instant",
  "unlimited patients",
  "unbegrenzt patienten",
  "supabase",
];

/** Negierte Form entfernen, dann darf der positive Claim nicht übrig bleiben. */
function assertOnlyNegated(text: string, claim: string, label: string): void {
  const stripped = text.replace(
    new RegExp(`(no|not|never|kein|keine|ohne)\\s+[\\wäöü-]*\\s*${claim}`, "gi"),
    "",
  );
  assert.equal(new RegExp(claim, "i").test(stripped), false, `${label}: positiver Claim "${claim}"`);
}

// ─── Pflicht-Botschaften EN ───────────────────────────────────────────────────

test("EN landing enthält die Pflicht-Positionierung", () => {
  for (const phrase of [
    "emerging healthcare markets",
    "no patient login",
    "whatsapp-ready without api",
    "phone and reception fallback",
    "clinic stays in control",
    "simple waitlist",
    "is not an appointment confirmation",
  ]) {
    assert.ok(enLanding.includes(phrase), `EN landing fehlt: "${phrase}"`);
  }
});

test("DE landing enthält die Pflicht-Positionierung", () => {
  for (const phrase of [
    "wachstumsstarken gesundheitsmärkten",
    "kein patienten-login",
    "whatsapp-ready ohne api",
    "rezeptions-fallback",
    "behält die kontrolle",
    "einfache warteliste",
    "keine terminbestätigung",
  ]) {
    assert.ok(deLanding.includes(phrase), `DE landing fehlt: "${phrase}"`);
  }
});

// ─── Verbotene öffentliche Begriffe ───────────────────────────────────────────

test("EN/DE landing enthalten keine verbotenen öffentlichen Begriffe", () => {
  for (const bad of FORBIDDEN_PUBLIC) {
    assert.equal(enLanding.includes(bad), false, `EN landing enthält "${bad}"`);
    assert.equal(deLanding.includes(bad), false, `DE landing enthält "${bad}"`);
  }
});

test("EN/DE pricing enthalten keine verbotenen öffentlichen Begriffe", () => {
  for (const bad of FORBIDDEN_PUBLIC) {
    assert.equal(enPricing.includes(bad), false, `EN pricing enthält "${bad}"`);
    assert.equal(dePricing.includes(bad), false, `DE pricing enthält "${bad}"`);
  }
});

test("Sensible Claims erscheinen nur negiert (keine positiven Versprechen)", () => {
  for (const text of [enLanding, deLanding]) {
    assertOnlyNegated(text, "automatic appointment confirmation", "landing");
    assertOnlyNegated(text, "automatic medical decision", "landing");
    assertOnlyNegated(text, "automatische terminbestätigung", "landing");
    assertOnlyNegated(text, "automatische medizinische entscheidung", "landing");
  }
});

// ─── Öffentliche Seitendateien ────────────────────────────────────────────────

test("Homepage JSON-LD/Meta ist neu positioniert (kein 'worldwide')", () => {
  const src = read("app/[locale]/page.tsx").toLowerCase();
  assert.ok(src.includes("emerging healthcare markets"), "emerging-Positionierung fehlt");
  assert.equal(src.includes("worldwide"), false, "'worldwide' noch vorhanden");
});

test("Launch-Seite: keine verbotenen englischen Tokens in en/de-Copy", () => {
  const src = read("app/[locale]/launch/page.tsx");
  for (const bad of ["Soft Launch", "now available worldwide", "weltweit verfügbar", "no paying customers", "Keine zahlenden Kunden"]) {
    assert.equal(src.includes(bad), false, `Launch enthält "${bad}"`);
  }
  assert.ok(src.includes("emerging healthcare markets"), "EN emerging-Positionierung fehlt");
  assert.ok(src.includes("wachstumsstarken Gesundheitsmärkten"), "DE emerging-Positionierung fehlt");
});

test("Booking-Seite: kein Login, Anfrage ist keine Bestätigung, keine Notfälle/Diagnosen/Dokumente", () => {
  const src = read("app/book/[slug]/page.tsx");
  assert.ok(/Kein Login nötig|Kein Konto nötig/.test(src), "Kein-Login-Hinweis fehlt");
  assert.ok(src.includes("keine verbindliche Terminbestätigung"), "Hinweis 'keine Terminbestätigung' fehlt");
  assert.ok(/Keine Notfälle, keine Diagnosen, keine Dokumente/.test(src), "Safety-Microcopy fehlt");
});

// ─── Konsistenz mit interner Governance (Phase 0) ─────────────────────────────

test("Country Control: emerging target, entwickelte Märkte blockiert", () => {
  assert.equal(classifyCountry("NG").decision, "target");
  assert.equal(classifyCountry("DE").decision, "blocked_until_legal_review");
  assert.equal(classifyCountry("US").decision, "blocked_until_legal_review");
});

test("Dauerkontroll- und Qualitätssicherungsamt bleibt GREEN", () => {
  const cc = getContinuousControlOffice();
  assert.equal(cc.status, "green");
  assert.equal(assertNoSecretsInResponse(cc), true);
});
