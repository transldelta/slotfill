"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "@/lib/i18n";
import { formatBerlin } from "@/lib/datetime";

type Finding = { level: "info" | "warning" | "critical"; code: string };
type Task = { priority: string; code: string; area: string; autoExecutable: boolean };
type Ops = { status: string; score: number; findings: Finding[]; tasks: Task[] };
type Sec = { status: string; score: number; findings: Finding[]; recommendations: string[] };
type Payload = {
  status: "healthy" | "warning" | "critical";
  operations: Ops;
  security: Sec;
  generatedAt: string;
};

const STATUS_STYLE: Record<string, string> = {
  healthy: "text-green-600 dark:text-green-400",
  warning: "text-amber-600 dark:text-amber-400",
  critical: "text-red-600 dark:text-red-400",
};

export default function OperationsPage() {
  const t = useTranslations();
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/operations", { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.code !== "OPERATIONS_STATUS_READY") {
        toast.error(t("operations.error"));
        return;
      }
      setData(json);
    } catch {
      toast.error(t("operations.error"));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function runMaintenance() {
    setRunning(true);
    try {
      const res = await fetch("/api/admin/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run_safe_maintenance" }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.code === "SAFE_MAINTENANCE_DONE") {
        toast.success(t("operations.safeMaintenanceDone"));
        load();
      } else {
        toast.error(t("operations.safeMaintenanceError"));
      }
    } catch {
      toast.error(t("operations.safeMaintenanceError"));
    } finally {
      setRunning(false);
    }
  }

  const StatusIcon =
    data?.status === "healthy"
      ? CheckCircle2
      : data?.status === "warning"
        ? AlertTriangle
        : XCircle;

  const allFindings = data
    ? [...data.operations.findings, ...data.security.findings]
    : [];
  const criticals = allFindings.filter((f) => f.level === "critical");
  const warnings = allFindings.filter((f) => f.level === "warning");
  const tasks = data?.operations.tasks ?? [];

  const card =
    "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900";

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t("operations.title")}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("operations.subtitle")}
          </p>
        </div>
        <button
          onClick={runMaintenance}
          disabled={loading || running}
          className="shrink-0 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {running ? t("operations.running") : t("operations.runSafeMaintenance")}
        </button>
      </div>

      {loading && <p className="text-sm text-slate-500 dark:text-slate-400">{t("operations.loading")}</p>}

      {!loading && data && (
        <>
          <div className={`flex flex-wrap items-center gap-6 ${card}`}>
            <div className="flex items-center gap-2">
              <StatusIcon className={`h-7 w-7 ${STATUS_STYLE[data.status]}`} />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t("operations.overallStatus")}</p>
                <p className={`font-semibold ${STATUS_STYLE[data.status]}`}>{t(`operations.${data.status}`)}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t("operations.operationsScore")}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{data.operations.score}/100</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t("operations.securityScore")}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{data.security.score}/100</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t("operations.lastChecked")}</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">{formatBerlin(data.generatedAt)}</p>
            </div>
          </div>

          <div className={card}>
            <h2 className="mb-3 text-base font-semibold text-red-600 dark:text-red-400">
              {t("operations.criticalIssues")}
            </h2>
            {criticals.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">{t("operations.noCriticalIssues")}</p>
            ) : (
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
                {criticals.map((f, i) => (
                  <li key={`c-${i}`}>{t(`operations.checks.${f.code}`)}</li>
                ))}
              </ul>
            )}
          </div>

          <div className={card}>
            <h2 className="mb-3 text-base font-semibold text-amber-600 dark:text-amber-400">
              {t("operations.warnings")}
            </h2>
            {warnings.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">{t("operations.noWarnings")}</p>
            ) : (
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
                {warnings.map((f, i) => (
                  <li key={`w-${i}`}>{t(`operations.checks.${f.code}`)}</li>
                ))}
              </ul>
            )}
          </div>

          <div className={card}>
            <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">
              {t("operations.tasks")}
            </h2>
            <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
              {tasks.map((task, i) => (
                <li key={`t-${i}`} className="flex items-center justify-between gap-3">
                  <span>{t(`operations.checks.${task.code}`)}</span>
                  <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">{task.priority}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-1 text-xs text-slate-400 dark:text-slate-500">
            <p>{t("operations.manualApprovalRequired")}</p>
            <p>{t("operations.noSecretsShown")}</p>
          </div>
        </>
      )}
    </div>
  );
}
