"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "@/lib/i18n";
import { formatBerlin } from "@/lib/datetime";

type Item = { type: string; severity: "ok" | "warn" | "error"; count: number; autoFixable: boolean };
type Result = { status: "ok" | "warn" | "error"; items: Item[]; repairedTotal: number };
type LogRow = {
  id: string;
  created_at: string;
  problem_type: string;
  action: string;
  result: string;
  dry_run: boolean;
};

export default function AutoMaintenancePage() {
  const t = useTranslations();
  const [result, setResult] = useState<Result | null>(null);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [lastCheck, setLastCheck] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [repairing, setRepairing] = useState(false);

  const loadLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/auto-maintenance/logs");
      const data = await res.json().catch(() => null);
      if (res.ok && data?.logs) setLogs(data.logs);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  async function run(mode: "check" | "repair") {
    const setBusy = mode === "check" ? setChecking : setRepairing;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/auto-maintenance/${mode}`, { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.items) {
        toast.error(t("admin.autoMaintenance.error"));
        return;
      }
      setResult({ status: data.status, items: data.items, repairedTotal: data.repairedTotal });
      setLastCheck(new Date().toISOString());
      if (mode === "repair") {
        toast.success(t("admin.autoMaintenance.repairedCount", { count: data.repairedTotal }));
        loadLogs();
      }
    } catch {
      toast.error(t("admin.autoMaintenance.error"));
    } finally {
      setBusy(false);
    }
  }

  const statusView = result
    ? {
        ok: { icon: CheckCircle2, color: "text-green-600 dark:text-green-400", text: t("admin.autoMaintenance.statusOk") },
        warn: { icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400", text: t("admin.autoMaintenance.statusWarn") },
        error: { icon: XCircle, color: "text-red-600 dark:text-red-400", text: t("admin.autoMaintenance.statusError") },
      }[result.status]
    : null;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t("admin.autoMaintenance.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("admin.autoMaintenance.subtitle")}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => run("check")}
          disabled={checking || repairing}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {checking ? t("admin.autoMaintenance.checking") : t("admin.autoMaintenance.checkAll")}
        </button>
        <button
          onClick={() => run("repair")}
          disabled={checking || repairing}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {repairing ? t("admin.autoMaintenance.repairing") : t("admin.autoMaintenance.repairAll")}
        </button>
      </div>

      {result && statusView && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <statusView.icon className={`h-6 w-6 ${statusView.color}`} />
            <div>
              <p className={`font-semibold ${statusView.color}`}>{statusView.text}</p>
              {lastCheck && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("admin.autoMaintenance.lastCheck")}: {formatBerlin(lastCheck)}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
              {t("admin.autoMaintenance.foundIssues")}
            </h2>
            {result.items.every((i) => i.count === 0) ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t("admin.autoMaintenance.noIssues")}
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {result.items
                  .filter((i) => i.count > 0)
                  .map((i) => (
                    <li key={i.type} className="flex items-center justify-between gap-4">
                      <span className="text-slate-700 dark:text-slate-300">
                        {t(`admin.autoMaintenance.itemLabels.${i.type}`)}
                        {!i.autoFixable && (
                          <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                            ({t("admin.autoMaintenance.notAutoFixable")})
                          </span>
                        )}
                      </span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">{i.count}</span>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
          {t("admin.autoMaintenance.logsTitle")}
        </h2>
        {logs.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("admin.autoMaintenance.noLogs")}
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {logs.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-4">
                <span className="min-w-0 truncate text-slate-700 dark:text-slate-300">{l.result}</span>
                <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
                  {formatBerlin(l.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
