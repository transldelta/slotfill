/**
 * CEO-Kontrollzentrum: Anzeigetexte für technische Codes und Metric-Keys.
 *
 * Ausgelagert in eine eigene Datei, damit sowohl die UI (app/admin/ceo/page.tsx)
 * als auch Tests (scripts/ceo.test.ts) darauf zugreifen können.
 *
 * READ-ONLY: Nur Anzeige, keine Logik.
 */

// ─── Metric-Keys → lesbares Deutsch ──────────────────────────────────────────

export const METRIC_LABELS: Record<string, string> = {
  // Technik
  healthStatus: "Systemstatus",
  databaseConfigured: "Datenbank konfiguriert",
  cronCount: "Cron-Jobs",
  errorCount7d: "Fehler letzte 7 Tage",
  publicPagesReady: "Öffentliche Seiten vorhanden",
  // Sicherheit
  securityScore: "Security-Score",
  rateLimitActive: "Rate-Limiting aktiv",
  auditLogActive: "Audit-Log aktiv",
  adminProtected: "Admin-Bereich geschützt",
  cronProtected: "Cron-Schutz aktiv",
  secretsHidden: "Secrets verborgen",
  // Operations
  operationsScore: "Operations-Score",
  messagingSafeMode: "Messaging im sicheren Modus",
  dryRunActive: "Testmodus aktiv",
  emailConfigured: "E-Mail konfiguriert",
  stripeConfigured: "Stripe konfiguriert",
  backupStatus: "Backup-Status",
  errors24h: "Fehler letzte 24 Std.",
  errors7d: "Fehler letzte 7 Tage",
  // Produkt
  onboardingReady: "Onboarding vorhanden",
  trustCenterReady: "Trust-Center vorhanden",
  helpReady: "Hilfe vorhanden",
  dashboardReady: "Dashboard vorhanden",
  coreFlowReady: "Kern-Flow vorhanden",
  // Praxen & Nutzung
  practicesTotal: "Praxen gesamt",
  practicesActive: "Aktive Praxen",
  practicesTrial: "Praxen in Testphase",
  patientsTotal: "Patienten gesamt",
  waitlistEntries: "Wartelisten-Einträge",
  appointmentsTotal: "Termine gesamt",
  cancelledAppointments: "Ausgefallene Termine",
  notificationsTotal: "Benachrichtigungen gesamt",
  filledAppointments: "Gefüllte Termine",
  fillRatePercent: "Füllrate",
  // Finanzen
  activeSubscriptions: "Aktive Abos",
  trialSubscriptions: "Test-Abos",
  cancelledSubscriptions: "Gekündigte Abos",
  estimatedMrr: "Geschätzter MRR",
  arpa: "Durchschnittlicher Umsatz pro Praxis",
  // Support
  auditLogsAvailable: "Audit-Logs verfügbar",
  helpPageReady: "Hilfeseite vorhanden",
  contactPageReady: "Kontaktseite vorhanden",
  // Marketing
  landingPageReady: "Landingpage vorhanden",
  pricingReady: "Preisseite vorhanden",
  contactReady: "Kontaktseite vorhanden",
  blogReady: "Blog vorhanden",
  ctaReady: "CTA vorhanden",
  messagingCopyHonest: "Ehrliche Messaging-Texte",
  leadAutomationActive: "Lead-Automation aktiv",
  // Compliance
  imprintReady: "Impressum vorhanden",
  privacyReady: "Datenschutz vorhanden",
  termsReady: "AGB vorhanden",
  honestMessagingCopy: "Ehrliche Messaging-Texte",
  consentRespected: "Einwilligung wird respektiert",
  noDsgvoPromise: "Keine falsche DSGVO-Zusage",
};

// ─── Finding-Codes → lesbares Deutsch ────────────────────────────────────────

export const FINDING_LABELS: Record<string, string> = {
  // Sicherheit (SEC_)
  SEC_PUBLIC_SECRET_LEAK: "⚠ Öffentliches Secret-Leck",
  SEC_SECRETS_SERVER_ONLY: "✓ Secrets nur serverseitig",
  SEC_ADMIN_EMAILS_MISSING: "⚠ Admin-E-Mails nicht konfiguriert",
  SEC_ADMIN_PROTECTED: "✓ Admin-Bereich geschützt",
  SEC_WEBHOOK_SIGNATURE_OK: "✓ Webhook-Signatur geprüft",
  SEC_PRACTICE_ID_SERVER_SIDE: "✓ Praxis-ID serverseitig",
  SEC_MESSAGING_SAFE: "✓ Messaging-Sicherheit aktiv",
  SEC_RATE_LIMIT_BASIC: "✓ Basis-Rate-Limit aktiv",
  SEC_AUDIT_LOG_ACTIVE: "✓ Audit-Log aktiv",
  SEC_BACKUP_DOCUMENTED: "✓ Backup dokumentiert",
  SEC_BACKUP_REVIEW: "⚠ Backup-Strategie prüfen",
  SEC_MONITORING_RECOMMENDED: "→ Monitoring empfohlen",
  // Operations (OPS_)
  OPS_DB_UNREACHABLE: "⚠ Datenbank nicht erreichbar",
  OPS_SUPABASE_CONFIG_MISSING: "⚠ Supabase-Konfiguration fehlt",
  OPS_CRON_SECRET_MISSING: "⚠ Cron-Secret fehlt",
  OPS_ADMIN_EMAILS_MISSING: "⚠ Admin-E-Mails fehlen",
  OPS_APP_URL_MISSING: "→ App-URL nicht gesetzt",
  OPS_STRIPE_NOT_CONFIGURED: "→ Stripe nicht konfiguriert",
  OPS_RESEND_NOT_CONFIGURED: "→ E-Mail nicht konfiguriert",
  OPS_MESSAGING_NONE: "→ Kein Messaging-Anbieter",
  OPS_MESSAGING_DRY_RUN: "✓ Messaging im Simulationsmodus",
  OPS_MANY_ERRORS_24H: "⚠ Viele Fehler letzte 24 Std.",
  // Technik (TECH_)
  TECH_DB_UNREACHABLE: "⚠ Datenbank nicht erreichbar",
  TECH_SUPABASE_CONFIG_MISSING: "⚠ Supabase-Konfiguration fehlt",
  TECH_ERROR_LOGS_UNAVAILABLE: "→ Fehlerprotokolle nicht verfügbar",
  TECH_MANY_ERRORS_7D: "⚠ Viele Fehler in letzten 7 Tagen",
  // Nutzung (USAGE_)
  USAGE_NO_PRACTICES_YET: "→ Noch keine Praxen registriert",
  USAGE_NO_PATIENTS_YET: "→ Noch keine Patienten registriert",
  USAGE_SUBSCRIPTION_DATA_UNAVAILABLE: "→ Abo-Daten nicht verfügbar",
  // Finanzen (FIN_)
  FIN_STRIPE_NOT_CONFIGURED: "⚠ Stripe nicht konfiguriert",
  FIN_SUBSCRIPTION_DATA_UNAVAILABLE: "→ Abo-Daten nicht verfügbar",
  // Marketing
  MARKETING_NO_ACTIVE_LEADS: "→ Noch keine aktiven Leads",
  // Support
  SUPPORT_ERROR_LOGS_UNAVAILABLE: "→ Fehlerprotokolle nicht verfügbar",
  SUPPORT_MANY_ERRORS_7D: "⚠ Viele Fehler in letzten 7 Tagen",
};

// ─── Abteilungs-Codes → lesbares Deutsch ─────────────────────────────────────

export const DEPT_LABELS: Record<string, string> = {
  tech: "Technik",
  security: "Sicherheit",
  operations: "Operations",
  product: "Produkt",
  usage: "Praxen & Nutzung",
  finance: "Umsatz & Finanzen",
  support: "Support",
  marketing: "Marketing & Vertrieb",
  compliance: "Compliance & Trust",
};

// ─── Metrik-Werte → lesbares Deutsch ─────────────────────────────────────────

export const VALUE_LABELS: Record<string, string> = {
  ok: "OK",
  healthy: "Gesund",
  warning: "Warnung",
  critical: "Kritisch",
  not_available: "Nicht verfügbar",
  none: "Nicht gesetzt",
  "manuell dokumentiert": "Manuell dokumentiert",
  "nicht verfügbar": "Nicht verfügbar",
};

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

/** Metric-Key → lesbares Deutsch; Fallback: Rohwert. */
export function metricLabel(key: string): string {
  return METRIC_LABELS[key] ?? key;
}

/** Finding-Code → lesbares Deutsch; Fallback: Rohwert. */
export function findingLabel(code: string): string {
  return FINDING_LABELS[code] ?? code;
}

/** Abteilungs-Code → lesbares Deutsch; Fallback: Rohwert. */
export function deptLabel(code: string): string {
  return DEPT_LABELS[code] ?? code;
}

/** Metrik-String-Wert → lesbares Deutsch; Fallback: Rohwert. */
export function formatMetricValue(value: string | number | boolean): string {
  if (typeof value === "boolean") return value ? "✓ Ja" : "Nein";
  if (typeof value === "number") return String(value);
  return VALUE_LABELS[String(value)] ?? String(value);
}
