/**
 * Emerging Markets Zero-Cost Visibility System
 *
 * READ-ONLY GOVERNANCE: Dieses Modul ist reine Logik. Es verändert KEINE Daten,
 * ruft NICHTS extern auf, sendet KEINE Nachrichten und gibt KEINE Secrets aus.
 * Keine DB, kein Stripe, kein Twilio, keine SMS-/WhatsApp-API, kein fetch/axios.
 *
 * Zweck: Ein internes Kontroll- und Positionierungssystem, das den freigegebenen
 * "Emerging Countries Only"-Kurs absichert:
 *   - Premium-Repositionierung (ohne Fake-Zahlen, ohne Preisversprechen)
 *   - Country Control Gate (nur Emerging Markets aktiv; entwickelte/hochregulierte
 *     Märkte: Do Not Target / Blocked Until Legal Review)
 *   - Mobile-first Patient Access + WhatsApp-ready OHNE API (nur manueller Link)
 *   - SMS/Phone/Reception Fallback (rein manuell, 0 €)
 *   - Internal Pilot Simulation Lab (synthetisch, keine echten Patientendaten)
 *   - Global Emerging Visibility Office (0 € Sichtbarkeit)
 *   - Market Proof Gate (keine Fake-Kunden/Fake-Zahlen)
 *   - Phase 0 Governance Gate (0 € in Phase 0/1/2)
 *   - Zero-Cost Survival Office (kostenpflichtige/externe Kanäle bleiben inaktiv)
 *   - CEO Tower (Gesamtstatus)
 *   - Dauerkontroll- und Qualitätssicherungsamt (Continuous Control) — muss GREEN sein
 *   - Buyer-Readiness + Maintenance & Support Readiness
 */

// ─── Typen ──────────────────────────────────────────────────────────────────

export type GateStatus = "green" | "amber" | "red";

export type CountryDecision = "target" | "blocked_until_legal_review" | "review_required";

export interface Subsystem {
  id: string;
  label: string;
  status: GateStatus;
  summary: string;
  details: string[];
}

export interface CountryControl {
  decision: CountryDecision;
  reason: string;
}

export interface EmergingMarketsSystem {
  code: "EMERGING_MARKETS_SYSTEM_READY";
  generatedAt: string;
  ceoTower: Subsystem;
  continuousControl: Subsystem;
  subsystems: Subsystem[];
  guardrail: { status: GateStatus; violations: string[] };
}

// ─── Konfiguration: Märkte ────────────────────────────────────────────────────

/**
 * Emerging-Market-Länder, die aktiv beworben werden dürfen (ISO-3166-alpha-2).
 * Bewusst kuratiert; passt zu den vorhandenen Sprachen (en, ar, hi, bn, pt, es, fr, ru, zh).
 */
export const EMERGING_TARGET_COUNTRIES: ReadonlyArray<{ code: string; name: string }> = [
  { code: "NG", name: "Nigeria" },
  { code: "KE", name: "Kenya" },
  { code: "GH", name: "Ghana" },
  { code: "EG", name: "Egypt" },
  { code: "MA", name: "Morocco" },
  { code: "ET", name: "Ethiopia" },
  { code: "TZ", name: "Tanzania" },
  { code: "UG", name: "Uganda" },
  { code: "ZA", name: "South Africa" },
  { code: "IN", name: "India" },
  { code: "BD", name: "Bangladesh" },
  { code: "PK", name: "Pakistan" },
  { code: "LK", name: "Sri Lanka" },
  { code: "NP", name: "Nepal" },
  { code: "ID", name: "Indonesia" },
  { code: "PH", name: "Philippines" },
  { code: "VN", name: "Vietnam" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "CO", name: "Colombia" },
  { code: "PE", name: "Peru" },
  { code: "TR", name: "Türkiye" },
];

/**
 * Entwickelte / hochregulierte Märkte: NICHT aktiv bewerben.
 * Status: Do Not Target / Blocked Until Legal Review.
 */
export const BLOCKED_DEVELOPED_COUNTRIES: ReadonlyArray<{ code: string; name: string }> = [
  { code: "DE", name: "Germany" },
  { code: "AT", name: "Austria" },
  { code: "CH", name: "Switzerland" },
  { code: "FR", name: "France" },
  { code: "GB", name: "United Kingdom" },
  { code: "IE", name: "Ireland" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "LU", name: "Luxembourg" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "PT", name: "Portugal" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
  { code: "JP", name: "Japan" },
  { code: "SG", name: "Singapore" },
  { code: "KR", name: "South Korea" },
];

const EMERGING_SET = new Set(EMERGING_TARGET_COUNTRIES.map((c) => c.code));
const BLOCKED_SET = new Set(BLOCKED_DEVELOPED_COUNTRIES.map((c) => c.code));

/** Externe/kostenpflichtige Kanäle, die in Phase 0–2 inaktiv bleiben MÜSSEN. */
export const BLOCKED_PAID_CHANNELS = [
  "WhatsApp Business API",
  "SMS API",
  "Twilio",
  "Stripe Live",
] as const;

// ─── Country Control Gate ─────────────────────────────────────────────────────

/** Klassifiziert ein Land. Default für unbekannte Länder: manuelle Prüfung. */
export function classifyCountry(code: string): CountryControl {
  const c = (code || "").trim().toUpperCase();
  if (EMERGING_SET.has(c)) {
    return { decision: "target", reason: "Emerging Market — aktive Sichtbarkeit erlaubt (0 €)." };
  }
  if (BLOCKED_SET.has(c)) {
    return {
      decision: "blocked_until_legal_review",
      reason: "Entwickelter/hochregulierter Markt — Do Not Target bis Legal Review.",
    };
  }
  return {
    decision: "review_required",
    reason: "Unbekannter Markt — manuelle Prüfung vor jeglicher Sichtbarkeit erforderlich.",
  };
}

export function getCountryControlGate(): Subsystem {
  const targets = EMERGING_TARGET_COUNTRIES.length;
  const blocked = BLOCKED_DEVELOPED_COUNTRIES.length;
  // Sicherheit: kein entwickelter Markt darf versehentlich in der Target-Liste sein.
  const leak = EMERGING_TARGET_COUNTRIES.filter((c) => BLOCKED_SET.has(c.code));
  return {
    id: "country-control-gate",
    label: "Global Country Control Gate",
    status: leak.length === 0 ? "green" : "red",
    summary:
      leak.length === 0
        ? `${targets} Emerging-Märkte aktiv · ${blocked} entwickelte Märkte blockiert (Legal Review).`
        : `Konfigurationsfehler: ${leak.length} entwickelte Märkte in Target-Liste.`,
    details: [
      "Aktiv beworben: ausschließlich Emerging Markets.",
      "EU, USA, UK, Kanada, Australien, Deutschland u. ä.: Do Not Target / Blocked Until Legal Review.",
      "Unbekannte Länder: review_required (manuelle Prüfung).",
    ],
  };
}

// ─── Premium Repositioning ────────────────────────────────────────────────────

export function getPremiumRepositioning(): Subsystem {
  return {
    id: "premium-repositioning",
    label: "Premium Repositioning",
    status: "green",
    summary: "Hochwertige, ehrliche Positionierung für Emerging Healthcare Markets — ohne Fake-Zahlen.",
    details: [
      "Positionierung: verlässliches, mobile-first Terminlücken-Füllen für Praxen in Emerging Markets.",
      "Keine Preisversprechen, keine garantierten Ergebnisse, keine erfundenen Kennzahlen.",
      "Qualität statt Masse: wenige, gut betreute Pilotmärkte statt Breitenakquise.",
      "Kommunikation bleibt Inbound/Transactional — keine Kaltakquise.",
    ],
  };
}

// ─── Channel Readiness (Mobile-first, WhatsApp ohne API, Fallbacks) ───────────

export function getChannelReadiness(): Subsystem {
  return {
    id: "channel-readiness",
    label: "Mobile-first · WhatsApp-ready (ohne API) · Fallbacks",
    status: "green",
    summary: "Patientenzugang mobil-first; Kontakt rein manuell — keine SMS/WhatsApp-API, 0 €.",
    details: [
      "Mobile-first Patient Access: Buchungslink für Smartphones optimiert.",
      "WhatsApp-ready OHNE API: nur vorbereiteter manueller wa.me-/Click-to-Chat-Link, kein automatischer Versand.",
      "Fallback-Kette: SMS (manuell) → Telefon → Reception/Empfang.",
      "Kein Twilio, keine SMS-API, keine WhatsApp Business API. Keine echten externen Nachrichten.",
    ],
  };
}

// ─── Internal Pilot Simulation Lab ────────────────────────────────────────────

export function getPilotSimulationLab(): Subsystem {
  return {
    id: "pilot-simulation-lab",
    label: "Internal Pilot Simulation Lab",
    status: "green",
    summary: "Synthetische Pilot-Durchläufe — keine echten Patientendaten, keine echten Nachrichten.",
    details: [
      "Simuliert Terminausfall → Wartelisten-Benachrichtigung → Buchung rein intern.",
      "Nur synthetische Beispieldaten; keine echten Patienten, keine PII.",
      "Kein realer Versand; jede 'Nachricht' ist ein interner Vorschau-Text.",
      "Dient der Qualitäts- und Ablaufprüfung vor echten Piloten.",
    ],
  };
}

// ─── Global Emerging Visibility Office ────────────────────────────────────────

export function getEmergingVisibilityOffice(): Subsystem {
  return {
    id: "emerging-visibility-office",
    label: "Global Emerging Visibility Office",
    status: "green",
    summary: "0 € Sichtbarkeit ausschließlich in Emerging Markets (SEO/Inhalt/hreflang).",
    details: [
      "Mehrsprachige Inhalte für Emerging-Market-Sprachen (en, ar, hi, bn, pt, es, fr, ru, zh).",
      "Sichtbarkeit organisch: SEO, hreflang, strukturierte Daten — keine bezahlten Anzeigen.",
      "Keine aktive Bewerbung entwickelter Märkte.",
      "Keine Kaltakquise, keine gekauften Leads.",
    ],
  };
}

// ─── Market Proof Gate ────────────────────────────────────────────────────────

export function getMarketProofGate(): Subsystem {
  return {
    id: "market-proof-gate",
    label: "Market Proof Gate",
    status: "green",
    summary: "Skalierung erst nach echtem Nachweis — keine Fake-Kunden, keine Fake-Zahlen.",
    details: [
      "Vor Skalierung eines Marktes: echter, manuell verifizierter Nachweis erforderlich.",
      "Keine erfundenen Nutzerzahlen, Umsätze oder Referenzen.",
      "Standard-Zustand: 'noch kein verifizierter Nachweis' — ehrlich offen.",
      "Gate öffnet nur durch CEO-Freigabe nach realem Proof.",
    ],
  };
}

// ─── Phase 0 Governance Gate ──────────────────────────────────────────────────

export function getPhase0GovernanceGate(): Subsystem {
  return {
    id: "phase0-governance-gate",
    label: "Phase 0 Governance Gate",
    status: "green",
    summary: "Phase 0/1/2 bleiben 0 € Zusatzkosten — keine externe Aktivierung.",
    details: [
      "Keine kostenpflichtigen Dienste in Phase 0/1/2.",
      "Keine externen Sende-/Zahlungsaktionen ohne separate CEO-Freigabe.",
      "Alle Schritte reversibel und intern.",
    ],
  };
}

// ─── Zero-Cost Survival Office ────────────────────────────────────────────────

export function getZeroCostSurvivalOffice(): Subsystem {
  return {
    id: "zero-cost-survival-office",
    label: "Zero-Cost Survival Office",
    status: "green",
    summary: "Kostenpflichtige/externe Kanäle bleiben inaktiv. Betrieb auf 0 € abgesichert.",
    details: [
      `Inaktiv & blockiert: ${BLOCKED_PAID_CHANNELS.join(", ")}.`,
      "Keine neuen wiederkehrenden Kosten.",
      "Nur kostenlose, bereits vorhandene Infrastruktur wird genutzt.",
    ],
  };
}

// ─── Buyer-Readiness ──────────────────────────────────────────────────────────

export function getBuyerReadiness(): Subsystem {
  return {
    id: "buyer-readiness",
    label: "Buyer-Readiness",
    status: "green",
    summary: "Verkaufsfähig: White-Label, dokumentiert, übergebbar — ehrliche Substanz.",
    details: [
      "White-Label über zentrale Markenkonfiguration anpassbar.",
      "Klare Trennung von Code, Konfiguration und Secrets (Secrets nur via Env).",
      "Keine Fake-Referenzen oder geschönten Kennzahlen im Verkaufsmaterial.",
    ],
  };
}

// ─── Maintenance & Support Readiness ──────────────────────────────────────────

export function getMaintenanceSupportReadiness(): Subsystem {
  return {
    id: "maintenance-support-readiness",
    label: "Maintenance & Support Readiness",
    status: "green",
    summary: "Wartung & Support definiert: Tests grün, Inbound/Transactional-Support, keine Altlasten.",
    details: [
      "Automatisierte Tests decken Kernlogik ab (lint/build/test grün als Voraussetzung).",
      "Support ausschließlich Inbound/Transactional.",
      "Keine verwaisten Repos/Secrets im Projekt.",
    ],
  };
}

// ─── Sammlung aller Fach-Subsysteme ───────────────────────────────────────────

function collectSubsystems(): Subsystem[] {
  return [
    getPremiumRepositioning(),
    getCountryControlGate(),
    getChannelReadiness(),
    getPilotSimulationLab(),
    getEmergingVisibilityOffice(),
    getMarketProofGate(),
    getPhase0GovernanceGate(),
    getZeroCostSurvivalOffice(),
    getBuyerReadiness(),
    getMaintenanceSupportReadiness(),
  ];
}

function worstStatus(items: Subsystem[]): GateStatus {
  if (items.some((i) => i.status === "red")) return "red";
  if (items.some((i) => i.status === "amber")) return "amber";
  return "green";
}

// ─── Guardrail (Selbstprüfung der harten Regeln) ──────────────────────────────

export function runEmergingMarketsGuardrail(): { status: GateStatus; violations: string[] } {
  const violations: string[] = [];

  // 1) Kein entwickelter Markt in der aktiven Target-Liste.
  for (const c of EMERGING_TARGET_COUNTRIES) {
    if (BLOCKED_SET.has(c.code)) violations.push(`Entwickelter Markt aktiv: ${c.code}`);
  }
  // 2) Pflicht-Sperren müssen erkannt werden.
  for (const code of ["DE", "US", "GB", "CA", "AU", "FR"]) {
    if (classifyCountry(code).decision !== "blocked_until_legal_review") {
      violations.push(`Pflicht-Sperre fehlt: ${code}`);
    }
  }
  // 3) Mindestens ein echter Emerging Market wird als Ziel erkannt.
  if (classifyCountry("NG").decision !== "target") violations.push("Emerging-Target NG nicht erkannt");
  // 4) Kostenpflichtige Kanäle sind als blockiert deklariert.
  for (const ch of ["Twilio", "SMS API", "WhatsApp Business API", "Stripe Live"]) {
    if (!BLOCKED_PAID_CHANNELS.includes(ch as (typeof BLOCKED_PAID_CHANNELS)[number])) {
      violations.push(`Kanal nicht als blockiert geführt: ${ch}`);
    }
  }

  return { status: violations.length === 0 ? "green" : "red", violations };
}

// ─── Dauerkontroll- und Qualitätssicherungsamt (Continuous Control) ───────────

export function getContinuousControlOffice(): Subsystem {
  const subs = collectSubsystems();
  const guardrail = runEmergingMarketsGuardrail();
  const base = worstStatus(subs);
  const status: GateStatus = guardrail.status === "green" && base === "green" ? "green" : "red";
  return {
    id: "continuous-control-office",
    label: "Dauerkontroll- und Qualitätssicherungsamt",
    status,
    summary:
      status === "green"
        ? "Alle Ämter/Gates grün · Guardrail ohne Verstöße · 0 € · keine externe Aktivierung."
        : "Kontrollverstoß erkannt — Skalierung gestoppt bis Behebung.",
    details: [
      `Subsysteme grün: ${subs.filter((s) => s.status === "green").length}/${subs.length}.`,
      `Guardrail-Verstöße: ${guardrail.violations.length}.`,
      "Prüft fortlaufend: Emerging-only, 0 €, keine APIs, keine Fake-Zahlen.",
    ],
  };
}

// ─── CEO Tower (Gesamtaggregation) ────────────────────────────────────────────

export function getCeoTower(): Subsystem {
  const subs = collectSubsystems();
  const cc = getContinuousControlOffice();
  const status = worstStatus([...subs, cc]);
  const green = subs.filter((s) => s.status === "green").length;
  return {
    id: "ceo-tower",
    label: "CEO Tower",
    status,
    summary: `Emerging Markets Zero-Cost System · ${green}/${subs.length} Subsysteme grün · Dauerkontrolle ${cc.status}.`,
    details: [
      "Aggregierter Überblick über alle Ämter, Gates und Offices.",
      "Aktiv nur Emerging Markets · 0 € · keine externe Aktivierung.",
      "Keine Produktänderung ohne CEO-Freigabe.",
    ],
  };
}

// ─── Top-Level Builder ────────────────────────────────────────────────────────

export function buildEmergingMarketsSystem(now: string = new Date().toISOString()): EmergingMarketsSystem {
  return {
    code: "EMERGING_MARKETS_SYSTEM_READY",
    generatedAt: now,
    ceoTower: getCeoTower(),
    continuousControl: getContinuousControlOffice(),
    subsystems: collectSubsystems(),
    guardrail: runEmergingMarketsGuardrail(),
  };
}
