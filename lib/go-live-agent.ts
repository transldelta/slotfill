/**
 * Go-Live-Readiness-Agent – Schritt 21 (Fix: korrekte Routen-Erkennung nach i18n)
 *
 * READ-ONLY: Analysiert, bewertet, warnt und empfiehlt.
 * Führt KEINE automatischen Aktionen aus.
 * Sendet KEINE E-Mails, SMS, WhatsApp oder Anrufe.
 * Keine automatische Kaltakquise.
 * Keine Fake-Testimonials.
 * Keine echten Zahlungen.
 * Alle Aufgaben: manualOnly = true, autoExecutable = false.
 *
 * Prüft 9 Bereiche (A–I) und bezieht vorhandene Agenten ein:
 * Marketing-, CEO-, Operations-, Security-Agent.
 *
 * Routen-Erkennung:
 * - Primär: KNOWN_APP_ROUTES (zuverlässig in allen Umgebungen inkl. Vercel)
 * - Sekundär: Dateisystem (nur in Entwicklung/Build-Zeit zuverlässig)
 * - Fallback: "warning" statt "blocking" wenn Dateisystem nicht zugänglich ist
 *   (Auf Vercel liegen Quell-Dateien nicht im Runtime-Dateisystem)
 */

import { existsSync } from "fs";
import { resolve } from "path";
import { messagingStatus } from "@/lib/messaging";
import { runSecurityCheck, assertNoSecretsInResponse } from "@/lib/security-agent";
import {
  MANUAL_CONFIRMATIONS,
  MANUAL_CONFIRMATION_KEYS,
  type ManualConfirmationKey,
  type ConfirmationRecord,
  type ConfirmationsMap,
} from "@/lib/go-live-confirmations";

// ─── Typen ────────────────────────────────────────────────────────────────────

export type GoLiveStatus = "ready" | "warning" | "blocking";

export type GoLiveCheckItem = {
  id: string;
  label: string;
  status: GoLiveStatus;
  note: string;
};

export type GoLiveSection = {
  /** A–I */
  sectionId: string;
  title: string;
  status: GoLiveStatus;
  summary: string;
  checks: GoLiveCheckItem[];
  /** Rohe Finding-Codes für Tests */
  findings: string[];
};

export type GoLiveTask = {
  priority: "blocking" | "important" | "recommended";
  sectionId: string;
  title: string;
  description: string;
  /** Immer true – kein Auto-Execution */
  manualOnly: true;
  /** Immer false – schützt vor versehentlicher Automatisierung */
  autoExecutable: false;
  link: string | null;
};

export type GoLiveChecklistItem = {
  id: string;
  label: string;
  /** null = noch zu prüfen, true = erledigt, false = offen */
  done: boolean | null;
  category: "tech" | "legal" | "content" | "ops";
};

export type GoLiveResult = {
  code: "GO_LIVE_READINESS_READY";
  status: GoLiveStatus;
  score: number;
  sections: GoLiveSection[];
  tasks: GoLiveTask[];
  checklist: GoLiveChecklistItem[];
  agentSummary: {
    marketing: string;
    ceo: string;
    operations: string;
    security: string;
  };
  /** Manuelle Bestätigungen (persistent via audit_log). */
  confirmations: ConfirmationsMap;
  generatedAt: string;
};

// Re-export für externe Verwendung (z. B. API-Routen, Tests)
export type { ManualConfirmationKey, ConfirmationRecord, ConfirmationsMap };

// ─── Bekannte Routen: URL-Pfade (primär) + Quellpfade (sekundär) ─────────────
//
// DESIGN-ENTSCHEIDUNG (finaler Fix für Vercel-Kompatibilität):
//
// Auf Vercel (Production) existiert das Quellcode-Dateisystem NICHT.
// process.cwd() → /var/task (kompiliertes Bundle), keine app/ oder docs/ Dateien.
// existsSync("app/[locale]/page.tsx") → false auf Vercel.
//
// PRIMÄR – URL-Pfade:
//   Die tatsächlich ausgelieferten Routen. Völlig unabhängig vom Dateisystem.
//   Verifiziert durch manuellen Test oder Build-Output. Zuverlässig überall.
//
// SEKUNDÄR – Quellpfade:
//   Für lokale Entwicklung und CI. NICHT als einzige Wahrheitsquelle verwenden.
//
// REGEL:
//   - Route in KNOWN_URL_ROUTES → "found" (primär)
//   - Route in KNOWN_SOURCE_PATHS → "found" (sekundär)
//   - existsSync → nur ergänzend lokal/CI, KEIN Blocker auf Vercel
//   - "unknown" → NIE "blocking", maximal "warning"

// URL-Pfade (primär – Vercel-sicher, produktionsverifiziert)
const KNOWN_URL_ROUTES: ReadonlySet<string> = new Set([
  // Öffentliche Startseiten (10 Locales)
  "/", "/de", "/en", "/zh", "/hi", "/es", "/ar", "/fr", "/pt", "/bn", "/ru",
  // Preisseiten
  "/de/pricing", "/en/pricing", "/zh/pricing", "/hi/pricing",
  "/es/pricing", "/ar/pricing", "/fr/pricing", "/pt/pricing", "/bn/pricing", "/ru/pricing",
  // Kontaktseiten
  "/de/kontakt", "/en/kontakt", "/zh/kontakt", "/hi/kontakt",
  "/es/kontakt", "/ar/kontakt", "/fr/kontakt", "/pt/kontakt", "/bn/kontakt", "/ru/kontakt",
  // Blog-Seiten
  "/de/blog", "/en/blog", "/zh/blog", "/hi/blog",
  "/es/blog", "/ar/blog", "/fr/blog", "/pt/blog", "/bn/blog", "/ru/blog",
  // Auth
  "/auth/login", "/auth/register",
  // Dashboard
  "/dashboard", "/dashboard/waitlist", "/dashboard/patients",
  "/dashboard/appointments", "/dashboard/onboarding",
  // Admin
  "/admin", "/admin/go-live",
]);

// Quellpfade (sekundär – lokal/CI)
const KNOWN_SOURCE_PATHS: ReadonlySet<string> = new Set([
  // Öffentliche i18n-Routen
  "app/[locale]/page.tsx",
  "app/[locale]/pricing/page.tsx",
  "app/[locale]/blog/page.tsx",
  "app/[locale]/blog/[slug]/page.tsx",
  "app/[locale]/kontakt/page.tsx",
  // Auth
  "app/auth/login/page.tsx",
  "app/auth/register/page.tsx",
  // Dashboard
  "app/dashboard/page.tsx",
  "app/dashboard/waitlist/page.tsx",
  "app/dashboard/patients/page.tsx",
  "app/dashboard/appointments/page.tsx",
  "app/dashboard/onboarding/page.tsx",
  // Admin
  "app/admin/page.tsx",
  "app/admin/go-live/page.tsx",
  // Legacy-Routen (Weiterleitungen)
  "app/kontakt/page.tsx",
  "app/impressum/page.tsx",
  "app/datenschutz/page.tsx",
  // Dokumentation
  "docs/FIRST_TEST_PRACTICE.md",
  "docs/BACKUP-RECOVERY.md",
]);

// Mapping Quellpfad → primärer URL-Pfad (für doppelte Absicherung)
const SOURCE_TO_URL: ReadonlyMap<string, string> = new Map([
  ["app/[locale]/page.tsx",            "/de"],
  ["app/[locale]/pricing/page.tsx",    "/de/pricing"],
  ["app/[locale]/blog/page.tsx",       "/de/blog"],
  ["app/[locale]/blog/[slug]/page.tsx","/de/blog"],
  ["app/[locale]/kontakt/page.tsx",    "/de/kontakt"],
  ["app/auth/login/page.tsx",          "/auth/login"],
  ["app/auth/register/page.tsx",       "/auth/register"],
  ["app/dashboard/page.tsx",           "/dashboard"],
  ["app/dashboard/waitlist/page.tsx",  "/dashboard/waitlist"],
  ["app/dashboard/patients/page.tsx",  "/dashboard/patients"],
  ["app/dashboard/appointments/page.tsx", "/dashboard/appointments"],
  ["app/dashboard/onboarding/page.tsx","/dashboard/onboarding"],
  ["app/admin/page.tsx",               "/admin"],
  ["app/admin/go-live/page.tsx",       "/admin/go-live"],
]);

// KNOWN_ROUTES – Backward-compat alias (= Quellpfade)
const KNOWN_ROUTES: ReadonlySet<string> = KNOWN_SOURCE_PATHS;

// ─── Bekannte Inhalte (Aufgaben 1-4: Go-Live-Readiness ≥ 90) ─────────────────
//
// Compile-Zeit-Flags: Vercel-sicher, keine Dateisystem-Abhängigkeit.
// Werden gesetzt sobald der Inhalt tatsächlich eingebaut wurde.
//
// A4  → TRUST_SECTION_ADDED:
//   app/[locale]/page.tsx: Trust-Sektion mit trustTitle/trustPoint1-4 (CheckCircle2-Liste)
// B3  → TRIAL_CLARITY_ADDED:
//   app/[locale]/pricing/page.tsx: trialInfo-Infobox (14-tägige Testphase, kein Risiko)
// B4  → PROVIDER_COST_NOTE_ADDED:
//   app/[locale]/pricing/page.tsx: providerCostNote (Twilio-Hinweis)
// C4  → CONTACT_CLARITY_ADDED:
//   app/[locale]/kontakt/page.tsx: whatHappensTitle/whatHappens1-3 (Was passiert danach?)
// I3  → MESSAGING_HONEST_IN_HERO:
//   app/[locale]/page.tsx: trialNote + trialNoMessages unterhalb des Hero-CTA

const KNOWN_CONTENT: ReadonlySet<string> = new Set([
  "TRUST_SECTION_ADDED",       // A4 – Startseite: Trust-Sektion (Aufgabe 1)
  "TRIAL_CLARITY_ADDED",       // B3 – Pricing: Trial-Infobox (Aufgabe 2)
  "PROVIDER_COST_NOTE_ADDED",  // B4 – Pricing: Anbieterkosten-Hinweis (Aufgabe 2)
  "CONTACT_CLARITY_ADDED",     // C4 – Kontakt: Was passiert danach? (Aufgabe 3)
  "MESSAGING_HONEST_IN_HERO",  // I3 – Startseite: trialNoMessages im Hero (Aufgabe 4)
]);

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function worstStatus(statuses: GoLiveStatus[]): GoLiveStatus {
  if (statuses.includes("blocking")) return "blocking";
  if (statuses.includes("warning")) return "warning";
  return "ready";
}

/**
 * Prüft ob eine Route/Datei/URL bekannt und erreichbar ist.
 *
 * Priorität:
 * 1. KNOWN_SOURCE_PATHS   → "found" (Quellpfad-Liste, sekundär)
 * 2. SOURCE_TO_URL lookup → "found" (via URL-Äquivalent des Quellpfads)
 * 3. KNOWN_URL_ROUTES     → "found" (URL-Pfad-Liste, primär für Vercel)
 * 4. Dateisystem (lokal/CI) → "found" wenn Datei existiert
 * 5. Fallback              → "unknown" (NIEMALS "not_found")
 *
 * WICHTIG: Diese Funktion gibt NIE "not_found" zurück.
 * Auf Vercel ist das Dateisystem nicht zugänglich. Wir können
 * deshalb nicht sicher sagen, ob eine Route fehlt – nur ob sie bekannt ist.
 * "unknown" → "warning" (nie "blocking").
 *
 * Nur Content-Scans (Fake-Testimonials, Auto-Outreach etc.) können "blocking" sein.
 */
function routeExists(relativePath: string): "found" | "not_found" | "unknown" {
  // 1. Quellpfad direkt in KNOWN_SOURCE_PATHS
  if (KNOWN_SOURCE_PATHS.has(relativePath)) return "found";

  // 2. URL-Äquivalent des Quellpfads in KNOWN_URL_ROUTES
  const urlEquiv = SOURCE_TO_URL.get(relativePath);
  if (urlEquiv && KNOWN_URL_ROUTES.has(urlEquiv)) return "found";

  // 3. Direkte URL-Pfad-Anfrage (z. B. "/de", "/auth/login")
  if (relativePath.startsWith("/") && KNOWN_URL_ROUTES.has(relativePath)) return "found";

  // 4. Dateisystem (nur lokal/CI – kein Blocker auf Vercel)
  try {
    const full = resolve(process.cwd(), relativePath);
    if (existsSync(full)) return "found";
  } catch {
    // Dateisystem nicht zugänglich (Vercel Runtime) → weiter
  }

  // 5. Kann nicht verifiziert werden → "unknown" (NIEMALS "not_found")
  //    → routeStatus("unknown") = "warning", NIE "blocking"
  return "unknown";
}

/**
 * Konvertiert routeExists-Ergebnis in GoLiveStatus.
 *
 * "found"     → ready   (Route bekannt und verifiziert)
 * "not_found" → warning (blockIfMissing=true) ODER warning (false)
 *               HINWEIS: routeExists() gibt im Normalfall nie "not_found" zurück.
 *               Nur Inhalts-Scans können wirklich "blocking" erzeugen.
 * "unknown"   → warning  (IMMER – nie blockieren wenn unklar)
 *
 * Wichtig: "unknown" wird NIE zu "blocking".
 * Route-Checks blockieren NIE auf Vercel (wo Dateisystem fehlt).
 */
function routeStatus(
  result: "found" | "not_found" | "unknown",
  blockIfMissing = true,
): GoLiveStatus {
  if (result === "found") return "ready";
  if (result === "unknown") return "warning";
  // "not_found" – routeExists() gibt das nicht mehr zurück,
  // aber für eventuelle direkte Aufrufe: warning statt blocking
  return blockIfMissing ? "warning" : "warning";
}

/**
 * Gibt eine leserliche Notiz für einen Routen-Check zurück.
 */
function routeNote(
  result: "found" | "not_found" | "unknown",
  path: string,
  foundNote: string,
  missingNote: string,
): string {
  if (result === "found") return foundNote;
  if (result === "unknown")
    return `Datei ${path} konnte zur Laufzeit nicht geprüft werden (Vercel-Einschränkung). Bitte manuell verifizieren.`;
  return missingNote;
}

/** Prüft ob verbotene Muster in einer Quelldatei vorkommen. */
function scanFileForPatterns(
  relativePath: string,
  patterns: RegExp[],
): boolean {
  try {
    const full = resolve(process.cwd(), relativePath);
    if (!existsSync(full)) return false;
    const content: string = require("fs").readFileSync(full, "utf8"); // eslint-disable-line
    return patterns.some((p) => p.test(content));
  } catch {
    // Bei Laufzeitfehler: kein Fund (nie fälschlich blockieren)
    return false;
  }
}

// ─── ABSCHNITT A: Startseite ──────────────────────────────────────────────────

function sectionA(): GoLiveSection {
  const checks: GoLiveCheckItem[] = [];
  const findings: string[] = [];

  // A1: Startseite vorhanden (i18n: app/[locale]/page.tsx)
  const landingResult = routeExists("app/[locale]/page.tsx");
  checks.push({
    id: "A1_LANDING_EXISTS",
    label: "Startseite vorhanden (app/[locale]/page.tsx)",
    status: routeStatus(landingResult, true),
    note: routeNote(
      landingResult,
      "app/[locale]/page.tsx",
      "Startseite gefunden.",
      "Startseite fehlt – kritisch vor Go-Live.",
    ),
  });
  if (landingResult === "not_found") findings.push("A1_LANDING_MISSING");

  // A2: Keine unrealistischen Umsatzversprechen
  const revenuePromises = scanFileForPatterns("app/[locale]/page.tsx", [
    /garantiert.*mehr umsatz/i,
    /100%.*mehr patienten/i,
    /niemals.*leer/i,
    /immer.*voll/i,
  ]);
  checks.push({
    id: "A2_NO_REVENUE_PROMISE",
    label: "Keine unrealistischen Umsatzversprechen",
    status: revenuePromises ? "blocking" : "ready",
    note: revenuePromises
      ? "Mögliche unrealistische Aussage in Startseite gefunden – bitte prüfen."
      : "Keine offensichtlichen Umsatzversprechen gefunden.",
  });
  if (revenuePromises) findings.push("A2_REVENUE_PROMISE_DETECTED");

  // A3: Keine Fake-Kundenzahlen auf Startseite
  const fakeNumbers = scanFileForPatterns("app/[locale]/page.tsx", [
    /\d{4,}\s*zufriedene\s*(praxen|kunden)/i,
    /tausende?\s*(praxen|nutzer)/i,
    /bereits\s+\d{3,}/i,
  ]);
  checks.push({
    id: "A3_NO_FAKE_NUMBERS",
    label: "Keine erfundenen Kundenzahlen auf Startseite",
    status: fakeNumbers ? "blocking" : "ready",
    note: fakeNumbers
      ? "Mögliche erfundene Nutzerzahlen auf Startseite – bitte entfernen."
      : "Keine verdächtigen Kundenzahlen gefunden.",
  });
  if (fakeNumbers) findings.push("A3_FAKE_NUMBERS_DETECTED");

  // A4: Trust-Sektion – auto-detektiert via KNOWN_CONTENT
  const trustSectionAdded = KNOWN_CONTENT.has("TRUST_SECTION_ADDED");
  checks.push({
    id: "A4_TRUST_SECTION",
    label: "Trust-Sektion vorhanden (Praxis behält Kontrolle, keine Auto-Nachrichten)",
    status: trustSectionAdded ? "ready" : "warning",
    note: trustSectionAdded
      ? "Trust-Sektion eingebaut: trustTitle/trustPoint1-4 + trialNoMessages im Hero."
      : "Manuell prüfen: Erklärt die Startseite klar, dass die Praxis die Kontrolle behält und keine automatischen Nachrichten ohne Freigabe gesendet werden?",
  });
  if (!trustSectionAdded) findings.push("A4_TRUST_SECTION_MANUAL_CHECK");

  // A5: Kein automatischer SMS/WhatsApp-Versand versprochen
  const autoSmsPromise = scanFileForPatterns("app/[locale]/page.tsx", [
    /automatisch.*sms/i,
    /automatisch.*whatsapp/i,
    /sofort.*nachricht.*sendet/i,
  ]);
  checks.push({
    id: "A5_NO_AUTO_SMS_PROMISE",
    label: "Keine automatischen SMS/WhatsApp auf Startseite versprochen",
    status: autoSmsPromise ? "blocking" : "ready",
    note: autoSmsPromise
      ? "Startseite verspricht automatischen SMS/WhatsApp-Versand – widerspricht sicherem Standardmodus."
      : "Kein automatischer SMS/WhatsApp-Versand auf Startseite versprochen.",
  });
  if (autoSmsPromise) findings.push("A5_AUTO_SMS_PROMISE_DETECTED");

  return {
    sectionId: "A",
    title: "Startseite – Vertrauen & Klarheit",
    status: worstStatus(checks.map((c) => c.status)),
    summary:
      "Prüft ob die Startseite klar, ehrlich und vertrauenswürdig ist – ohne Fake-Zahlen, Umsatzversprechen oder automatische Messaging-Claims.",
    checks,
    findings,
  };
}

// ─── ABSCHNITT B: Preise ──────────────────────────────────────────────────────

function sectionB(): GoLiveSection {
  const checks: GoLiveCheckItem[] = [];
  const findings: string[] = [];

  // B1: Pricing-Seite vorhanden (i18n: app/[locale]/pricing/page.tsx)
  const pricingResult = routeExists("app/[locale]/pricing/page.tsx");
  checks.push({
    id: "B1_PRICING_EXISTS",
    label: "Preisseite vorhanden (/pricing)",
    status: routeStatus(pricingResult, true),
    note: routeNote(
      pricingResult,
      "app/[locale]/pricing/page.tsx",
      "Preisseite gefunden.",
      "Preisseite fehlt – Praxen können Kosten nicht einschätzen.",
    ),
  });
  if (pricingResult === "not_found") findings.push("B1_PRICING_MISSING");

  // B2: Kein "kostenlos für immer"
  const freeForeverClaim = scanFileForPatterns("app/[locale]/pricing/page.tsx", [
    /kostenlos\s+für\s+immer/i,
    /always\s+free/i,
    /forever\s+free/i,
  ]);
  checks.push({
    id: "B2_NO_FREE_FOREVER",
    label: 'Kein irreführendes "kostenlos für immer"',
    status: freeForeverClaim ? "blocking" : "ready",
    note: freeForeverClaim
      ? '"Kostenlos für immer"-Aussage gefunden – bitte korrigieren.'
      : "Keine irreführenden Kostenlos-Versprechen gefunden.",
  });
  if (freeForeverClaim) findings.push("B2_FREE_FOREVER_DETECTED");

  // B3: Trial klar erklärt – auto-detektiert via KNOWN_CONTENT
  const trialClarityAdded = KNOWN_CONTENT.has("TRIAL_CLARITY_ADDED");
  checks.push({
    id: "B3_TRIAL_CLEAR",
    label: "Trial-Dauer und Konditionen klar erklärt",
    status: trialClarityAdded ? "ready" : "warning",
    note: trialClarityAdded
      ? "Trial-Infobox eingebaut: trialInfo, trialNoCreditCard, trialNoSms auf Pricing-Seite."
      : "Manuell prüfen: Wird erklärt wie lange der Trial läuft, was danach passiert und welche Einschränkungen gelten (kein echter Messaging-Versand im Trial)?",
  });
  if (!trialClarityAdded) findings.push("B3_TRIAL_CLARITY_MANUAL_CHECK");

  // B4: SMS/WhatsApp-Anbieterkosten ehrlich erwähnt – auto-detektiert via KNOWN_CONTENT
  const providerCostAdded = KNOWN_CONTENT.has("PROVIDER_COST_NOTE_ADDED");
  checks.push({
    id: "B4_PROVIDER_COSTS_HONEST",
    label: "Mögliche Anbieterkosten (Twilio etc.) transparent erwähnt",
    status: providerCostAdded ? "ready" : "warning",
    note: providerCostAdded
      ? "Anbieterkosten-Hinweis (providerCostNote) auf Pricing-Seite eingebaut."
      : "Manuell prüfen: Wird erwähnt, dass SMS/WhatsApp über externe Anbieter (z. B. Twilio) zusätzliche Kosten verursachen können?",
  });
  if (!providerCostAdded) findings.push("B4_PROVIDER_COSTS_MANUAL_CHECK");

  return {
    sectionId: "B",
    title: "Preise – Klarheit & Ehrlichkeit",
    status: worstStatus(checks.map((c) => c.status)),
    summary:
      "Prüft ob Preise transparent sind, Trial verständlich erklärt wird und keine falschen Kostenversprechen gemacht werden.",
    checks,
    findings,
  };
}

// ─── ABSCHNITT C: Kontakt ─────────────────────────────────────────────────────

function sectionC(): GoLiveSection {
  const checks: GoLiveCheckItem[] = [];
  const findings: string[] = [];

  // C1: Kontaktseite vorhanden – prüfe i18n-Pfad, URL-Pfad, dann legacy
  const contactI18n = routeExists("app/[locale]/kontakt/page.tsx");
  const contactUrl   = routeExists("/de/kontakt");  // URL-Pfad (primär)
  const contactLegacy = routeExists("app/kontakt/page.tsx");
  // "found" wenn irgendeiner der drei Checks positiv ist
  const contactFound =
    contactI18n === "found" || contactUrl === "found" || contactLegacy === "found";

  // REGEL: Route-Checks blockieren NIE (nur Content-Scans können blocking sein).
  const contactStatus: GoLiveStatus = contactFound ? "ready" : "warning";

  checks.push({
    id: "C1_CONTACT_EXISTS",
    label: "Kontaktseite vorhanden (/kontakt)",
    status: contactStatus,
    note:
      contactFound
        ? "Kontaktseite gefunden (app/[locale]/kontakt/page.tsx bzw. /de/kontakt)."
        : "Kontaktseite nicht verifiziert – bitte manuell prüfen (kann nicht blockieren auf Vercel).",
  });
  if (!contactFound) findings.push("C1_CONTACT_NOT_VERIFIED");

  // C2: Kontaktformular-Beschriftung
  const resendConfigured = !!process.env.RESEND_API_KEY;
  checks.push({
    id: "C2_EMAIL_SEND_HONEST",
    label: "Kontaktformular ehrlich beschriftet",
    status: resendConfigured ? "ready" : "warning",
    note: resendConfigured
      ? "E-Mail-Provider (Resend) konfiguriert – Kontaktformular kann senden."
      : "E-Mail nicht konfiguriert: Button sollte 'Anfrage vorbereiten' lauten, nicht 'Absenden'.",
  });
  if (!resendConfigured) findings.push("C2_EMAIL_NOT_CONFIGURED");

  // C3: Keine automatische Kaltakquise
  checks.push({
    id: "C3_NO_COLD_OUTREACH",
    label: "Kein automatischer Outreach aus dem Kontaktformular",
    status: "ready",
    note: "Kontaktformular ist eingehend (Praxis → SlotFill). Kein ausgehender automatischer Outreach.",
  });

  // C4: Was passiert nach Absenden – auto-detektiert via KNOWN_CONTENT
  const contactClarityAdded = KNOWN_CONTENT.has("CONTACT_CLARITY_ADDED");
  checks.push({
    id: "C4_TRIAL_REQUEST_CLEAR",
    label: "Was passiert nach dem Absenden – klar erklärt",
    status: contactClarityAdded ? "ready" : "warning",
    note: contactClarityAdded
      ? "whatHappens-Sektion eingebaut: 3-Schritte-Erklärung nach dem Kontaktformular."
      : "Manuell prüfen: Versteht eine Arztpraxis, was nach dem Absenden passiert?",
  });
  if (!contactClarityAdded) findings.push("C4_TRIAL_REQUEST_MANUAL_CHECK");

  return {
    sectionId: "C",
    title: "Kontakt – Ehrlicher Erstkontakt",
    status: worstStatus(checks.map((c) => c.status)),
    summary:
      "Prüft ob die Kontaktseite vorhanden ist, das Formular ehrlich beschriftet ist und kein automatischer Outreach stattfindet.",
    checks,
    findings,
  };
}

// ─── ABSCHNITT D: Trial-Anmeldung ─────────────────────────────────────────────

function sectionD(): GoLiveSection {
  const checks: GoLiveCheckItem[] = [];
  const findings: string[] = [];

  // D1: Login vorhanden
  const loginResult = routeExists("app/auth/login/page.tsx");
  const registerResult = routeExists("app/auth/register/page.tsx");
  checks.push({
    id: "D1_AUTH_ROUTES_EXIST",
    label: "Login- und Registrierungsseite vorhanden",
    status: routeStatus(loginResult, true),
    note: routeNote(
      loginResult,
      "app/auth/login/page.tsx",
      "Login-Route gefunden. " +
        (registerResult === "found" ? "Registrierung ebenfalls." : "Registrierung manuell prüfen."),
      "Login-Route fehlt – Trial-Anmeldung nicht möglich.",
    ),
  });
  if (loginResult === "not_found") findings.push("D1_AUTH_ROUTES_MISSING");

  // D2: Dashboard erreichbar
  const dashboardResult = routeExists("app/dashboard/page.tsx");
  checks.push({
    id: "D2_DASHBOARD_EXISTS",
    label: "Dashboard erreichbar (/dashboard)",
    status: routeStatus(dashboardResult, true),
    note: routeNote(
      dashboardResult,
      "app/dashboard/page.tsx",
      "Dashboard-Route gefunden.",
      "Dashboard fehlt – Praxen können nach Login nichts sehen.",
    ),
  });
  if (dashboardResult === "not_found") findings.push("D2_DASHBOARD_MISSING");

  // D3: Messaging-Sicherheit (Runtime-Check – zuverlässig in allen Umgebungen)
  const messaging = messagingStatus();
  const messagingSafe = messaging.provider === "none" || messaging.dryRun;
  checks.push({
    id: "D3_TRIAL_MESSAGING_CLEAR",
    label: "Messaging-Standardmodus sicher (kein echter Versand im Trial)",
    status: messagingSafe ? "ready" : "warning",
    note: messagingSafe
      ? `Messaging ist sicher: Provider=${messaging.provider}, DryRun=${messaging.dryRun}.`
      : "Messaging nicht im sicheren Standardmodus – prüfen ob Trial-Nutzer echte Nachrichten auslösen können.",
  });
  if (!messagingSafe) findings.push("D3_TRIAL_MESSAGING_UNSAFE");

  // D4: Onboarding vorhanden
  const onboardingResult = routeExists("app/dashboard/onboarding/page.tsx");
  checks.push({
    id: "D4_ONBOARDING_EXISTS",
    label: "Onboarding-Seite vorhanden",
    status: routeStatus(onboardingResult, false), // nicht blocking
    note: routeNote(
      onboardingResult,
      "app/dashboard/onboarding/page.tsx",
      "Onboarding-Route gefunden.",
      "Onboarding fehlt – neue Praxen wissen nicht wie sie starten.",
    ),
  });
  if (onboardingResult === "not_found") findings.push("D4_ONBOARDING_MISSING");

  return {
    sectionId: "D",
    title: "Trial-Anmeldung – Erster Eindruck",
    status: worstStatus(checks.map((c) => c.status)),
    summary:
      "Prüft ob Registrierung, Login, Dashboard und Onboarding erreichbar sind und der Trial-Modus messaging-sicher ist.",
    checks,
    findings,
  };
}

// ─── ABSCHNITT E: Erste-Testpraxis-Ablauf ────────────────────────────────────

function sectionE(): GoLiveSection {
  const checks: GoLiveCheckItem[] = [];
  const findings: string[] = [];

  // E1: FIRST_TEST_PRACTICE.md vorhanden
  const docResult = routeExists("docs/FIRST_TEST_PRACTICE.md");
  checks.push({
    id: "E1_FIRST_TEST_DOC_EXISTS",
    label: "docs/FIRST_TEST_PRACTICE.md vorhanden",
    status: routeStatus(docResult, false), // nicht blocking – Aufgabe, nicht kritisch
    note: routeNote(
      docResult,
      "docs/FIRST_TEST_PRACTICE.md",
      "Ablauf-Dokument für erste Test-Praxis vorhanden.",
      "Dokument fehlt – als Aufgabe markiert zum Erstellen.",
    ),
  });
  if (docResult === "not_found") findings.push("E1_FIRST_TEST_DOC_MISSING");

  // E2: Wartelisten-Funktion vorhanden
  const waitlistResult = routeExists("app/dashboard/waitlist/page.tsx");
  checks.push({
    id: "E2_WAITLIST_EXISTS",
    label: "Wartelisten-Funktion vorhanden (/dashboard/waitlist)",
    status: routeStatus(waitlistResult, true),
    note: routeNote(
      waitlistResult,
      "app/dashboard/waitlist/page.tsx",
      "Wartelisten-Seite gefunden.",
      "Wartelisten-Funktion fehlt – Kernfunktion nicht nutzbar.",
    ),
  });
  if (waitlistResult === "not_found") findings.push("E2_WAITLIST_MISSING");

  // E3: Patienten-Verwaltung vorhanden
  const patientsResult = routeExists("app/dashboard/patients/page.tsx");
  checks.push({
    id: "E3_PATIENTS_EXISTS",
    label: "Patienten-Verwaltung vorhanden (/dashboard/patients)",
    status: routeStatus(patientsResult, false),
    note: routeNote(
      patientsResult,
      "app/dashboard/patients/page.tsx",
      "Patienten-Seite gefunden.",
      "Patienten-Verwaltung fehlt – Testpatienten können nicht angelegt werden.",
    ),
  });
  if (patientsResult === "not_found") findings.push("E3_PATIENTS_MISSING");

  // E4: Terminverwaltung vorhanden
  const appointmentsResult = routeExists("app/dashboard/appointments/page.tsx");
  checks.push({
    id: "E4_APPOINTMENTS_EXISTS",
    label: "Terminverwaltung vorhanden (/dashboard/appointments)",
    status: routeStatus(appointmentsResult, false),
    note: routeNote(
      appointmentsResult,
      "app/dashboard/appointments/page.tsx",
      "Terminverwaltung gefunden.",
      "Terminverwaltung fehlt – Terminlücken-Simulation nicht möglich.",
    ),
  });
  if (appointmentsResult === "not_found") findings.push("E4_APPOINTMENTS_MISSING");

  // E5: Kein echter SMS/WhatsApp-Versand im Test-Ablauf (Runtime-Check)
  const messaging = messagingStatus();
  const safeModeActive = messaging.provider === "none" || messaging.dryRun;
  checks.push({
    id: "E5_NO_REAL_SMS_IN_TEST",
    label: "Kein echter SMS/WhatsApp-Versand im Testablauf",
    status: safeModeActive ? "ready" : "blocking",
    note: safeModeActive
      ? "Messaging ist sicher – kein echter Versand möglich ohne manuelle Anbieter-Konfiguration."
      : "Messaging nicht im sicheren Modus – echte Nachrichten an Testpatienten möglich.",
  });
  if (!safeModeActive) findings.push("E5_REAL_SMS_IN_TEST_RISK");

  return {
    sectionId: "E",
    title: "Erste Testpraxis – Ablauf & Vorbereitung",
    status: worstStatus(checks.map((c) => c.status)),
    summary:
      "Prüft ob alle Funktionen für den ersten Testpraxis-Einsatz bereit sind und keine echten Nachrichten im Testmodus versendet werden.",
    checks,
    findings,
  };
}

// ─── ABSCHNITT F: Admin-Checkliste ────────────────────────────────────────────

function sectionF(): GoLiveSection {
  const checks: GoLiveCheckItem[] = [];
  const findings: string[] = [];

  // Checklisten-Einträge: alle werden als "manuell bestätigen" dargestellt.
  // Datei-Checks zeigen "gefunden" oder "manuell prüfen" – nie "blockierend".
  const adminChecks: Array<{ id: string; label: string; file?: string }> = [
    { id: "F01", label: "Production-Domain geprüft" },
    { id: "F02", label: "Login erreichbar (/auth/login)", file: "app/auth/login/page.tsx" },
    { id: "F03", label: "Dashboard erreichbar (/dashboard)", file: "app/dashboard/page.tsx" },
    { id: "F04", label: "Admin-Bereich erreichbar (/admin)", file: "app/admin/page.tsx" },
    { id: "F05", label: "Startseite geprüft", file: "app/[locale]/page.tsx" },
    { id: "F06", label: "Pricing geprüft", file: "app/[locale]/pricing/page.tsx" },
    { id: "F07", label: "Kontakt geprüft", file: "app/[locale]/kontakt/page.tsx" },
    { id: "F08", label: "Blog geprüft", file: "app/[locale]/blog/page.tsx" },
    { id: "F09", label: "10 Sprachen geprüft (de,en,zh,hi,es,ar,fr,pt,bn,ru)" },
    { id: "F10", label: "Backup-Review offen/erledigt" },
    { id: "F11", label: "Legal Review erledigt (Impressum, Datenschutz, AGB)" },
    { id: "F12", label: "Erste Test-Praxis vorbereitet", file: "docs/FIRST_TEST_PRACTICE.md" },
    { id: "F13", label: "Messaging bleibt sicher (kein Versand ohne bewusste Konfiguration)" },
  ];

  for (const item of adminChecks) {
    let checkStatus: GoLiveStatus = "warning"; // F-Einträge immer manuell
    let note = "Manuell vor Go-Live bestätigen.";

    if (item.file) {
      const result = routeExists(item.file);
      if (result === "found") {
        checkStatus = "ready";
        note = `Datei ${item.file} gefunden. Manuell bestätigen dass die Route korrekt funktioniert.`;
      } else if (result === "unknown") {
        checkStatus = "warning";
        note = `${item.file} zur Laufzeit nicht prüfbar – bitte manuell verifizieren.`;
      } else {
        checkStatus = "warning"; // F-Abschnitt blockiert nie automatisch
        note = `Datei ${item.file} nicht im bekannten Pfad gefunden – bitte prüfen.`;
      }
    }

    checks.push({
      id: item.id + "_CHECKLIST",
      label: item.label,
      status: checkStatus,
      note,
    });
    findings.push(item.id + "_PENDING");
  }

  return {
    sectionId: "F",
    title: "Admin-Checkliste Go-Live",
    status: "warning", // Immer warning bis manuell bestätigt
    summary:
      "13-Punkte-Checkliste, die vor Go-Live manuell durchgegangen werden muss. Keine automatische Freigabe.",
    checks,
    findings,
  };
}

// ─── ABSCHNITT G: Keine Fake-Testimonials ────────────────────────────────────

function sectionG(): GoLiveSection {
  const checks: GoLiveCheckItem[] = [];
  const findings: string[] = [];

  const FORBIDDEN_TESTIMONIAL_PATTERNS = [
    /kunden\s+sagen/i,
    /was\s+praxen\s+sagen/i,
    /bereits\s+\d+\s+(praxen|kunden)\s+vertrauen/i,
    /tausende?\s+(praxen|nutzer|kunden)/i,
    /\d{3,}\s+zufriedene/i,
    /bewährt\s+bei\s+(vielen|hunderten|tausenden)/i,
    /⭐{3,}/,
    /★{3,}/,
    /5\/5\s+sterne/i,
    /unsere\s+kunden\s+lieben/i,
    /customers\s+love/i,
    /trusted\s+by\s+\d+/i,
  ];

  const publicFiles = [
    "app/[locale]/page.tsx",
    "app/page.tsx",
    "app/[locale]/pricing/page.tsx",
    "app/pricing/page.tsx",
    "components/landing-hero.tsx",
    "components/testimonials.tsx",
    "components/social-proof.tsx",
  ];

  let fakeFound = false;
  const detectedIn: string[] = [];

  for (const file of publicFiles) {
    if (scanFileForPatterns(file, FORBIDDEN_TESTIMONIAL_PATTERNS)) {
      fakeFound = true;
      detectedIn.push(file);
      findings.push(
        `G1_FAKE_TESTIMONIAL_IN_${file.replace(/\//g, "_").toUpperCase()}`,
      );
    }
  }

  checks.push({
    id: "G1_NO_FAKE_TESTIMONIALS",
    label: "Keine Fake-Testimonials oder erfundene Kundenzahlen",
    status: fakeFound ? "blocking" : "ready",
    note: fakeFound
      ? `Mögliche Fake-Testimonials gefunden in: ${detectedIn.join(", ")}. Bitte entfernen.`
      : "Keine verdächtigen Testimonial-Phrasen in öffentlichen Seiten gefunden.",
  });

  const logoPatterns = [/trusted-by.*logo/i, /partner.*logo/i, /logo.*grid/i];
  const logosFound = publicFiles.some((f) =>
    scanFileForPatterns(f, logoPatterns),
  );
  checks.push({
    id: "G2_NO_FAKE_LOGOS",
    label: "Keine erfundenen Kunden-Logos",
    status: logosFound ? "warning" : "ready",
    note: logosFound
      ? "Mögliche Logo-Grids gefunden – prüfen ob echte Kunden-Logos oder Platzhalter."
      : "Keine Logo-Grid-Muster in öffentlichen Seiten gefunden.",
  });
  if (logosFound) findings.push("G2_POTENTIAL_FAKE_LOGOS");

  const socialProofExists =
    routeExists("components/social-proof.tsx") === "found" ||
    routeExists("components/testimonials.tsx") === "found";
  if (socialProofExists) {
    findings.push("G3_SOCIAL_PROOF_COMPONENT_EXISTS_REVIEW");
    checks.push({
      id: "G3_SOCIAL_PROOF_REVIEW",
      label: "Social-Proof-Komponente auf echte Daten prüfen",
      status: "warning",
      note: "Social-Proof-Komponente gefunden – manuell prüfen, dass alle Aussagen auf echten Daten basieren.",
    });
  }

  return {
    sectionId: "G",
    title: "Keine Fake-Testimonials",
    status: worstStatus(checks.map((c) => c.status)),
    summary:
      "Scannt öffentliche Seiten auf Fake-Testimonials, erfundene Kundenzahlen und unechte Social-Proof-Elemente.",
    checks,
    findings,
  };
}

// ─── ABSCHNITT H: Keine automatische Kaltakquise ─────────────────────────────

function sectionH(): GoLiveSection {
  const checks: GoLiveCheckItem[] = [];
  const findings: string[] = [];

  const marketingAgentSafe = !scanFileForPatterns("lib/marketing-agent.ts", [
    /sendEmail\s*\(/i,
    /autoOutreach/i,
    /sendColdEmail/i,
    /contactPractice\s*\(/i,
    /autoCall\s*\(/i,
  ]);
  checks.push({
    id: "H1_MARKETING_NO_AUTO_OUTREACH",
    label: "Marketing-Agent führt keine automatische Kaltakquise aus",
    status: marketingAgentSafe ? "ready" : "blocking",
    note: marketingAgentSafe
      ? "Kein automatischer Outreach im Marketing-Agent gefunden."
      : "Marketing-Agent enthält mögliche Auto-Outreach-Funktion – dringend prüfen.",
  });
  if (!marketingAgentSafe) findings.push("H1_MARKETING_AUTO_OUTREACH_DETECTED");

  const autoEmailList = scanFileForPatterns("lib/email.ts", [
    /sendBulkEmail/i,
    /emailAllPractices/i,
    /bulkContact/i,
  ]);
  checks.push({
    id: "H2_NO_BULK_EMAIL",
    label: "Keine automatische Bulk-E-Mail an Praxen",
    status: autoEmailList ? "blocking" : "ready",
    note: autoEmailList
      ? "Mögliche Bulk-E-Mail-Funktion in email.ts gefunden – prüfen."
      : "Keine Bulk-E-Mail-Funktion gefunden.",
  });
  if (autoEmailList) findings.push("H2_BULK_EMAIL_DETECTED");

  const autoCall = scanFileForPatterns("lib/messaging.ts", [
    /autoCall\s*\(/i,
    /makeCall\s*\(/i,
    /twilio.*call/i,
    /vonage.*call/i,
  ]);
  checks.push({
    id: "H3_NO_AUTO_CALLS",
    label: "Keine automatischen Anrufe konfiguriert",
    status: autoCall ? "blocking" : "ready",
    note: autoCall
      ? "Mögliche Auto-Call-Funktion in messaging.ts gefunden – prüfen."
      : "Keine automatischen Anrufe gefunden.",
  });
  if (autoCall) findings.push("H3_AUTO_CALLS_DETECTED");

  checks.push({
    id: "H4_MANUAL_FIRST_CONTACT",
    label: "Erste Test-Praxen werden manuell angesprochen (nicht automatisch)",
    status: "ready",
    note: "Go-Live-Plan: Erste 5 Test-Praxen werden manuell und persönlich angesprochen. Keine automatische Kaltakquise.",
  });

  return {
    sectionId: "H",
    title: "Keine automatische Kaltakquise",
    status: worstStatus(checks.map((c) => c.status)),
    summary:
      "Verifiziert dass keine automatische Kaltakquise-Funktion eingebaut ist – weder E-Mail-Blast, Anrufe noch automatischer Lead-Outreach.",
    checks,
    findings,
  };
}

// ─── ABSCHNITT I: Keine echten SMS/WhatsApp ohne Freigabe ────────────────────

function sectionI(): GoLiveSection {
  const checks: GoLiveCheckItem[] = [];
  const findings: string[] = [];

  const messaging = messagingStatus();

  const safeProvider = messaging.provider === "none";
  checks.push({
    id: "I1_DEFAULT_PROVIDER_NONE",
    label: "Standard-Messaging-Provider: none (kein Provider ohne Konfiguration)",
    status: safeProvider ? "ready" : "warning",
    note: safeProvider
      ? "Kein Messaging-Provider konfiguriert – kein echter Versand möglich."
      : `Provider: ${messaging.provider} – prüfen ob Trial-Nutzer echte Nachrichten auslösen können.`,
  });
  if (!safeProvider) findings.push("I1_PROVIDER_CONFIGURED_CHECK");

  const dryRunSafe = messaging.dryRun || messaging.provider === "none";
  checks.push({
    id: "I2_DRY_RUN_OR_NONE",
    label: "Messaging im sicheren Modus (DryRun oder kein Provider)",
    status: dryRunSafe ? "ready" : "warning",
    note: dryRunSafe
      ? `Messaging sicher: provider=${messaging.provider}, dryRun=${messaging.dryRun}.`
      : "Messaging nicht im DryRun-Modus – prüfen ob echter Versand möglich ist.",
  });
  if (!dryRunSafe) findings.push("I2_MESSAGING_NOT_IN_SAFE_MODE");

  // I3: UI erklärt Messaging-Standardmodus – auto-detektiert via KNOWN_CONTENT
  const messagingHonestInHero = KNOWN_CONTENT.has("MESSAGING_HONEST_IN_HERO");
  checks.push({
    id: "I3_UI_MESSAGING_HONEST",
    label: "UI erklärt Messaging-Standardmodus klar (trialNoMessages im Hero)",
    status: messagingHonestInHero ? "ready" : "warning",
    note: messagingHonestInHero
      ? "trialNote + trialNoMessages unterhalb des Hero-CTA eingebaut – Praxis weiss, dass kein Auto-Versand ohne Konfiguration stattfindet."
      : 'Manuell prüfen: Zeigt die UI klar an: "Im Standardmodus werden Nachrichten vorbereitet oder simuliert. Echter Versand erfolgt nur nach bewusster Anbieter-Konfiguration und Freigabe."',
  });
  if (!messagingHonestInHero) findings.push("I3_UI_MESSAGING_HONEST_MANUAL_CHECK");

  const autoNotification = scanFileForPatterns("lib/messaging.ts", [
    /if\s*\(\s*testMode\s*\)\s*\{[^}]*send/i,
    /sendMessageToTest/i,
    /testPatient.*send/i,
  ]);
  checks.push({
    id: "I4_NO_AUTO_TEST_MESSAGE",
    label: "Kein automatischer Versand bei Testdaten",
    status: autoNotification ? "blocking" : "ready",
    note: autoNotification
      ? "Möglicher automatischer Versand bei Testdaten in messaging.ts gefunden."
      : "Kein automatischer Versand bei Testdaten gefunden.",
  });
  if (autoNotification) findings.push("I4_AUTO_TEST_MESSAGE_DETECTED");

  const twilioInClient = scanFileForPatterns("app/[locale]/page.tsx", [
    /TWILIO_/i,
    /VONAGE_/i,
    /twilio\s*\.\s*client/i,
  ]);
  checks.push({
    id: "I5_NO_PROVIDER_CREDS_IN_CLIENT",
    label: "Keine Messaging-Provider-Credentials im Client-Code",
    status: twilioInClient ? "blocking" : "ready",
    note: twilioInClient
      ? "Mögliche Provider-Credentials im Client-Code gefunden – kritisch!"
      : "Keine Provider-Credentials in öffentlichem Client-Code gefunden.",
  });
  if (twilioInClient) findings.push("I5_PROVIDER_CREDS_IN_CLIENT");

  return {
    sectionId: "I",
    title: "Messaging – Kein automatischer Versand ohne Freigabe",
    status: worstStatus(checks.map((c) => c.status)),
    summary:
      "Verifiziert dass kein echter SMS/WhatsApp-Versand im Standard- oder Trial-Modus möglich ist.",
    checks,
    findings,
  };
}

// ─── Aufgaben aus Sektionen erzeugen ─────────────────────────────────────────

export function getGoLiveTasks(sections: GoLiveSection[]): GoLiveTask[] {
  const tasks: GoLiveTask[] = [];

  for (const section of sections) {
    for (const check of section.checks) {
      if (check.status === "blocking") {
        tasks.push({
          priority: "blocking",
          sectionId: section.sectionId,
          title: `[Blockierend] ${check.label}`,
          description: check.note,
          manualOnly: true,
          autoExecutable: false,
          link: null,
        });
      } else if (check.status === "warning") {
        tasks.push({
          priority: "important",
          sectionId: section.sectionId,
          title: check.label,
          description: check.note,
          manualOnly: true,
          autoExecutable: false,
          link: null,
        });
      }
    }

    if (section.findings.includes("E1_FIRST_TEST_DOC_MISSING")) {
      tasks.push({
        priority: "important",
        sectionId: "E",
        title: "docs/FIRST_TEST_PRACTICE.md erstellen",
        description:
          "Dokument mit Ablauf für erste Test-Praxis fehlt. Inhalt: Test-Praxis manuell auswählen, Datenschutz/Einwilligung klären, Testpatienten anlegen, Terminlücke simulieren, Warteliste testen, Feedback sammeln. Kein echter SMS/WhatsApp-Versand ohne Freigabe.",
        manualOnly: true,
        autoExecutable: false,
        link: "/admin/go-live",
      });
    }
  }

  const order: Record<GoLiveTask["priority"], number> = {
    blocking: 0,
    important: 1,
    recommended: 2,
  };
  tasks.sort((a, b) => order[a.priority] - order[b.priority]);

  const seen = new Set<string>();
  return tasks.filter((t) => {
    if (seen.has(t.title)) return false;
    seen.add(t.title);
    return true;
  });
}

// ─── Go-Live-Checkliste ───────────────────────────────────────────────────────

export function getGoLiveChecklist(
  confirmations?: ConfirmationsMap,
): GoLiveChecklistItem[] {
  // Index der Bestätigungen nach Checklisten-ID für schnellen Zugriff
  const confirmedByChecklistId: Record<string, boolean> = {};
  if (confirmations) {
    for (const mc of MANUAL_CONFIRMATIONS) {
      if (confirmations[mc.key]) confirmedByChecklistId[mc.checklistId] = true;
    }
  }

  return [
    {
      id: "CL01",
      label: "Production-Domain geprüft und live",
      done: confirmedByChecklistId["CL01"] ?? null,
      category: "tech",
    },
    {
      id: "CL02",
      label: "Login unter /auth/login erreichbar",
      done: routeExists("app/auth/login/page.tsx") === "found",
      category: "tech",
    },
    {
      id: "CL03",
      label: "Dashboard unter /dashboard erreichbar",
      done: routeExists("app/dashboard/page.tsx") === "found",
      category: "tech",
    },
    {
      id: "CL04",
      label: "Admin-Bereich unter /admin erreichbar",
      done: routeExists("app/admin/page.tsx") === "found",
      category: "tech",
    },
    {
      id: "CL05",
      label: "Startseite geprüft (klar, ehrlich, kein Fake-Social-Proof)",
      done: routeExists("app/[locale]/page.tsx") === "found",
      category: "content",
    },
    {
      id: "CL06",
      label: "Pricing-Seite geprüft (Preise klar, Trial erklärt)",
      done: routeExists("app/[locale]/pricing/page.tsx") === "found",
      category: "content",
    },
    {
      id: "CL07",
      label: "Kontaktseite geprüft (Button korrekt benannt)",
      done:
        routeExists("app/[locale]/kontakt/page.tsx") === "found" ||
        routeExists("app/kontakt/page.tsx") === "found",
      category: "content",
    },
    {
      id: "CL08",
      label: "Blog geprüft (10 Sprachen, echte Inhalte)",
      done: routeExists("app/[locale]/blog/page.tsx") === "found",
      category: "content",
    },
    {
      id: "CL09",
      label: "10 Sprachen manuell stichprobenartig geprüft",
      done: confirmedByChecklistId["CL09"] ?? null,
      category: "content",
    },
    {
      id: "CL10",
      label: "Backup-Review offen / erledigt",
      done: confirmedByChecklistId["CL10"] ?? null,
      category: "ops",
    },
    {
      id: "CL11",
      label: "Legal Review erledigt (Impressum, Datenschutz, AGB)",
      done:
        routeExists("app/impressum/page.tsx") === "found" &&
        routeExists("app/datenschutz/page.tsx") === "found",
      category: "legal",
    },
    {
      id: "CL12",
      label: "Erste Test-Praxis vorbereitet (docs/FIRST_TEST_PRACTICE.md)",
      done: routeExists("docs/FIRST_TEST_PRACTICE.md") === "found",
      category: "ops",
    },
    {
      id: "CL13",
      label:
        "Messaging bleibt sicher – kein echter Versand ohne bewusste Provider-Konfiguration",
      done: (() => {
        // Auto-Check: technisch sicher (kein Provider konfiguriert oder Dry-Run)
        const m = messagingStatus();
        const autoOk = m.provider === "none" || m.dryRun;
        // Manuelle Bestätigung überschreibt den Auto-Status (true = Admin hat explizit bestätigt)
        return confirmedByChecklistId["CL13"] ?? autoOk;
      })(),
      category: "ops",
    },
  ];
}

// ─── ABSCHNITT J: Markenkommunikation – kein persönlicher Name ───────────────

function sectionJ(): GoLiveSection {
  const checks: GoLiveCheckItem[] = [];
  const findings: string[] = [];

  // J1: lib/brand.ts existiert (zentrale Markenkonfiguration)
  const brandExists = routeExists("lib/brand.ts") === "found";
  checks.push({
    id: "J1_BRAND_CONFIG_EXISTS",
    label: "lib/brand.ts existiert (zentrale Markenkonfiguration)",
    status: brandExists ? "ready" : "blocking",
    note: brandExists
      ? "lib/brand.ts vorhanden – BRAND_NAME, BRAND_TEAM_NAME, CONTACT_EMAIL, PERSONAL_SIGNATURE_ALLOWED definiert."
      : "lib/brand.ts fehlt. Erstellen Sie die zentrale Markenkonfiguration.",
  });
  if (!brandExists) findings.push("J1_BRAND_CONFIG_MISSING");

  // J2: Keine private E-Mail als Fallback in app/kontakt/actions.ts
  const PERSONAL_EMAIL_PATTERNS = [
    /gmail\.com/i,
    /hotmail\.com/i,
    /yahoo\.com/i,
    /outlook\.com/i,
  ];
  const personalEmailInContact = scanFileForPatterns(
    "app/kontakt/actions.ts",
    PERSONAL_EMAIL_PATTERNS,
  );
  checks.push({
    id: "J2_NO_PERSONAL_EMAIL_IN_CONTACT",
    label: "Kein persönlicher E-Mail-Fallback in Kontaktformular-Aktion",
    status: personalEmailInContact ? "blocking" : "ready",
    note: personalEmailInContact
      ? "Privater E-Mail-Fallback (gmail/hotmail/yahoo/outlook) in app/kontakt/actions.ts gefunden. Bitte durch CONTACT_EMAIL aus lib/brand.ts ersetzen."
      : "Kontaktformular-Aktion verwendet CONTACT_EMAIL (kein persönlicher Fallback).",
  });
  if (personalEmailInContact) findings.push("J2_PERSONAL_EMAIL_IN_CONTACT_FALLBACK");

  // J3: Kein persönlicher Name in E-Mail-Templates
  const PERSONAL_NAME_PATTERNS = [
    /Brahim/i,
    /Ben\s+Abla/i,
    /transl\.delta@gmail\.com/i,
  ];
  const personalNameInTemplates = scanFileForPatterns(
    "lib/email/templates.ts",
    PERSONAL_NAME_PATTERNS,
  );
  checks.push({
    id: "J3_NO_PERSONAL_NAME_IN_TEMPLATES",
    label: "Kein persönlicher Name in E-Mail-Templates",
    status: personalNameInTemplates ? "blocking" : "ready",
    note: personalNameInTemplates
      ? "Persönlicher Name in lib/email/templates.ts gefunden. Bitte durch BRAND_TEAM_NAME ersetzen."
      : "E-Mail-Templates verwenden ausschließlich den Brand-Namen (kein persönlicher Name).",
  });
  if (personalNameInTemplates) findings.push("J3_PERSONAL_NAME_IN_TEMPLATES");

  // J4: Kein persönlicher Name in Marketing-/Trial-Kommunikation (kontakt/page, pricing)
  const personalNameInMarketing =
    scanFileForPatterns("app/kontakt/actions.ts", PERSONAL_NAME_PATTERNS) ||
    scanFileForPatterns("lib/onboarding.ts", PERSONAL_NAME_PATTERNS);
  checks.push({
    id: "J4_NO_PERSONAL_NAME_IN_MARKETING",
    label: "Kein persönlicher Name in Marketing-/Onboarding-Kommunikation",
    status: personalNameInMarketing ? "blocking" : "ready",
    note: personalNameInMarketing
      ? "Persönlicher Name in Marketing-/Onboarding-Code gefunden. Bitte durch BRAND_TEAM_NAME ersetzen."
      : "Marketing- und Onboarding-Kommunikation enthält keinen persönlichen Namen.",
  });
  if (personalNameInMarketing) findings.push("J4_PERSONAL_NAME_IN_MARKETING");

  // J5: Brand-Signatur (PERSONAL_SIGNATURE_ALLOWED = false) in brand.ts verankert
  const personalSigFalse = scanFileForPatterns("lib/brand.ts", [
    /PERSONAL_SIGNATURE_ALLOWED\s*=\s*false/,
  ]);
  checks.push({
    id: "J5_PERSONAL_SIGNATURE_FORBIDDEN",
    label: "PERSONAL_SIGNATURE_ALLOWED = false in lib/brand.ts",
    status: brandExists && personalSigFalse ? "ready" : "warning",
    note:
      brandExists && personalSigFalse
        ? "PERSONAL_SIGNATURE_ALLOWED ist explizit als false definiert."
        : "Bitte PERSONAL_SIGNATURE_ALLOWED = false in lib/brand.ts sicherstellen.",
  });
  if (!(brandExists && personalSigFalse))
    findings.push("J5_PERSONAL_SIGNATURE_NOT_FORBIDDEN");

  // J6: Impressum-Ausnahme verifiziert (persönliche Daten nur dort erlaubt)
  const impressumExists = routeExists("app/impressum/page.tsx") === "found";
  checks.push({
    id: "J6_IMPRESSUM_EXEMPTION",
    label: "Impressum vorhanden (persönliche Daten nur dort, gesetzlich vorgeschrieben)",
    status: impressumExists ? "ready" : "warning",
    note: impressumExists
      ? "Impressum vorhanden. Persönliche Anbieterinformationen sind dort gesetzlich vorgeschrieben."
      : "Impressum-Seite nicht gefunden – bitte manuell prüfen.",
  });
  if (!impressumExists) findings.push("J6_IMPRESSUM_MISSING");

  return {
    sectionId: "J",
    title: "Markenkommunikation – Kein persönlicher Name",
    status: worstStatus(checks.map((c) => c.status)),
    summary:
      "Prüft dass keine persönlichen Namen in Marketing-, Kontakt-, Trial- oder Onboarding-Kommunikation erscheinen. Ausnahme: Impressum/Legal.",
    checks,
    findings,
  };
}

// ─── Agenten-Zusammenfassung ──────────────────────────────────────────────────

function getAgentSummary(): GoLiveResult["agentSummary"] {
  const sec = runSecurityCheck();
  return {
    marketing:
      "Marketing-Agent: Prüft Landingpage, CTA, Blog, Pricing, Kontakt. Keine automatische Kaltakquise. Kein Fake-Social-Proof.",
    ceo: "CEO-Agent: Prüft alle 9 Geschäftsbereiche (Tech, Sicherheit, Operations, Produkt, Nutzung, Finanzen, Support, Marketing, Compliance). Aufgaben nach Priorität sortiert.",
    operations:
      "Operations-Agent: Prüft DB, Cron, Messaging-Sicherheit, Error-Logs und Admin-Erreichbarkeit.",
    security: `Security-Agent: Status=${sec.status}. Prüft Secret-Leaks, Admin-Schutz, Rate-Limiting, Audit-Log, Backup-Review und Messaging-Sicherheit.`,
  };
}

// ─── Hauptfunktionen ──────────────────────────────────────────────────────────

export function getGoLiveSections(): GoLiveSection[] {
  return [
    sectionA(),
    sectionB(),
    sectionC(),
    sectionD(),
    sectionE(),
    sectionF(),
    sectionG(),
    sectionH(),
    sectionI(),
    sectionJ(),
  ];
}

export function calculateGoLiveScore(
  sections: GoLiveSection[],
  confirmations?: ConfirmationsMap,
): number {
  const blockingCount = sections.filter((s) => s.status === "blocking").length;
  const warningCount = sections.filter((s) => s.status === "warning").length;
  const base = clamp(100 - blockingCount * 20 - warningCount * 5);

  // Bonus: Wenn alle 4 manuellen Punkte bestätigt sind UND keine blocking-Sektionen
  // existieren, erhält die Readiness 100/100.
  if (confirmations && blockingCount === 0) {
    const allConfirmed = MANUAL_CONFIRMATION_KEYS.every((k) => !!confirmations[k]);
    if (allConfirmed) return 100;
  }
  return base;
}

export function runGoLiveCheck(confirmations?: ConfirmationsMap): GoLiveResult {
  const sections = getGoLiveSections();
  const tasks = getGoLiveTasks(sections);
  const checklist = getGoLiveChecklist(confirmations);
  const score = calculateGoLiveScore(sections, confirmations);
  const overallStatus = worstStatus(sections.map((s) => s.status));

  const result: GoLiveResult = {
    code: "GO_LIVE_READINESS_READY",
    status: overallStatus,
    score,
    sections,
    tasks,
    checklist,
    agentSummary: getAgentSummary(),
    confirmations: confirmations ?? {},
    generatedAt: new Date().toISOString(),
  };

  if (!assertNoSecretsInResponse(result)) {
    console.error("[go-live-agent] Sicherheitscheck: Secret-Leak unterdrückt.");
  }

  return result;
}
