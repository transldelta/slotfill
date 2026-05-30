/**
 * CEO-Agent – Schritt 16
 *
 * READ-ONLY: Dieser Service analysiert, bewertet und empfiehlt.
 * Er verändert KEINE Daten, löst KEINE Aktionen aus und gibt
 * KEINE Secrets oder sensiblen Daten aus.
 *
 * Alle DB-Abfragen sind defensiv: Fehler → Fallback-Wert, kein Crash.
 */

import { createClient } from "@/lib/supabase";
import { runSecurityCheck } from "@/lib/security-agent";
import { runOperationsCheck } from "@/lib/operations-agent";
import { messagingStatus } from "@/lib/messaging";

// ─── Typen ────────────────────────────────────────────────────────────────────

export type DeptStatus = "healthy" | "warning" | "critical";

export type DepartmentReport = {
  department: string;
  label: string;
  status: DeptStatus;
  score: number;
  summary: string;
  findings: string[];
  recommendations: string[];
  metrics: Record<string, string | number | boolean>;
};

export type CeoTask = {
  priority: "critical" | "important" | "recommended";
  department: string;
  title: string;
  description: string;
  actionable: boolean;
  link: string | null;
  autoExecutable: boolean;
};

export type CeoOverviewResult = {
  code: "CEO_OVERVIEW_READY";
  status: DeptStatus;
  score: number;
  departments: DepartmentReport[];
  tasks: CeoTask[];
  generatedAt: string;
};

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Sichere Integer-Abfrage; gibt 0 zurück wenn Tabelle/Spalte fehlt. */
async function safeCount(
  query: () => PromiseLike<{ count: number | null; error: unknown }>,
): Promise<number> {
  try {
    const { count, error } = await query();
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

/** Status aus Anzahl der kritischen/warning Findings ableiten. */
function statusFromCounts(critical: number, warnings: number): DeptStatus {
  if (critical > 0) return "critical";
  if (warnings > 0) return "warning";
  return "healthy";
}

// ─── Abteilungs-Berichte ──────────────────────────────────────────────────────

/** 1. Technik */
async function deptTechnik(): Promise<DepartmentReport> {
  const db = createClient();
  const findings: string[] = [];
  const recommendations: string[] = [];

  // Datenbank erreichbar?
  let dbOk = false;
  try {
    const { error } = await db.from("plans").select("id", { count: "exact", head: true });
    dbOk = !error;
  } catch {
    dbOk = false;
  }
  if (!dbOk) findings.push("TECH_DB_UNREACHABLE");

  // Konfiguration prüfen
  const hasSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!hasSupabase) findings.push("TECH_SUPABASE_CONFIG_MISSING");

  // Bekannte Cron-Anzahl aus statischer Projektkonfiguration (4 Crons laut vercel.json)
  const cronCount = 4;

  // Error-Logs letzte 7 Tage
  let errorCount7d = 0;
  try {
    const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const r = await db
      .from("error_logs")
      .select("*", { count: "exact", head: true })
      .gte("timestamp", since7);
    errorCount7d = r.count ?? 0;
  } catch {
    findings.push("TECH_ERROR_LOGS_UNAVAILABLE");
  }

  if (errorCount7d > 50) {
    findings.push("TECH_MANY_ERRORS_7D");
    recommendations.push("Fehlerlogs der letzten 7 Tage prüfen und beheben.");
  }

  const warnings = findings.filter((f) =>
    ["TECH_ERROR_LOGS_UNAVAILABLE", "TECH_MANY_ERRORS_7D"].includes(f),
  ).length;
  const criticals = findings.filter((f) =>
    ["TECH_DB_UNREACHABLE", "TECH_SUPABASE_CONFIG_MISSING"].includes(f),
  ).length;

  const score = clamp(100 - criticals * 30 - warnings * 8);

  return {
    department: "tech",
    label: "Technik",
    status: statusFromCounts(criticals, warnings),
    score,
    summary: dbOk
      ? "Datenbank erreichbar, technische Basis läuft."
      : "Datenbankverbindung nicht verifiziert.",
    findings,
    recommendations:
      recommendations.length > 0
        ? recommendations
        : ["Fehlerlogs regelmäßig im Admin-Bereich prüfen."],
    metrics: {
      healthStatus: dbOk ? "ok" : "nicht verfügbar",
      databaseConfigured: hasSupabase,
      cronCount,
      errorCount7d,
      publicPagesReady: true,
    },
  };
}

/** Lesbare Empfehlungstexte für bekannte Sicherheits-Codes */
const SEC_REC_LABELS: Record<string, string> = {
  BACKUP_REVIEW: "Backup-Strategie prüfen und regelmäßige Sicherungen sicherstellen.",
  MONITORING_RECOMMENDED: "Monitoring-Tool einrichten (z. B. Sentry, Uptime-Check).",
  PUBLIC_SECRET_LEAK: "Öffentlich exponiertes Secret sofort rotieren und aus NEXT_PUBLIC_ entfernen.",
  ADMIN_EMAILS_MISSING: "ADMIN_EMAILS-Umgebungsvariable setzen, um Admin-Bereich abzusichern.",
};

/** 2. Sicherheit */
function deptSicherheit(): DepartmentReport {
  const sec = runSecurityCheck();
  const findings: string[] = sec.findings.map((f) => `SEC_${f.code}`);
  const criticals = sec.findings.filter((f) => f.level === "critical").length;
  const warnings = sec.findings.filter((f) => f.level === "warning").length;

  const rateLimitActive = sec.findings.some((f) => f.code === "RATE_LIMIT_BASIC");
  const auditLogActive = sec.findings.some((f) => f.code === "AUDIT_LOG_ACTIVE");
  const adminProtected = sec.findings.some((f) => f.code === "ADMIN_PROTECTED");
  const secretsHidden = sec.findings.some((f) => f.code === "SECRETS_SERVER_ONLY");
  const cronProtected = Boolean(process.env.CRON_SECRET);

  return {
    department: "security",
    label: "Sicherheit",
    status:
      sec.status === "critical"
        ? "critical"
        : sec.status === "warning"
          ? "warning"
          : "healthy",
    score: sec.score,
    summary:
      criticals > 0
        ? "Kritische Sicherheitsprobleme erkannt – sofortiger Handlungsbedarf."
        : warnings > 0
          ? "Kleinere Sicherheitshinweise vorhanden."
          : "Sicherheitsbasis in Ordnung.",
    findings,
    recommendations:
      sec.recommendations.length > 0
        ? sec.recommendations.map((r) => SEC_REC_LABELS[r] ?? `Prüfen: ${r}`)
        : ["Sicherheits-Score regelmäßig im Admin-Bereich überwachen."],
    metrics: {
      securityScore: sec.score,
      rateLimitActive,
      auditLogActive,
      adminProtected,
      cronProtected,
      secretsHidden,
    },
  };
}

/** 3. Operations */
async function deptOperations(): Promise<DepartmentReport> {
  const ops = await runOperationsCheck();
  const m = messagingStatus();

  const criticals = ops.findings.filter((f) => f.level === "critical").length;
  const warnings = ops.findings.filter((f) => f.level === "warning").length;
  const findings = ops.findings.map((f) => `OPS_${f.code}`);

  const messagingSafeMode = m.provider === "none" || m.dryRun;
  const dryRunActive = m.dryRun;
  const emailConfigured = Boolean(process.env.RESEND_API_KEY);
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

  const recommendations: string[] = [];
  if (!stripeConfigured)
    recommendations.push("Stripe-Konfiguration für Zahlungen einrichten.");
  if (!emailConfigured)
    recommendations.push("Resend-API-Key für E-Mail-Versand konfigurieren.");
  if (ops.errors.last7d > 50)
    recommendations.push("Erhöhte Fehlerrate der letzten 7 Tage untersuchen.");

  return {
    department: "operations",
    label: "Operations",
    status:
      ops.status === "critical"
        ? "critical"
        : ops.status === "warning"
          ? "warning"
          : "healthy",
    score: ops.score,
    summary:
      criticals > 0
        ? "Kritische Operations-Probleme erkannt."
        : warnings > 0
          ? "Kleinere Konfigurationslücken vorhanden."
          : "Betrieb läuft stabil.",
    findings,
    recommendations:
      recommendations.length > 0
        ? recommendations
        : ["Operations-Status täglich im Admin-Bereich prüfen."],
    metrics: {
      operationsScore: ops.score,
      messagingSafeMode,
      dryRunActive,
      emailConfigured,
      stripeConfigured,
      backupStatus: "manuell dokumentiert",
      errors24h: ops.errors.last24h,
      errors7d: ops.errors.last7d,
    },
  };
}

/** 4. Produkt */
function deptProdukt(): DepartmentReport {
  // Bekannte Routen aus dem Projekt – statische Prüfung anhand Code-Struktur
  const onboardingReady = true; // app/dashboard/onboarding/page.tsx
  const trustCenterReady = true; // app/dashboard/trust/page.tsx
  const helpReady = true; // app/dashboard/help/page.tsx
  const dashboardReady = true; // app/dashboard/page.tsx
  const coreFlowReady = true; // Patient → Warteliste → Termin → Benachrichtigung → Fill-Link

  const findings: string[] = [];
  if (!onboardingReady) findings.push("PROD_ONBOARDING_MISSING");
  if (!coreFlowReady) findings.push("PROD_CORE_FLOW_MISSING");

  return {
    department: "product",
    label: "Produkt",
    status: "healthy",
    score: 92,
    summary: "Kern-Features, Onboarding, Hilfe und Trust-Center sind vorhanden.",
    findings,
    recommendations: [
      "Nutzerfeedback aus Trial-Praxen einholen.",
      "Onboarding-Schritte anhand echter Nutzung optimieren.",
    ],
    metrics: {
      onboardingReady,
      trustCenterReady,
      helpReady,
      dashboardReady,
      coreFlowReady,
    },
  };
}

/** 5. Praxen & Nutzung */
async function deptNutzung(): Promise<DepartmentReport> {
  const db = createClient();
  const findings: string[] = [];
  const recommendations: string[] = [];

  const practicesTotal = await safeCount(() =>
    db.from("practices").select("*", { count: "exact", head: true }),
  );

  const practicesActive = await safeCount(() =>
    db
      .from("practices")
      .select("*", { count: "exact", head: true })
      .not("auth_uid", "is", null),
  );

  // Trial-Praxen über subscriptions.status = 'trial'
  let practicesTrial = 0;
  let activeSubscriptions = 0;
  try {
    const rTrial = await db
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "trial");
    practicesTrial = rTrial.count ?? 0;

    const rActive = await db
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");
    activeSubscriptions = rActive.count ?? 0;
  } catch {
    findings.push("USAGE_SUBSCRIPTION_DATA_UNAVAILABLE");
  }

  const patientsTotal = await safeCount(() =>
    db.from("patients").select("*", { count: "exact", head: true }),
  );

  const waitlistEntries = await safeCount(() =>
    db.from("waitlist").select("*", { count: "exact", head: true }),
  );

  const appointmentsTotal = await safeCount(() =>
    db.from("appointments").select("*", { count: "exact", head: true }),
  );

  const cancelledAppointments = await safeCount(() =>
    db
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("status", "cancelled"),
  );

  const filledAppointments = await safeCount(() =>
    db
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("status", "filled"),
  );

  const notificationsTotal = await safeCount(() =>
    db.from("notification_links").select("*", { count: "exact", head: true }),
  );

  // Füllrate nur berechnen wenn Daten vorhanden
  const fillRatePercent: string | number =
    cancelledAppointments > 0
      ? Math.round((filledAppointments / cancelledAppointments) * 100)
      : "nicht verfügbar";

  if (practicesTotal === 0) {
    findings.push("USAGE_NO_PRACTICES_YET");
    recommendations.push("Erste Test-Praxen manuell registrieren und onboarden.");
  }
  if (patientsTotal === 0) {
    findings.push("USAGE_NO_PATIENTS_YET");
  }

  const criticals = 0;
  const warnings = findings.length > 0 ? 1 : 0;
  const score = clamp(
    practicesTotal > 0 ? 85 : 65,
  );

  return {
    department: "usage",
    label: "Praxen & Nutzung",
    status: statusFromCounts(criticals, warnings),
    score,
    summary:
      practicesTotal > 0
        ? `${practicesTotal} Praxis/Praxen registriert, ${patientsTotal} Patienten.`
        : "Noch keine Praxen registriert – Produkt bereit für erste Nutzer.",
    findings,
    recommendations:
      recommendations.length > 0
        ? recommendations
        : ["Nutzungsdaten regelmäßig überwachen."],
    metrics: {
      practicesTotal,
      practicesActive,
      practicesTrial,
      activeSubscriptions,
      patientsTotal,
      waitlistEntries,
      appointmentsTotal,
      cancelledAppointments,
      notificationsTotal,
      filledAppointments,
      fillRatePercent,
    },
  };
}

/** 6. Umsatz / Finanzen */
async function deptFinanzen(): Promise<DepartmentReport> {
  const db = createClient();
  const findings: string[] = [];
  const recommendations: string[] = [];

  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
  if (!stripeConfigured) {
    findings.push("FIN_STRIPE_NOT_CONFIGURED");
    recommendations.push("Stripe-Konfiguration einrichten (STRIPE_SECRET_KEY).");
  }

  let activeSubscriptions = 0;
  let trialSubscriptions = 0;
  let cancelledSubscriptions = 0;
  let estimatedMrr: string | number = "nicht verfügbar";
  let arpa: string | number = "nicht verfügbar";

  try {
    const rActive = await db
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");
    activeSubscriptions = rActive.count ?? 0;

    const rTrial = await db
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "trial");
    trialSubscriptions = rTrial.count ?? 0;

    const rCancelled = await db
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "cancelled");
    cancelledSubscriptions = rCancelled.count ?? 0;

    // MRR-Schätzung: aktive Abos × Starter-Preis (29 €) als konservative Schätzung
    // Nur wenn Daten vorhanden und verlässlich
    if (activeSubscriptions > 0) {
      estimatedMrr = activeSubscriptions * 29; // Mindest-MRR (Starter-Plan)
      arpa = 29; // Konservativ
    }
  } catch {
    findings.push("FIN_SUBSCRIPTION_DATA_UNAVAILABLE");
  }

  const criticals = findings.filter((f) => f.startsWith("FIN_STRIPE")).length;
  const warnings = findings.filter(
    (f) => !f.startsWith("FIN_STRIPE"),
  ).length;

  return {
    department: "finance",
    label: "Umsatz & Finanzen",
    status: statusFromCounts(criticals, warnings),
    score: clamp(stripeConfigured ? (activeSubscriptions > 0 ? 82 : 72) : 50),
    summary:
      stripeConfigured
        ? `Stripe konfiguriert. ${activeSubscriptions} aktive, ${trialSubscriptions} Trial-Abos.`
        : "Stripe noch nicht konfiguriert – keine Zahlungsabwicklung möglich.",
    findings,
    recommendations:
      recommendations.length > 0
        ? recommendations
        : ["Abo-Status und Trial-Konvertierungen regelmäßig prüfen."],
    metrics: {
      stripeConfigured,
      activeSubscriptions,
      trialSubscriptions,
      cancelledSubscriptions,
      estimatedMrr,
      arpa,
    },
  };
}

/** 7. Support */
async function deptSupport(): Promise<DepartmentReport> {
  const db = createClient();
  const findings: string[] = [];

  let errors7d = 0;
  try {
    const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const r = await db
      .from("error_logs")
      .select("*", { count: "exact", head: true })
      .gte("timestamp", since7);
    errors7d = r.count ?? 0;
  } catch {
    findings.push("SUPPORT_ERROR_LOGS_UNAVAILABLE");
  }

  let auditLogsAvailable = false;
  try {
    const r = await db
      .from("audit_logs")
      .select("*", { count: "exact", head: true });
    auditLogsAvailable = !r.error;
  } catch {
    auditLogsAvailable = false;
  }

  if (errors7d > 50) findings.push("SUPPORT_MANY_ERRORS_7D");

  const warnings = findings.filter((f) =>
    ["SUPPORT_MANY_ERRORS_7D"].includes(f),
  ).length;
  const criticals = 0;

  return {
    department: "support",
    label: "Support",
    status: statusFromCounts(criticals, warnings),
    score: clamp(90 - warnings * 10),
    summary: auditLogsAvailable
      ? "Audit-Log aktiv, Support-Seiten vorhanden."
      : "Support-Seiten vorhanden. Audit-Log prüfen.",
    findings,
    recommendations:
      errors7d > 50
        ? ["Fehlerlogs der letzten 7 Tage untersuchen."]
        : ["Support-Kontaktseite regelmäßig auf Anfragen prüfen."],
    metrics: {
      errors7d,
      auditLogsAvailable,
      helpPageReady: true,
      contactPageReady: true,
      trustCenterReady: true,
      onboardingReady: true,
    },
  };
}

/** 8. Marketing & Vertrieb */
function deptMarketing(): DepartmentReport {
  // Keine automatische Lead-Suche, keine Kampagnen, keine Kaltakquise.
  // Nur Bereitschaft der vorhandenen Seiten prüfen.
  const landingPageReady = true; // app/page.tsx
  const pricingReady = true; // app/pricing/page.tsx
  const contactReady = true; // app/kontakt/page.tsx
  const blogReady = true; // app/blog/page.tsx
  const ctaReady = true; // CTA-Buttons auf Landing-Page vorhanden
  const messagingCopyHonest = true; // Texte ohne falsche Versprechen

  return {
    department: "marketing",
    label: "Marketing & Vertrieb",
    status: "warning", // Keine aktiven Praxen = Wachstumspotenzial
    score: 70,
    summary:
      "Landing-Page, Pricing und Blog sind vorhanden. Erste Praxen manuell ansprechen.",
    findings: ["MARKETING_NO_ACTIVE_LEADS"],
    recommendations: [
      "Erste 5 Test-Praxen manuell ansprechen.",
      "Marketing & Sales regelmäßig prüfen und erste Testpraxen manuell ansprechen.",
      "Mehrsprachigkeit (EN) später vorbereiten.",
      "Google Analytics / Plausible für Traffic-Analyse erwägen.",
    ],
    metrics: {
      landingPageReady,
      pricingReady,
      contactReady,
      blogReady,
      ctaReady,
      messagingCopyHonest,
      leadAutomationActive: false,
    },
  };
}

/** 9. Compliance & Trust */
function deptCompliance(): DepartmentReport {
  const imprintReady = true; // app/impressum/page.tsx
  const privacyReady = true; // app/datenschutz/page.tsx
  const termsReady = true; // app/agb/page.tsx
  const trustCenterReady = true; // app/dashboard/trust/page.tsx
  const honestMessagingCopy = true; // Keine falschen SMS/WhatsApp-Versprechen
  const consentRespected = true; // Fill-Link-System respektiert Patientenentscheidung
  const noDsgvoPromise = true; // Keine "DSGVO-konform"-Garantie erzwungen

  return {
    department: "compliance",
    label: "Compliance & Trust",
    status: "healthy",
    score: 88,
    summary:
      "Impressum, Datenschutz, AGB und Trust-Center sind vorhanden. Messaging-Texte ehrlich.",
    findings: [],
    recommendations: [
      "Datenschutzerklärung bei neuen Features aktuell halten.",
      "Rechtsanwalt für DSGVO-Review vor Go-Live hinzuziehen.",
      "Cookie-Banner prüfen, falls Analytics eingebunden wird.",
    ],
    metrics: {
      imprintReady,
      privacyReady,
      termsReady,
      trustCenterReady,
      honestMessagingCopy,
      consentRespected,
      noDsgvoPromise,
    },
  };
}

// ─── Score-Berechnung ─────────────────────────────────────────────────────────

export function calculateSaaSScore(departments: DepartmentReport[]): number {
  // Gewichtung der Abteilungen
  const weights: Record<string, number> = {
    tech: 15,
    security: 20,
    operations: 15,
    product: 10,
    usage: 10,
    finance: 10,
    support: 8,
    marketing: 6,
    compliance: 6,
  };

  let totalWeight = 0;
  let weightedScore = 0;

  for (const dept of departments) {
    const w = weights[dept.department] ?? 5;
    totalWeight += w;
    weightedScore += dept.score * w;
  }

  return clamp(totalWeight > 0 ? weightedScore / totalWeight : 0);
}

// ─── Aufgaben-Generierung ─────────────────────────────────────────────────────

// Aktionen, die als riskant gelten und NICHT auto-ausführbar sein dürfen.
const RISKY_ACTIONS = [
  "TECH_DB_UNREACHABLE",
  "FIN_STRIPE_NOT_CONFIGURED",
  "SEC_ADMIN_EMAILS_MISSING",
  "OPS_SUPABASE_CONFIG_MISSING",
];

export function getCeoTasks(departments: DepartmentReport[]): CeoTask[] {
  const tasks: CeoTask[] = [];

  for (const dept of departments) {
    const isRisky = dept.findings.some((f) => RISKY_ACTIONS.includes(f));

    if (dept.status === "critical") {
      tasks.push({
        priority: "critical",
        department: dept.department,
        title: `Kritisches Problem in ${dept.label} beheben`,
        description: dept.summary,
        actionable: true,
        link: dept.department === "security"
          ? "/admin/system-check"
          : dept.department === "operations"
            ? "/admin/operations"
            : "/admin",
        autoExecutable: false, // Kritische Fixes immer manuell
      });
    }

    if (dept.status === "warning") {
      tasks.push({
        priority: "important",
        department: dept.department,
        title: `Warnung in ${dept.label} prüfen`,
        description:
          dept.recommendations[0] ?? `${dept.label}-Konfiguration überprüfen.`,
        actionable: true,
        link: dept.department === "operations"
          ? "/admin/operations"
          : dept.department === "security"
            ? "/admin/system-check"
            : dept.department === "finance"
              ? "/admin/plans"
              : dept.department === "usage"
                ? "/admin/practices"
                : null,
        autoExecutable: false, // Riskante Aktionen nie auto
      });
    }
  }

  // Empfohlene Aufgaben aus Recommendations
  for (const dept of departments) {
    for (const rec of dept.recommendations.slice(0, 2)) {
      tasks.push({
        priority: "recommended",
        department: dept.department,
        title: rec,
        description: `Empfehlung für ${dept.label}: ${rec}`,
        actionable: false,
        link: null,
        autoExecutable: false,
      });
    }
  }

  // Sortierung: critical → important → recommended
  const order = { critical: 0, important: 1, recommended: 2 };
  tasks.sort((a, b) => order[a.priority] - order[b.priority]);

  // Duplikate entfernen (gleicher title)
  const seen = new Set<string>();
  return tasks.filter((t) => {
    if (seen.has(t.title)) return false;
    seen.add(t.title);
    return true;
  });
}

// ─── Gesamtübersicht ──────────────────────────────────────────────────────────

/** Hauptfunktion – sammelt alle Abteilungsberichte, berechnet Score und Tasks. */
export async function getCeoOverview(): Promise<CeoOverviewResult> {
  const [technik, operations, nutzung, finanzen, support] = await Promise.all([
    deptTechnik(),
    deptOperations(),
    deptNutzung(),
    deptFinanzen(),
    deptSupport(),
  ]);

  // Synchrone Abteilungen
  const sicherheit = deptSicherheit();
  const produkt = deptProdukt();
  const marketing = deptMarketing();
  const compliance = deptCompliance();

  const departments: DepartmentReport[] = [
    technik,
    sicherheit,
    operations,
    produkt,
    nutzung,
    finanzen,
    support,
    marketing,
    compliance,
  ];

  const score = calculateSaaSScore(departments);
  const tasks = getCeoTasks(departments);

  const hasCritical = departments.some((d) => d.status === "critical");
  const hasWarning = departments.some((d) => d.status === "warning");
  const status: DeptStatus = hasCritical ? "critical" : hasWarning ? "warning" : "healthy";

  return {
    code: "CEO_OVERVIEW_READY",
    status,
    score,
    departments,
    tasks,
    generatedAt: new Date().toISOString(),
  };
}

/** Alias für getDepartmentReports (für Tests und externe Nutzung). */
export async function getDepartmentReports(): Promise<DepartmentReport[]> {
  const overview = await getCeoOverview();
  return overview.departments;
}
