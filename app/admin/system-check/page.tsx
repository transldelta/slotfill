"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "@/lib/i18n";

type Status = "ok" | "warn" | "error";
type Check = { key: string; status: Status; detail?: string };

const STATUS_ICON: Record<Status, typeof CheckCircle2> = {
  ok: CheckCircle2,
  warn: AlertTriangle,
  error: XCircle,
};
const STATUS_COLOR: Record<Status, string> = {
  ok: "text-green-600 dark:text-green-400",
  warn: "text-amber-600 dark:text-amber-400",
  error: "text-red-600 dark:text-red-400",
};

export default function SystemCheckPage() {
  const t = useTranslations();
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [running, setRunning] = useState(false);
  const [repairing, setRepairing] = useState(false);

  async function runCheck() {
    setRunning(true);
    setChecks(null);
    try {
      const res = await fetch("/api/admin/system-check", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.checks) {
        toast.error(t("admin.checkError"));
        return;
      }
      setChecks(data.checks);
    } catch {
      toast.error(t("admin.checkError"));
    } finally {
      setRunning(false);
    }
  }

  async function repair() {
    setRepairing(true);
    try {
      const res = await fetch("/api/admin/repair-onboarding", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok || data?.code !== "REPAIR_DONE") {
        toast.error(t("admin.checkError"));
        return;
      }
      if (data.scanned === 0) {
        toast.success(t("admin.repairNone"));
      } else {
        toast.success(
          t("admin.repairResult", {
            repaired: data.repaired,
            scanned: data.scanned,
            failed: data.failed,
            missingName: data.missingName,
          }),
        );
      }
      // Nach der Reparatur erneut prüfen.
      runCheck();
    } catch {
      toast.error(t("admin.checkError"));
    } finally {
      setRepairing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t("admin.systemCheck")}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("admin.systemCheckSubtitle")}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={runCheck}
          disabled={running || repairing}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {running ? t("admin.checking") : t("admin.runCheck")}
        </button>
        <button
          onClick={repair}
          disabled={running || repairing}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {repairing ? t("admin.repairing") : t("admin.repairAccounts")}
        </button>
      </div>

      {checks && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {checks.map((check) => {
            const Icon = STATUS_ICON[check.status];
            return (
              <div
                key={check.key}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${STATUS_COLOR[check.status]}`} />
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {t(`admin.checkLabels.${check.key}`)}
                  </p>
                  <p className={`text-xs ${STATUS_COLOR[check.status]}`}>
                    {t(`admin.status${check.status === "ok" ? "Ok" : check.status === "warn" ? "Warn" : "Error"}`)}
                  </p>
                  {check.detail && (
                    <p className="mt-1 break-all text-xs text-slate-500 dark:text-slate-400">
                      {check.detail}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
