/**
 * ClinicSlotHub Legal & Market-Scope Consistency Guards.
 *
 * Sichern, dass öffentliche Legal-Seiten widerspruchsfrei sind: kein „weltweit/
 * worldwide/global verfügbar", konsistenter „ausgewählte internationale Märkte /
 * Aktivierung nach Prüfung"-Scope, keine falschen Compliance-/Ausschluss-Aussagen,
 * Impressum-Pflichtangaben vorhanden, Marke ClinicSlotHub.
 *
 * Lauf: tsx --test scripts/legal-scope.test.ts
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getMarketScope } from "../lib/market-scope";

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

const LEGAL = [
  "components/legal/ImpressumContent.tsx",
  "components/legal/AgbContent.tsx",
  "components/legal/DatenschutzContent.tsx",
  "components/legal/AvvContent.tsx",
];
// Weitere öffentliche Flächen, die denselben Scope wahren müssen.
const PUBLIC_SCOPE = [
  "lib/market-scope.ts",
  "app/auth/login/page.tsx",
  "lib/blog-data.ts",
  "lib/blog-translations.ts",
];

// ─── 1. No Worldwide Legal Claim Guard ────────────────────────────────────────

test("No Worldwide Legal Claim Guard: kein 'weltweit/worldwide/global verfügbar' öffentlich", () => {
  // Bare „global" wird nicht geprüft (Blog-Slug 'global-soft-launch' ist erlaubt) –
  // nur konkrete Verfügbarkeits-/Reichweite-Phrasen.
  const BAD = [
    "weltweit", "worldwide", "monde entier", "todo el mundo", "todo o mundo",
    "global launch", "público global", "lancement public mondial", "global availability",
    "available globally", "globaler start",
  ];
  for (const f of [...LEGAL, ...PUBLIC_SCOPE]) {
    const low = read(f).toLowerCase();
    for (const bad of BAD) {
      assert.equal(low.includes(bad), false, `${f}: widersprüchliche Reichweite-Aussage "${bad}"`);
    }
  }
});

// ─── 2. Market Scope Consistency Guard ────────────────────────────────────────

test("Market Scope Consistency Guard: ausgewählte Märkte + Aktivierung nach Prüfung", () => {
  const en = getMarketScope("en");
  const agb = en.agbBody.join(" ").toLowerCase();
  assert.ok(agb.includes("selected international markets"), "EN Market-Scope ohne 'selected international markets'");
  for (const must of ["european union", "united states", "canada"]) {
    assert.ok(agb.includes(must), `EN Market-Scope nennt ausgeschlossene Märkte nicht: ${must}`);
  }
  assert.ok(/review|prüf/i.test(en.privacyNotice + " " + en.agbBody.join(" ")), "Market-Scope ohne 'review/Prüfung'");
  // Impressum nennt den geprüften Scope statt 'weltweit'.
  const imp = read("components/legal/ImpressumContent.tsx").toLowerCase();
  assert.ok(imp.includes("ausgewählte internationale märkte"), "Impressum ohne 'ausgewählte internationale Märkte'");
  assert.ok(imp.includes("nach prüfung"), "Impressum ohne 'nach Prüfung'");
});

// ─── 3. No False Legal Exclusion / Compliance Guard ───────────────────────────

test("No False Legal Exclusion Guard: keine 'DSGVO gilt nicht'/Compliance-Garantie", () => {
  const BAD = [
    "dsgvo gilt nicht", "gdpr does not apply", "hipaa does not apply", "dsgvo irrelevant",
    "fully compliant", "guaranteed compliance", "rechtskonform garantiert", "garantiert rechtssicher",
    "gdpr-ready", "hipaa-ready",
  ];
  for (const f of [...LEGAL, "lib/market-scope.ts"]) {
    const low = read(f).toLowerCase();
    for (const bad of BAD) {
      assert.equal(low.includes(bad), false, `${f}: falsche Compliance-/Ausschluss-Aussage "${bad}"`);
    }
  }
});

// ─── 4. Impressum Required Data Guard ─────────────────────────────────────────

test("Impressum Required Data Guard: Anbieterangaben vorhanden (nicht entfernt)", () => {
  const imp = read("components/legal/ImpressumContent.tsx");
  assert.ok(imp.includes("Brahim Ben Abla"), "Impressum: Anbietername fehlt");
  assert.ok(/\b76227\b/.test(imp) && imp.includes("Karlsruhe"), "Impressum: ladungsfähige Anschrift fehlt");
  assert.ok(imp.length > 1500, "Impressum wirkt leer/zu kurz");
});

// ─── 5. Legal Brand Guard ─────────────────────────────────────────────────────

test("Legal Brand Guard: ClinicSlotHub, kein Slotfill/ClinicsLotHub auf Legal-Seiten", () => {
  for (const f of LEGAL) {
    const src = read(f);
    assert.ok(src.includes("ClinicSlotHub") || /BRAND_NAME|getLegalContent/.test(src), `${f}: ClinicSlotHub fehlt`);
    assert.equal(/\bSlotfill\b/.test(src.replace(/SlotFillLogo/g, "")), false, `${f}: altes 'Slotfill'`);
    assert.equal(src.includes("ClinicsLotHub"), false, `${f}: falsche Schreibweise 'ClinicsLotHub'`);
  }
});
