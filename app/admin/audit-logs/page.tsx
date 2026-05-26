"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslations } from "@/lib/i18n";
import { formatBerlin } from "@/lib/datetime";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { EmptyState } from "@/components/empty-state";
import { ScrollText } from "lucide-react";

type AuditRow = {
  id: string;
  created_at: string;
  actor_email: string | null;
  action: string;
  area: string;
  status: string;
};

export default function AuditLogsPage() {
  const t = useTranslations();
  const [logs, setLogs] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/audit-logs", { cache: "no-store" });
      const data = await res.json().catch(() => null);
      if (!res.ok || data?.code !== "AUDIT_LOGS_LOADED") {
        toast.error(t("auditLogs.error"));
        setError(true);
        return;
      }
      setLogs(data.logs ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t("auditLogs.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("auditLogs.subtitle")}
        </p>
      </div>

      {loading && <LoadingSkeleton variant="table" />}

      {!loading && error && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="mb-4 text-slate-500 dark:text-slate-400">{t("auditLogs.error")}</p>
          <button
            onClick={load}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {t("auditLogs.retry")}
          </button>
        </div>
      )}

      {!loading && !error && logs.length === 0 && (
        <EmptyState icon={ScrollText} title={t("auditLogs.empty")} description={t("auditLogs.noSecretsShown")} />
      )}

      {!loading && !error && logs.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{t("auditLogs.createdAt")}</th>
                <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{t("auditLogs.area")}</th>
                <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{t("auditLogs.action")}</th>
                <th className="hidden px-4 py-3 font-medium text-slate-700 dark:text-slate-200 sm:table-cell">{t("auditLogs.actor")}</th>
                <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{t("auditLogs.status")}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatBerlin(l.created_at)}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{l.area}</td>
                  <td className="px-4 py-3 text-slate-900 dark:text-slate-100">{l.action}</td>
                  <td className="hidden px-4 py-3 text-slate-500 dark:text-slate-400 sm:table-cell">{l.actor_email ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{l.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-slate-400 dark:text-slate-500">{t("auditLogs.noSecretsShown")}</p>
    </div>
  );
}
