/**
 * Emerging Markets Zero-Cost Visibility System – Tests
 *
 * Hermetische Tests reiner Logik (keine DB, kein Netzwerk).
 * Lauf: tsx --test scripts/emerging-markets.test.ts
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  classifyCountry,
  getCountryControlGate,
  getChannelReadiness,
  getZeroCostSurvivalOffice,
  getMarketProofGate,
  getPilotSimulationLab,
  getEmergingVisibilityOffice,
  getCeoTower,
  getContinuousControlOffice,
  runEmergingMarketsGuardrail,
  buildEmergingMarketsSystem,
  EMERGING_TARGET_COUNTRIES,
  BLOCKED_DEVELOPED_COUNTRIES,
  BLOCKED_PAID_CHANNELS,
} from "../lib/emerging-markets-agent";
import { assertNoSecretsInResponse } from "../lib/security-agent";

// ─── Country Control Gate ─────────────────────────────────────────────────────

test("Emerging Markets werden als Ziel erkannt", () => {
  for (const code of ["NG", "KE", "IN", "BD", "BR", "ID", "PH", "EG", "TR"]) {
    assert.equal(classifyCountry(code).decision, "target", `${code} sollte target sein`);
  }
});

test("Entwickelte/hochregulierte Märkte sind blockiert (Legal Review)", () => {
  for (const code of ["DE", "AT", "CH", "FR", "GB", "US", "CA", "AU", "NZ", "JP", "SE", "ES", "PT"]) {
    assert.equal(
      classifyCountry(code).decision,
      "blocked_until_legal_review",
      `${code} muss blockiert sein`,
    );
  }
});

test("Unbekannte Länder erfordern manuelle Prüfung", () => {
  assert.equal(classifyCountry("XX").decision, "review_required");
  assert.equal(classifyCountry("").decision, "review_required");
});

test("classifyCountry ist case- und whitespace-tolerant", () => {
  assert.equal(classifyCountry(" ng ").decision, "target");
  assert.equal(classifyCountry("de").decision, "blocked_until_legal_review");
});

test("Kein entwickelter Markt steckt in der aktiven Target-Liste", () => {
  const blocked = new Set(BLOCKED_DEVELOPED_COUNTRIES.map((c) => c.code));
  for (const c of EMERGING_TARGET_COUNTRIES) {
    assert.equal(blocked.has(c.code), false, `${c.code} darf nicht aktiv beworben werden`);
  }
  assert.equal(getCountryControlGate().status, "green");
});

// ─── Zero-Cost / keine APIs ───────────────────────────────────────────────────

test("Zero-Cost Survival Office führt alle kostenpflichtigen Kanäle als blockiert", () => {
  const office = getZeroCostSurvivalOffice();
  assert.equal(office.status, "green");
  for (const ch of ["WhatsApp Business API", "SMS API", "Twilio", "Stripe Live"]) {
    assert.ok(
      BLOCKED_PAID_CHANNELS.includes(ch as (typeof BLOCKED_PAID_CHANNELS)[number]),
      `${ch} muss blockiert sein`,
    );
  }
});

test("Channel Readiness nutzt keine API — nur manueller Versand", () => {
  const channels = getChannelReadiness();
  const text = channels.details.join(" ").toLowerCase();
  assert.ok(text.includes("ohne api"), "WhatsApp muss ohne API laufen");
  assert.ok(text.includes("manuell"), "Versand muss manuell sein");
  // Keine Behauptung eines automatischen Versands
  assert.equal(/automatischer versand/.test(text) && !/kein automatischer versand|kein.*versand/.test(text), false);
});

// ─── Keine Fake-Zahlen / synthetische Pilotdaten ──────────────────────────────

test("Market Proof Gate verbietet Fake-Kunden/Fake-Zahlen", () => {
  const gate = getMarketProofGate();
  const text = gate.details.join(" ").toLowerCase();
  assert.ok(text.includes("keine erfundenen") || text.includes("keine fake"), "Fake-Verbot fehlt");
  assert.ok(text.includes("nachweis"), "Proof-Anforderung fehlt");
});

test("Pilot Simulation Lab ist synthetisch — keine echten Patientendaten", () => {
  const lab = getPilotSimulationLab();
  const text = lab.details.join(" ").toLowerCase();
  assert.ok(text.includes("synthetisch"), "muss synthetisch sein");
  assert.ok(text.includes("keine echten patienten") || text.includes("keine pii"), "PII-Verbot fehlt");
  assert.ok(text.includes("kein realer versand") || text.includes("interner"), "kein realer Versand");
});

test("Visibility Office bewirbt keine entwickelten Märkte und keine bezahlten Anzeigen", () => {
  const office = getEmergingVisibilityOffice();
  const text = office.details.join(" ").toLowerCase();
  assert.ok(text.includes("organisch") || text.includes("seo"), "muss organisch sein");
  assert.ok(text.includes("keine bezahlten anzeigen"), "bezahlte Anzeigen müssen ausgeschlossen sein");
});

// ─── Guardrail / Dauerkontrolle / CEO Tower ───────────────────────────────────

test("Guardrail meldet keine Verstöße (green)", () => {
  const g = runEmergingMarketsGuardrail();
  assert.equal(g.status, "green");
  assert.deepEqual(g.violations, []);
});

test("Dauerkontroll- und Qualitätssicherungsamt ist GREEN", () => {
  assert.equal(getContinuousControlOffice().status, "green");
});

test("CEO Tower ist GREEN und aggregiert alle Subsysteme", () => {
  assert.equal(getCeoTower().status, "green");
});

test("Gesamtsystem ist konsistent und enthält alle Subsysteme", () => {
  const sys = buildEmergingMarketsSystem("2026-06-18T00:00:00.000Z");
  assert.equal(sys.code, "EMERGING_MARKETS_SYSTEM_READY");
  assert.equal(sys.generatedAt, "2026-06-18T00:00:00.000Z");
  assert.equal(sys.ceoTower.status, "green");
  assert.equal(sys.continuousControl.status, "green");
  assert.equal(sys.guardrail.status, "green");
  const ids = sys.subsystems.map((s) => s.id);
  for (const required of [
    "premium-repositioning",
    "country-control-gate",
    "channel-readiness",
    "pilot-simulation-lab",
    "emerging-visibility-office",
    "market-proof-gate",
    "phase0-governance-gate",
    "zero-cost-survival-office",
    "buyer-readiness",
    "maintenance-support-readiness",
  ]) {
    assert.ok(ids.includes(required), `Subsystem ${required} fehlt`);
  }
});

// ─── Sicherheit: keine Secrets in der Ausgabe ─────────────────────────────────

test("Systemausgabe enthält keine Secrets", () => {
  const sys = buildEmergingMarketsSystem("2026-06-18T00:00:00.000Z");
  assert.equal(assertNoSecretsInResponse(sys), true);
});
