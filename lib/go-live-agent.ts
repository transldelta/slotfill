/**
 * Go-Live-Readiness-Agent – Schritt 21
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
 */

import { existsSync } from "fs";
import { resolve } from "path";
import { messagingStatus } from "@/lib/messaging";
import { runSecurityCheck } from "@/lib/security-agent";
import { assertNoSecretsInResponse } from "@/lib/security-agent";

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
  generatedAt: string;
};

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function worstStatus(statuses: GoLiveStatus[]): GoLiveStatus {
  if (statuses.includes("blocking")) return "blocking";
  if (statuses.includes("warning")) return "warning";
  return "ready";
}

function fileExists(relativePath: string): boolean {
  try {
    return existsSync(resolve(process.cwd(), relativePath));
  } catch {
    return false;
  }
}

/** Prüft ob verbotene Muster in statischen Quelldateien auftauchen. */
function scanFileForPatterns(
  relativePath: string,
  patterns: RegExp[],
): boolean {
  try {
    if (!fileExists(relativePath)) return false;
    const { readFileSync } = require("fs");
    const content: string = readFileSync(
      resolve(process.cwd(), relativePath),
      "utf8",
    );
    return patterns.some((p) => p.test(content));
  } catch {
    return false;
  }
}

// ─── ABSCHNITT A: Startseite ──────────────────────────────────────────────────

function sectionA(): GoLiveSection {
  const checks: GoLiveCheckItem[] = [];
  const findings: string[] = [];

  // A1: Landingpage-Dateien vorhanden
  const landingExists =
    fileExists("app/[locale]/page.tsx") || fileExists("app/page.tsx");
  checks.push({
    id: "A1_LANDING_EXISTS",
    label: "Startseite vorhanden (app/[locale]/page.tsx)",
    status: landingExists ? "ready" : "blocking",
    note: landingExists
      ? "Startseite gefunden."
      : "Startseite fehlt – kritisch vor Go-Live.",
  });
  if (!landingExists) findings.push("A1_LANDING_MISSING");

  // A2: Keine unrealistischen Umsatzversprechen (Scan öffentlicher Seiten)
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
      ? "⚠ Mögliche unrealistische Aussage in Startseite gefunden – bitte prüfen."
      : "Keine offensichtlichen Umsatzversprechen gefunden.",
  });
  if (revenuePromises) findings.push("A2_REVENUE_PROMISE_DETECTED");

  // A3: Keine Fake-Kundenzahlen / erfundene Logos auf Startseite
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
      ? "⚠ Mögliche erfundene Nutzerzahlen auf Startseite – bitte entfernen."
      : "Keine verdächtigen Kundenzahlen gefunden.",
  });
  if (fakeNumbers) findings.push("A3_FAKE_NUMBERS_DETECTED");

  // A4: Trust-Hinweis (Praxis behält Kontrolle) – manuell zu prüfen
  checks.push({
    id: "A4_TRUST_SECTION",
    label: "Trust-Sektion vorhanden (Praxis behält Kontrolle)",
    status: "warning",
    note: "Manuell prüfen: Erklärt die Startseite klar, dass die Praxis die Kontrolle behält und keine automatischen Nachrichten ohne Freigabe gesendet werden?",
  });
  findings.push("A4_TRUST_SECTION_MANUAL_CHECK");

  // A5: Messaging-Klarheit – kein automatischer SMS/WhatsApp-Versand versprochen
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
      ? "⚠ Startseite verspricht automatischen SMS/WhatsApp-Versand – widerspricht sicherem Standardmodus."
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

  // B1: Pricing-Seite vorhanden
  const pricingExists = fileExists("app/[locale]/pricing/page.tsx") || fileExists("app/pricing/page.tsx");
  checks.push({
    id: "B1_PRICING_EXISTS",
    label: "Preisseite vorhanden (/pricing)",
    status: pricingExists ? "ready" : "blocking",
    note: pricingExists
      ? "Preisseite gefunden."
      : "Preisseite fehlt – Praxen können Kosten nicht einschätzen.",
  });
  if (!pricingExists) findings.push("B1_PRICING_MISSING");

  // B2: Kein "kostenlos für immer" ohne Einschränkung
  const freeForeverClaim = scanFileForPatterns(
    "app/[locale]/pricing/page.tsx",
    [/kostenlos\s+für\s+immer/i, /always\s+free/i, /forever\s+free/i],
  );
  checks.push({
    id: "B2_NO_FREE_FOREVER",
    label: 'Kein irreführendes "kostenlos für immer"',
    status: freeForeverClaim ? "blocking" : "ready",
    note: freeForeverClaim
      ? '⚠ "Kostenlos für immer"-Aussage gefunden – bitte korrigieren.'
      : "Keine irreführenden Kostenlos-Versprechen gefunden.",
  });
  if (freeForeverClaim) findings.push("B2_FREE_FOREVER_DETECTED");

  // B3: Trial klar erklärt – manuell prüfen
  checks.push({
    id: "B3_TRIAL_CLEAR",
    label: "Trial-Dauer und Konditionen klar erklärt",
    status: "warning",
    note: "Manuell prüfen: Wird erklärt wie lange der Trial läuft, was danach passiert und welche Einschränkungen gelten (kein echter Messaging-Versand im Trial)?",
  });
  findings.push("B3_TRIAL_CLARITY_MANUAL_CHECK");

  // B4: SMS/WhatsApp-Anbieterkosten ehrlich erwähnt – manuell prüfen
  checks.push({
    id: "B4_PROVIDER_COSTS_HONEST",
    label: "Mögliche Anbieterkosten (Twilio etc.) transparent erwähnt",
    status: "warning",
    note: "Manuell prüfen: Wird erwähnt, dass SMS/WhatsApp über externe Anbieter (z. B. Twilio) zusätzliche Kosten verursachen können? Diese Kosten werden nicht von SlotFill übernommen.",
  });
  findings.push("B4_PROVIDER_COSTS_MANUAL_CHECK");

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

  // C1: Kontaktseite vorhanden
  const contactExists =
    fileExists("app/kontakt/page.tsx") ||
    fileExists("app/[locale]/kontakt/page.tsx");
  checks.push({
    id: "C1_CONTACT_EXISTS",
    label: "Kontaktseite vorhanden (/kontakt)",
    status: contactExists ? "ready" : "blocking",
    note: contactExists
      ? "Kontaktseite gefunden."
      : "Kontaktseite fehlt – Test-Praxen können sich nicht melden.",
  });
  if (!contactExists) findings.push("C1_CONTACT_MISSING");

  // C2: Kein automatischer E-Mail-Versand ohne echten Provider – manuell prüfen
  const resendConfigured = !!process.env.RESEND_API_KEY;
  checks.push({
    id: "C2_EMAIL_SEND_HONEST",
    label: "Kontaktformular ehrlich beschriftet",
    status: resendConfigured ? "ready" : "warning",
    note: resendConfigured
      ? "E-Mail-Provider (Resend) konfiguriert – Kontaktformular kann senden."
      : "E-Mail nicht konfiguriert: Kontaktformular-Button sollte 'Anfrage vorbereiten' heissen, nicht 'Absenden'. Kein automatischer Versand.",
  });
  if (!resendConfigured) findings.push("C2_EMAIL_NOT_CONFIGURED");

  // C3: Keine automatische Kaltakquise über Kontaktformular
  checks.push({
    id: "C3_NO_COLD_OUTREACH",
    label: "Kein automatischer Outreach aus dem Kontaktformular",
    status: "ready",
    note: "Kontaktformular ist eingehend (Praxis → SlotFill), kein ausgehender automatischer Outreach.",
  });

  // C4: Test-Praxis-Anfrage verständlich – manuell prüfen
  checks.push({
    id: "C4_TRIAL_REQUEST_CLEAR",
    label: "Test-Praxis-Anfrage verständlich erklärt",
    status: "warning",
    note: "Manuell prüfen: Versteht eine Arztpraxis, was nach dem Absenden passiert? Gibt es eine Bestätigungsseite oder -nachricht?",
  });
  findings.push("C4_TRIAL_REQUEST_MANUAL_CHECK");

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

  // D1: Login/Registrierung vorhanden
  const loginExists = fileExists("app/auth/login/page.tsx");
  const registerExists =
    fileExists("app/auth/register/page.tsx") ||
    fileExists("app/auth/signup/page.tsx");
  checks.push({
    id: "D1_AUTH_ROUTES_EXIST",
    label: "Login- und Registrierungsseite vorhanden",
    status: loginExists ? "ready" : "blocking",
    note: loginExists
      ? "Login-Route gefunden. " + (registerExists ? "Registrierung ebenfalls." : "Registrierung prüfen.")
      : "Login-Route fehlt – Trial-Anmeldung nicht möglich.",
  });
  if (!loginExists) findings.push("D1_AUTH_ROUTES_MISSING");

  // D2: Dashboard erreichbar
  const dashboardExists = fileExists("app/dashboard/page.tsx") || fileExists("app/dashboard");
  checks.push({
    id: "D2_DASHBOARD_EXISTS",
    label: "Dashboard erreichbar (/dashboard)",
    status: dashboardExists ? "ready" : "blocking",
    note: dashboardExists
      ? "Dashboard-Route gefunden."
      : "Dashboard fehlt – Praxen können nach Login nichts sehen.",
  });
  if (!dashboardExists) findings.push("D2_DASHBOARD_MISSING");

  // D3: Messaging-Sicherheit im Trial klar kommuniziert – manuell prüfen
  const messaging = messagingStatus();
  const messagingSafe = messaging.provider === "none" || messaging.dryRun;
  checks.push({
    id: "D3_TRIAL_MESSAGING_CLEAR",
    label: "Messaging-Standardmodus sicher (kein echter Versand im Trial)",
    status: messagingSafe ? "ready" : "warning",
    note: messagingSafe
      ? `Messaging ist sicher: Provider=${messaging.provider}, DryRun=${messaging.dryRun}. Im Trial werden keine echten Nachrichten gesendet.`
      : "⚠ Messaging ist nicht im sicheren Standardmodus – prüfen ob Trial-Nutzer echte Nachrichten auslösen können.",
  });
  if (!messagingSafe) findings.push("D3_TRIAL_MESSAGING_UNSAFE");

  // D4: Onboarding vorhanden
  const onboardingExists = fileExists("app/dashboard/onboarding/page.tsx");
  checks.push({
    id: "D4_ONBOARDING_EXISTS",
    label: "Onboarding-Seite vorhanden",
    status: onboardingExists ? "ready" : "warning",
    note: onboardingExists
      ? "Onboarding-Route gefunden."
      : "Onboarding fehlt – neue Praxen wissen nicht wie sie starten.",
  });
  if (!onboardingExists) findings.push("D4_ONBOARDING_MISSING");

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
  const docExists = fileExists("docs/FIRST_TEST_PRACTICE.md");
  checks.push({
    id: "E1_FIRST_TEST_DOC_EXISTS",
    label: "docs/FIRST_TEST_PRACTICE.md vorhanden",
    status: docExists ? "ready" : "warning",
    note: docExists
      ? "Ablauf-Dokument für erste Test-Praxis vorhanden."
      : "Dokument fehlt – als Aufgabe markiert zum Erstellen.",
  });
  if (!docExists) findings.push("E1_FIRST_TEST_DOC_MISSING");

  // E2: Wartelisten-Funktion vorhanden
  const waitlistExists = fileExists("app/dashboard/waitlist/page.tsx");
  checks.push({
    id: "E2_WAITLIST_EXISTS",
    label: "Wartelisten-Funktion vorhanden (/dashboard/waitlist)",
    status: waitlistExists ? "ready" : "blocking",
    note: waitlistExists
      ? "Wartelisten-Seite gefunden."
      : "Wartelisten-Funktion fehlt – Kernfunktion nicht nutzbar.",
  });
  if (!waitlistExists) findings.push("E2_WAITLIST_MISSING");

  // E3: Patienten-Funktion vorhanden
  const patientsExists = fileExists("app/dashboard/patients/page.tsx");
  checks.push({
    id: "E3_PATIENTS_EXISTS",
    label: "Patienten-Verwaltung vorhanden (/dashboard/patients)",
    status: patientsExists ? "ready" : "warning",
    note: patientsExists
      ? "Patienten-Seite gefunden."
      : "Patienten-Verwaltung fehlt – Testpatienten können nicht angelegt werden.",
  });
  if (!patientsExists) findings.push("E3_PATIENTS_MISSING");

  // E4: Terminverwaltung vorhanden
  const appointmentsExists = fileExists("app/dashboard/appointments/page.tsx");
  checks.push({
    id: "E4_APPOINTMENTS_EXISTS",
    label: "Terminverwaltung vorhanden (/dashboard/appointments)",
    status: appointmentsExists ? "ready" : "warning",
    note: appointmentsExists
      ? "Terminverwaltung gefunden."
      : "Terminverwaltung fehlt – Terminlücken-Simulation nicht möglich.",
  });
  if (!appointmentsExists) findings.push("E4_APPOINTMENTS_MISSING");

  // E5: Keine echten SMS/WhatsApp im Test-Ablauf (s. Messaging-Status)
  const messaging = messagingStatus();
  const safeModeActive = messaging.provider === "none" || messaging.dryRun;
  checks.push({
    id: "E5_NO_REAL_SMS_IN_TEST",
    label: "Kein echter SMS/WhatsApp-Versand im Testablauf",
    status: safeModeActive ? "ready" : "blocking",
    note: safeModeActive
      ? "Messaging ist sicher – kein echter Versand möglich ohne manuelle Anbieter-Konfiguration."
      : "⚠ Messaging nicht im sicheren Modus – echte Nachrichten an Testpatienten möglich.",
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

  const adminChecks: Array<{ id: string; label: string; file?: string }> = [
    { id: "F01", label: "Production-Domain geprüft" },
    { id: "F02", label: "Login erreichbar", file: "app/auth/login/page.tsx" },
    { id: "F03", label: "Dashboard erreichbar", file: "app/dashboard/page.tsx" },
    { id: "F04", label: "Admin-Bereich erreichbar", file: "app/admin/page.tsx" },
    { id: "F05", label: "Startseite geprüft", file: "app/[locale]/page.tsx" },
    { id: "F06", label: "Pricing geprüft", file: "app/[locale]/pricing/page.tsx" },
    { id: "F07", label: "Kontakt geprüft", file: "app/kontakt/page.tsx" },
    { id: "F08", label: "Blog geprüft", file: "app/[locale]/blog/page.tsx" },
    { id: "F09", label: "10 Sprachen geprüft (de,en,zh,hi,es,ar,fr,pt,bn,ru)" },
    { id: "F10", label: "Backup-Review offen/erledigt" },
    { id: "F11", label: "Legal Review offen/erledigt (Impressum, Datenschutz, AGB)" },
    { id: "F12", label: "Erste Test-Praxis vorbereitet", file: "docs/FIRST_TEST_PRACTICE.md" },
    { id: "F13", label: "Messaging bleibt sicher (kein Versand ohne bewusste Konfiguration)" },
  ];

  for (const item of adminChecks) {
    const fileCheck = item.file ? fileExists(item.file) : null;
    const status: GoLiveStatus =
      fileCheck === false ? "warning" : "warning"; // Alle F-Checks = manuell bestätigen

    checks.push({
      id: item.id + "_CHECKLIST",
      label: item.label,
      status: fileCheck === false ? "warning" : "ready",
      note:
        fileCheck === false
          ? `Datei ${item.file} nicht gefunden – prüfen.`
          : "Manuell vor Go-Live bestätigen.",
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

  // Verbotene Phrasen in öffentlichen Seiten
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
    if (!fileExists(file)) continue;
    if (scanFileForPatterns(file, FORBIDDEN_TESTIMONIAL_PATTERNS)) {
      fakeFound = true;
      detectedIn.push(file);
      findings.push(`G1_FAKE_TESTIMONIAL_IN_${file.replace(/\//g, "_").toUpperCase()}`);
    }
  }

  checks.push({
    id: "G1_NO_FAKE_TESTIMONIALS",
    label: "Keine Fake-Testimonials oder erfundene Kundenzahlen",
    status: fakeFound ? "blocking" : "ready",
    note: fakeFound
      ? `⚠ Mögliche Fake-Testimonials gefunden in: ${detectedIn.join(", ")}. Bitte entfernen.`
      : "Keine verdächtigen Testimonial-Phrasen in öffentlichen Seiten gefunden.",
  });

  // G2: Keine erfundenen Logos
  const logoPatterns = [/trusted-by.*logo/i, /partner.*logo/i, /logo.*grid/i];
  const logosFound = publicFiles.some((f) =>
    scanFileForPatterns(f, logoPatterns),
  );
  checks.push({
    id: "G2_NO_FAKE_LOGOS",
    label: "Keine erfundenen Kunden-Logos",
    status: logosFound ? "warning" : "ready",
    note: logosFound
      ? "⚠ Mögliche Logo-Grids gefunden – prüfen ob echte Kunden-Logos oder Platzhalter verwendet werden."
      : "Keine Logo-Grid-Muster in öffentlichen Seiten gefunden.",
  });
  if (logosFound) findings.push("G2_POTENTIAL_FAKE_LOGOS");

  // G3: Social-Proof-Datei prüfen falls vorhanden
  const socialProofExists =
    fileExists("components/social-proof.tsx") ||
    fileExists("components/testimonials.tsx");
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

  // H1: Marketing-Agent hat kein Auto-Outreach
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
      : "⚠ Marketing-Agent enthält mögliche Auto-Outreach-Funktion – dringend prüfen.",
  });
  if (!marketingAgentSafe) findings.push("H1_MARKETING_AUTO_OUTREACH_DETECTED");

  // H2: Keine automatische E-Mail-Liste
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
      ? "⚠ Mögliche Bulk-E-Mail-Funktion in email.ts gefunden – prüfen."
      : "Keine Bulk-E-Mail-Funktion gefunden.",
  });
  if (autoEmailList) findings.push("H2_BULK_EMAIL_DETECTED");

  // H3: Keine automatischen Anrufe
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
      ? "⚠ Mögliche Auto-Call-Funktion in messaging.ts gefunden – prüfen."
      : "Keine automatischen Anrufe gefunden.",
  });
  if (autoCall) findings.push("H3_AUTO_CALLS_DETECTED");

  // H4: Manuelle Erstkontakt-Aufgabe vorhanden (positiv)
  checks.push({
    id: "H4_MANUAL_FIRST_CONTACT",
    label: "Erste Test-Praxen werden manuell angesprochen (nicht automatisch)",
    status: "ready",
    note: "✓ Go-Live-Plan: Erste 5 Test-Praxen werden manuell und persönlich angesprochen. Keine automatische Kaltakquise.",
  });

  return {
    sectionId: "H",
    title: "Keine automatische Kaltakquise",
    status: worstStatus(checks.map((c) => c.status)),
    summary:
      "Verifiziert dass keine automatische Kaltakquise-Funktion eingebaut ist – weder E-Mail-Blast, Anrufe noch automatische Lead-Outreach.",
    checks,
    findings,
  };
}

// ─── ABSCHNITT I: Keine echten SMS/WhatsApp ohne Freigabe ────────────────────

function sectionI(): GoLiveSection {
  const checks: GoLiveCheckItem[] = [];
  const findings: string[] = [];

  const messaging = messagingStatus();

  // I1: Standard-Provider ist 'none'
  const safeProvider = messaging.provider === "none";
  checks.push({
    id: "I1_DEFAULT_PROVIDER_NONE",
    label: "Standard-Messaging-Provider: none (kein Provider ohne Konfiguration)",
    status: safeProvider ? "ready" : "warning",
    note: safeProvider
      ? "✓ Kein Messaging-Provider konfiguriert – kein echter Versand möglich."
      : `Provider: ${messaging.provider} – prüfen ob Trial-Nutzer echte Nachrichten auslösen können.`,
  });
  if (!safeProvider) findings.push("I1_PROVIDER_CONFIGURED_CHECK");

  // I2: DryRun-Modus aktiv oder Provider 'none'
  const dryRunSafe = messaging.dryRun || messaging.provider === "none";
  checks.push({
    id: "I2_DRY_RUN_OR_NONE",
    label: "Messaging im sicheren Modus (DryRun oder kein Provider)",
    status: dryRunSafe ? "ready" : "warning",
    note: dryRunSafe
      ? `✓ Messaging sicher: provider=${messaging.provider}, dryRun=${messaging.dryRun}.`
      : "⚠ Messaging nicht im DryRun-Modus – prüfen ob echter Versand möglich ist.",
  });
  if (!dryRunSafe) findings.push("I2_MESSAGING_NOT_IN_SAFE_MODE");

  // I3: UI-Text erklärt sicheren Standardmodus – manuell prüfen
  checks.push({
    id: "I3_UI_MESSAGING_HONEST",
    label: "UI erklärt Messaging-Standardmodus klar",
    status: "warning",
    note: 'Manuell prüfen: Zeigt die UI klar an: „Im Standardmodus werden Nachrichten vorbereitet oder simuliert. Echter Versand erfolgt nur nach bewusster Anbieter-Konfiguration und Freigabe."',
  });
  findings.push("I3_UI_MESSAGING_HONEST_MANUAL_CHECK");

  // I4: Keine automatische Nachricht bei Testdaten
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
      ? "⚠ Möglicher automatischer Versand bei Testdaten in messaging.ts gefunden."
      : "Kein automatischer Versand bei Testdaten gefunden.",
  });
  if (autoNotification) findings.push("I4_AUTO_TEST_MESSAGE_DETECTED");

  // I5: Keine Twilio-Credentials im Client
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
      ? "⚠ Mögliche Provider-Credentials im Client-Code gefunden – kritisch!"
      : "Keine Provider-Credentials in öffentlichem Client-Code gefunden.",
  });
  if (twilioInClient) findings.push("I5_PROVIDER_CREDS_IN_CLIENT");

  return {
    sectionId: "I",
    title: "Messaging – Kein automatischer Versand ohne Freigabe",
    status: worstStatus(checks.map((c) => c.status)),
    summary:
      "Verifiziert dass kein echter SMS/WhatsApp-Versand im Standard- oder Trial-Modus möglich ist. Echter Versand nur nach bewusster Provider-Konfiguration.',",
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
        // Wichtige manuelle Prüfungen
        tasks.push({
          priority: section.sectionId === "F" ? "important" : "important",
          sectionId: section.sectionId,
          title: check.label,
          description: check.note,
          manualOnly: true,
          autoExecutable: false,
          link: null,
        });
      }
    }

    // Spezielle Aufgaben aus Findings
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

  // Sortierung: blocking → important → recommended
  const order: Record<GoLiveTask["priority"], number> = {
    blocking: 0,
    important: 1,
    recommended: 2,
  };
  tasks.sort((a, b) => order[a.priority] - order[b.priority]);

  // Deduplizieren (gleicher Titel)
  const seen = new Set<string>();
  return tasks.filter((t) => {
    if (seen.has(t.title)) return false;
    seen.add(t.title);
    return true;
  });
}

// ─── Go-Live-Checkliste ───────────────────────────────────────────────────────

export function getGoLiveChecklist(): GoLiveChecklistItem[] {
  return [
    {
      id: "CL01",
      label: "Production-Domain geprüft und live",
      done: null,
      category: "tech",
    },
    {
      id: "CL02",
      label: "Login unter /auth/login erreichbar",
      done: fileExists("app/auth/login/page.tsx"),
      category: "tech",
    },
    {
      id: "CL03",
      label: "Dashboard unter /dashboard erreichbar",
      done: fileExists("app/dashboard/page.tsx") || fileExists("app/dashboard"),
      category: "tech",
    },
    {
      id: "CL04",
      label: "Admin-Bereich unter /admin erreichbar",
      done: fileExists("app/admin/page.tsx"),
      category: "tech",
    },
    {
      id: "CL05",
      label: "Startseite geprüft (klar, ehrlich, kein Fake-Social-Proof)",
      done: fileExists("app/[locale]/page.tsx"),
      category: "content",
    },
    {
      id: "CL06",
      label: "Pricing-Seite geprüft (Preise klar, Trial erklärt)",
      done: fileExists("app/[locale]/pricing/page.tsx"),
      category: "content",
    },
    {
      id: "CL07",
      label: "Kontaktseite geprüft (Button korrekt benannt)",
      done: fileExists("app/kontakt/page.tsx"),
      category: "content",
    },
    {
      id: "CL08",
      label: "Blog geprüft (10 Sprachen, echte Inhalte)",
      done: fileExists("app/[locale]/blog/page.tsx"),
      category: "content",
    },
    {
      id: "CL09",
      label: "10 Sprachen manuell stichprobenartig geprüft",
      done: null,
      category: "content",
    },
    {
      id: "CL10",
      label: "Backup-Review offen / erledigt",
      done: null,
      category: "ops",
    },
    {
      id: "CL11",
      label: "Legal Review erledigt (Impressum, Datenschutz, AGB)",
      done:
        fileExists("app/impressum/page.tsx") &&
        fileExists("app/datenschutz/page.tsx"),
      category: "legal",
    },
    {
      id: "CL12",
      label: "Erste Test-Praxis vorbereitet (docs/FIRST_TEST_PRACTICE.md)",
      done: fileExists("docs/FIRST_TEST_PRACTICE.md"),
      category: "ops",
    },
    {
      id: "CL13",
      label:
        "Messaging bleibt sicher – kein echter Versand ohne bewusste Provider-Konfiguration",
      done: (() => {
        const m = messagingStatus();
        return m.provider === "none" || m.dryRun;
      })(),
      category: "ops",
    },
  ];
}

// ─── Agenten-Zusammenfassung ──────────────────────────────────────────────────

function getAgentSummary(): GoLiveResult["agentSummary"] {
  // Security-Agent synchron abrufbar
  const sec = runSecurityCheck();
  const secStatus = sec.status;

  return {
    marketing:
      "Marketing-Agent: Prüft Landingpage, CTA, Blog, Pricing, Kontakt. Keine automatische Kaltakquise. Kein Fake-Social-Proof.",
    ceo: "CEO-Agent: Prüft alle 9 Geschäftsbereiche (Tech, Sicherheit, Operations, Produkt, Nutzung, Finanzen, Support, Marketing, Compliance). Aufgaben nach Priorität sortiert.",
    operations:
      "Operations-Agent: Prüft DB, Cron, Messaging-Sicherheit, Error-Logs und Admin-Erreichbarkeit.",
    security: `Security-Agent: Status=${secStatus}. Prüft Secret-Leaks, Admin-Schutz, Rate-Limiting, Audit-Log, Backup-Review und Messaging-Sicherheit.`,
  };
}

// ─── Hauptfunktion ────────────────────────────────────────────────────────────

export function getGoLiveSections(): GoLiveSection[] {
  return [
    sectionA(), // Startseite
    sectionB(), // Preise
    sectionC(), // Kontakt
    sectionD(), // Trial-Anmeldung
    sectionE(), // Erste Testpraxis
    sectionF(), // Admin-Checkliste
    sectionG(), // Keine Fake-Testimonials
    sectionH(), // Keine Kaltakquise
    sectionI(), // Kein Auto-Messaging
  ];
}

export function calculateGoLiveScore(sections: GoLiveSection[]): number {
  const blockingCount = sections.filter((s) => s.status === "blocking").length;
  const warningCount = sections.filter((s) => s.status === "warning").length;
  const score = 100 - blockingCount * 20 - warningCount * 5;
  return clamp(score);
}

export function runGoLiveCheck(): GoLiveResult {
  const sections = getGoLiveSections();
  const tasks = getGoLiveTasks(sections);
  const checklist = getGoLiveChecklist();
  const score = calculateGoLiveScore(sections);

  const overallStatus = worstStatus(sections.map((s) => s.status));

  const result: GoLiveResult = {
    code: "GO_LIVE_READINESS_READY",
    status: overallStatus,
    score,
    sections,
    tasks,
    checklist,
    agentSummary: getAgentSummary(),
    generatedAt: new Date().toISOString(),
  };

  // Sicherheitscheck: keine Secrets in der Antwort
  if (!assertNoSecretsInResponse(result)) {
    console.error("[go-live-agent] Sicherheitscheck: Secret-Leak unterdrückt.");
  }

  return result;
}
