import { createClient } from "@/lib/supabase";
import { messagingStatus } from "@/lib/messaging";

export type Level = "info" | "warning" | "critical";
export type Finding = { level: Level; code: string };
export type Task = {
  priority: "low" | "medium" | "high" | "critical";
  code: string;
  area: "operations" | "security" | "email" | "stripe" | "messaging" | "database" | "cron";
  autoExecutable: boolean;
};

export type OperationsResult = {
  code: "OPERATIONS_CHECK_COMPLETE";
  status: "healthy" | "warning" | "critical";
  score: number;
  findings: Finding[];
  tasks: Task[];
  safeActionsAvailable: string[];
  errors: { last24h: number; last7d: number };
  generatedAt: string;
};

function clamp(n: number): number {
  return Math.max(0, Math.min(100, n));
}

const AREA_BY_CODE: Record<string, Task["area"]> = {
  DB_UNREACHABLE: "database",
  SUPABASE_CONFIG_MISSING: "database",
  CRON_SECRET_MISSING: "cron",
  ADMIN_EMAILS_MISSING: "security",
  APP_URL_MISSING: "operations",
  STRIPE_NOT_CONFIGURED: "stripe",
  RESEND_NOT_CONFIGURED: "email",
  MANY_ERRORS_24H: "operations",
};

export function detectCriticalIssues(findings: Finding[]): Finding[] {
  return findings.filter((f) => f.level === "critical");
}

export function generateMaintenanceTasks(findings: Finding[]): Task[] {
  const tasks: Task[] = findings
    .filter((f) => f.level !== "info")
    .map((f) => ({
      priority: f.level === "critical" ? "critical" : "medium",
      code: f.code,
      area: AREA_BY_CODE[f.code] ?? "operations",
      // Riskante/strukturelle Aufgaben sind nie automatisch ausführbar.
      autoExecutable: false,
    }));
  // Eine sichere, automatisch ausführbare Aufgabe: Statusbericht erzeugen.
  tasks.push({
    priority: "low",
    code: "GENERATE_REPORT",
    area: "operations",
    autoExecutable: true,
  });
  return tasks;
}

export async function runOperationsCheck(): Promise<OperationsResult> {
  const findings: Finding[] = [];
  const admin = createClient();

  // Datenbank erreichbar?
  let dbOk = false;
  try {
    const { error } = await admin
      .from("plans")
      .select("id", { count: "exact", head: true });
    dbOk = !error;
  } catch {
    dbOk = false;
  }
  if (!dbOk) findings.push({ level: "critical", code: "DB_UNREACHABLE" });

  if (!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    findings.push({ level: "critical", code: "SUPABASE_CONFIG_MISSING" });
  }
  if (!process.env.CRON_SECRET) {
    findings.push({ level: "critical", code: "CRON_SECRET_MISSING" });
  }
  if (!process.env.ADMIN_EMAILS) {
    findings.push({ level: "critical", code: "ADMIN_EMAILS_MISSING" });
  }
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    findings.push({ level: "warning", code: "APP_URL_MISSING" });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    findings.push({ level: "warning", code: "STRIPE_NOT_CONFIGURED" });
  }
  if (!process.env.RESEND_API_KEY) {
    findings.push({ level: "warning", code: "RESEND_NOT_CONFIGURED" });
  }

  const m = messagingStatus();
  if (m.provider === "none") findings.push({ level: "info", code: "MESSAGING_NONE" });
  if (m.dryRun) findings.push({ level: "info", code: "MESSAGING_DRY_RUN" });

  // Fehlerlogs (robust, falls Tabelle fehlt).
  let errors24 = 0;
  let errors7d = 0;
  try {
    const since24 = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const r24 = await admin
      .from("error_logs")
      .select("*", { count: "exact", head: true })
      .gte("timestamp", since24);
    const r7 = await admin
      .from("error_logs")
      .select("*", { count: "exact", head: true })
      .gte("timestamp", since7);
    errors24 = r24.count ?? 0;
    errors7d = r7.count ?? 0;
  } catch {
    // Tabelle nicht vorhanden -> ignorieren.
  }
  if (errors24 > 20) findings.push({ level: "warning", code: "MANY_ERRORS_24H" });

  const tasks = generateMaintenanceTasks(findings);
  const hasCritical = findings.some((f) => f.level === "critical");
  const hasWarning = findings.some((f) => f.level === "warning");
  const status = hasCritical ? "critical" : hasWarning ? "warning" : "healthy";
  const score = clamp(
    100 -
      findings.reduce(
        (s, f) => s + (f.level === "critical" ? 30 : f.level === "warning" ? 10 : 0),
        0,
      ),
  );

  return {
    code: "OPERATIONS_CHECK_COMPLETE",
    status,
    score,
    findings,
    tasks,
    safeActionsAvailable: ["generate_report"],
    errors: { last24h: errors24, last7d: errors7d },
    generatedAt: new Date().toISOString(),
  };
}

// Nur SICHERE Aktionen: Statusbericht erzeugen + optional protokollieren.
// Es werden KEINE Produktivdaten verändert oder gelöscht.
export async function runSafeMaintenance(): Promise<{
  code: "SAFE_MAINTENANCE_DONE";
  summary: {
    status: string;
    score: number;
    criticalCount: number;
    warningCount: number;
    errors: { last24h: number; last7d: number };
  };
  generatedAt: string;
}> {
  const ops = await runOperationsCheck();
  const summary = {
    status: ops.status,
    score: ops.score,
    criticalCount: ops.findings.filter((f) => f.level === "critical").length,
    warningCount: ops.findings.filter((f) => f.level === "warning").length,
    errors: ops.errors,
  };

  // Sichere Protokollierung (kein Datenrisiko); Fehler ignorieren.
  try {
    const admin = createClient();
    await admin.from("maintenance_logs").insert({
      problem_type: "operations_safe_maintenance",
      affected_table: null,
      action: "generate_report",
      result: `status=${summary.status} score=${summary.score} crit=${summary.criticalCount} warn=${summary.warningCount}`,
      dry_run: false,
    });
  } catch {
    // maintenance_logs evtl. nicht vorhanden -> ignorieren.
  }

  return {
    code: "SAFE_MAINTENANCE_DONE",
    summary,
    generatedAt: new Date().toISOString(),
  };
}
