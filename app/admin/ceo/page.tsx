"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useTranslations } from "@/lib/i18n";
import { formatBerlin } from "@/lib/datetime";

// ─── Typen ────────────────────────────────────────────────────────────────────

type DeptStatus = "healthy" | "warning" | "critical";

type DepartmentReport = {
  department: string;
  label: string;
  status: DeptStatus;
  score: number;
  summary: string;
  findings: string[];
  recommendations: string[];
  metrics: Record<string, string | number | boolean>;
};

type CeoTask = {
  priority: "critical" | "important" | "recommended";
  department: string;
  title: string;
  description: string;
  actionable: boolean;
  link: string | null;
  autoExecutable: boolean;
};

type Payload = {
  code: "CEO_OVERVIEW_READY";
  status: DeptStatus;
  score: number;
  departments: DepartmentReport[];
  tasks: CeoTask[];
  generatedAt: string;
};

// ─── Übersetzungen für technische Codes und Metriken ─────────────────────────

/** Metric-Keys → lesbares Deutsch */
const METRIC_LABELS: Record<string, string> = {
  // Technik
  healthStatus: "Status",
  databaseConfigured: "Datenbank konfiguriert",
  cronCount: "Cron-Jobs",
  errorCount7d: "Fehler letzte 7 Tage",
  publicPagesReady: "Öffentliche Seiten bereit",
  // Sicherheit
  securityScore: "Security-Score",
  rateLimitActive: "Rate-Limit aktiv",
  auditLogActive: "Audit-Log aktiv",
  adminProtected: "Admin geschützt",
  cronProtected: "Cron geschützt",
  secretsHidden: "Secrets versteckt",
  // Operations
  operationsScore: "Operations-Score",
  messagingSafeMode: "Messaging Sicherheitsmodus",
  dryRunActive: "Nur-Simulation aktiv",
  emailConfigured: "E-Mail konfiguriert",
  stripeConfigured: "Stripe konfiguriert",
  backupStatus: "Backup-Status",
  errors24h: "Fehler letzte 24 Std.",
  errors7d: "Fehler letzte 7 Tage",
  // Produkt
  onboardingReady: "Onboarding bereit",
  trustCenterReady: "Trust-Center bereit",
  helpReady: "Hilfe bereit",
  dashboardReady: "Dashboard bereit",
  coreFlowReady: "Kernprozess bereit",
  // Praxen & Nutzung
  practicesTotal: "Praxen gesamt",
  practicesActive: "Aktive Praxen",
  practicesTrial: "Praxen in Testphase",
  activeSubscriptions: "Aktive Abos",
  patientsTotal: "Patienten gesamt",
  waitlistEntries: "Wartelisten-Einträge",
  appointmentsTotal: "Termine gesamt",
  cancelledAppointments: "Abgesagte Termine",
  notificationsTotal: "Benachrichtigungen gesamt",
  filledAppointments: "Gefüllte Termine",
  fillRatePercent: "Füllrate (%)",
  // Finanzen
  trialSubscriptions: "Test-Abos",
  cancelledSubscriptions: "Gekündigte Abos",
  estimatedMrr: "Geschätzter MRR (€)",
  arpa: "Ø Umsatz pro Abo (€)",
  // Support
  auditLogsAvailable: "Audit-Logs verfügbar",
  helpPageReady: "Hilfe-Seite bereit",
  contactPageReady: "Kontakt-Seite bereit",
  // Marketing
  landingPageReady: "Landing-Page bereit",
  pricingReady: "Pricing-Seite bereit",
  contactReady: "Kontakt-Seite bereit",
  blogReady: "Blog bereit",
  ctaReady: "CTA bereit",
  messagingCopyHonest: "Ehrliche Kommunikation",
  leadAutomationActive: "Lead-Automatisierung aktiv",
  // Compliance
  imprintReady: "Impressum bereit",
  privacyReady: "Datenschutz bereit",
  termsReady: "AGB bereit",
  honestMessagingCopy: "Ehrliche Texte",
  consentRespected: "Einwilligung respektiert",
  noDsgvoPromise: "Keine DSGVO-Garantie",
};

/** Finding-Codes → lesbares Deutsch */
const FINDING_LABELS: Record<string, string> = {
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

/** Gibt das lesbare Label für einen Metric-Key zurück, oder den Key selbst als Fallback. */
function metricLabel(key: string): string {
  return METRIC_LABELS[key] ?? key;
}

/** Gibt das lesbare Label für einen Finding-Code zurück, oder den Code selbst als Fallback. */
function findingLabel(code: string): string {
  return FINDING_LABELS[code] ?? code;
}

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

const STATUS_STYLE: Record<DeptStatus, string> = {
  healthy: "text-green-600 dark:text-green-400",
  warning: "text-amber-600 dark:text-amber-400",
  critical: "text-red-600 dark:text-red-500",
};

const STATUS_BG: Record<DeptStatus, string> = {
  healthy: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800",
  warning: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
  critical: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
};

const PRIORITY_STYLE: Record<CeoTask["priority"], string> = {
  critical:
    "bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  important:
    "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  recommended:
    "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
};

const SCORE_COLOR = (score: number): string => {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-500";
};

function StatusIcon({ status }: { status: DeptStatus }) {
  if (status === "healthy") return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  if (status === "warning") return <AlertTriangle className="h-5 w-5 text-amber-500" />;
  return <XCircle className="h-5 w-5 text-red-500" />;
}

function MetricValue({ value }: { value: string | number | boolean }) {
  if (typeof value === "boolean")
    return (
      <span className={value ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}>
        {value ? "✓ Ja" : "✗ Nein"}
      </span>
    );
  return <span className="text-slate-900 dark:text-slate-100">{String(value)}</span>;
}

// ─── Abteilungs-Karte ─────────────────────────────────────────────────────────

function DepartmentCard({ dept, t }: { dept: DepartmentReport; t: ReturnType<typeof useTranslations> }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-xl border p-4 ${STATUS_BG[dept.status]}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <StatusIcon status={dept.status} />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{dept.label}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xl font-bold tabular-nums ${SCORE_COLOR(dept.score)}`}>
            {dept.score}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">/100</span>
        </div>
      </div>

      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{dept.summary}</p>

      {/* Wichtigste Kennzahlen */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {Object.entries(dept.metrics)
          .slice(0, 4)
          .map(([k, v]) => (
            <div key={k} className="flex items-center gap-1 text-xs">
              <span className="text-slate-500 dark:text-slate-400">{metricLabel(k)}:</span>
              <MetricValue value={v} />
            </div>
          ))}
      </div>

      {/* Ausklappbar: Details */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="mt-3 flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {expanded ? "Weniger" : "Details"}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {/* Alle Kennzahlen */}
          <div>
            <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              {t("ceo.metrics")}
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {Object.entries(dept.metrics).map(([k, v]) => (
                <div key={k} className="flex items-center gap-1 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 truncate">{metricLabel(k)}:</span>
                  <MetricValue value={v} />
                </div>
              ))}
            </div>
          </div>

          {/* Empfehlungen */}
          {dept.recommendations.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                {t("ceo.recommendations")}
              </p>
              <ul className="space-y-1">
                {dept.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                    <span className="mt-0.5 text-blue-500">→</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Befunde */}
          {dept.findings.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                {t("ceo.findings")}
              </p>
              <div className="flex flex-wrap gap-1">
                {dept.findings.map((f, i) => (
                  <span
                    key={i}
                    className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {findingLabel(f)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Aufgaben-Liste ───────────────────────────────────────────────────────────

function TaskList({
  tasks,
  priority,
  label,
  emptyLabel,
  t,
}: {
  tasks: CeoTask[];
  priority: CeoTask["priority"];
  label: string;
  emptyLabel: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const filtered = tasks.filter((task) => task.priority === priority);

  return (
    <div className="space-y-2">
      <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
        {priority === "critical" && <XCircle className="h-4 w-4 text-red-500" />}
        {priority === "important" && <AlertTriangle className="h-4 w-4 text-amber-500" />}
        {priority === "recommended" && <CheckCircle2 className="h-4 w-4 text-blue-500" />}
        {label}
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-normal text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          {filtered.length}
        </span>
      </h3>

      {filtered.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">{emptyLabel}</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((task, i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs font-medium ${PRIORITY_STYLE[task.priority]}`}
                    >
                      {task.priority === "critical"
                        ? t("ceo.priorityCritical")
                        : task.priority === "important"
                          ? t("ceo.priorityImportant")
                          : t("ceo.priorityRecommended")}
                    </span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                      {task.department}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {task.autoExecutable ? t("ceo.autoExecutable") : t("ceo.manualOnly")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{task.description}</p>
                </div>
                {task.link && (
                  <a
                    href={task.link}
                    className="shrink-0 rounded p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                    title="Öffnen"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Haupt-Seite ──────────────────────────────────────────────────────────────

export default function CeoPage() {
  const t = useTranslations();
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/ceo/overview", { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.code !== "CEO_OVERVIEW_READY") {
        setError(true);
        return;
      }
      setData(json);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      {/* Kopfzeile */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {t("ceo.title")}
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t("ceo.subtitle")}</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Aktualisieren
        </button>
      </div>

      {/* Sicherheits-Hinweise */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30">
        <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
          🔒 {t("ceo.readOnly")} · {t("ceo.noSecretsShown")} · {t("ceo.noRiskyAutomation")} · {t("ceo.noColdOutreach")}
        </p>
      </div>

      {/* Ladezustand */}
      {loading && (
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>CEO-Übersicht wird geladen…</span>
        </div>
      )}

      {/* Fehler */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            CEO-Übersicht konnte nicht geladen werden. Bitte erneut versuchen.
          </p>
        </div>
      )}

      {/* Hauptinhalt */}
      {!loading && !error && data && (
        <>
          {/* ── Gesamtkarte ── */}
          <div
            className={`rounded-xl border p-5 ${STATUS_BG[data.status]}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {t("ceo.overallStatus")}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <StatusIcon status={data.status} />
                  <span className={`text-lg font-bold ${STATUS_STYLE[data.status]}`}>
                    {data.status === "healthy"
                      ? t("ceo.healthy")
                      : data.status === "warning"
                        ? t("ceo.warning")
                        : t("ceo.critical")}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {t("ceo.saasScore")}
                </p>
                <p className={`text-4xl font-bold tabular-nums ${SCORE_COLOR(data.score)}`}>
                  {data.score}
                  <span className="text-lg font-normal text-slate-400">/100</span>
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {t("ceo.lastUpdated")}
                </p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                  {formatBerlin(data.generatedAt)}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>⚠ {t("ceo.manualApprovalRequired")}</span>
            </div>
          </div>

          {/* ── Score-Balken ── */}
          <div className="overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-700 ${
                data.score >= 80
                  ? "bg-green-500"
                  : data.score >= 60
                    ? "bg-amber-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${data.score}%` }}
            />
          </div>

          {/* ── Abteilungen ── */}
          <div>
            <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-slate-100">
              {t("ceo.departments")}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {data.departments.map((dept) => (
                <DepartmentCard key={dept.department} dept={dept} t={t} />
              ))}
            </div>
          </div>

          {/* ── Aufgaben ── */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Aufgaben
            </h2>

            <TaskList
              tasks={data.tasks}
              priority="critical"
              label={t("ceo.criticalTasks")}
              emptyLabel={t("ceo.noCriticalTasks")}
              t={t}
            />
            <TaskList
              tasks={data.tasks}
              priority="important"
              label={t("ceo.importantTasks")}
              emptyLabel={t("ceo.noImportantTasks")}
              t={t}
            />
            <TaskList
              tasks={data.tasks}
              priority="recommended"
              label={t("ceo.recommendedTasks")}
              emptyLabel={t("ceo.noRecommendedTasks")}
              t={t}
            />
          </div>
        </>
      )}
    </div>
  );
}
