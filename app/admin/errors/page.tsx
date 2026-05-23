"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Bug } from "lucide-react";
import { useTranslations } from "@/lib/i18n";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { EmptyState } from "@/components/empty-state";

type ErrorLog = {
  id: string;
  timestamp: string;
  message: string | null;
  stack: string | null;
  route: string | null;
};

export default function AdminErrorsPage() {
  const t = useTranslations();
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const res = await fetch("/api/admin/errors?limit=50", { cache: "no-store" });
      if (!res.ok) throw new Error("request failed");
      const data = await res.json();
      setErrors(data.errors ?? []);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">
        {t("admin.errors")}
      </h1>

      {loading && <LoadingSkeleton variant="table" />}

      {!loading && failed && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="mb-4 text-slate-500 dark:text-slate-400">{t("common.error")}</p>
          <button
            onClick={load}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {t("admin.retry")}
          </button>
        </div>
      )}

      {!loading && !failed && errors.length === 0 && (
        <EmptyState icon={Bug} title={t("admin.noErrors")} description={t("admin.noErrors")} />
      )}

      {!loading && !failed && errors.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{t("admin.errorTime")}</th>
                <th className="hidden px-4 py-3 font-medium text-slate-700 dark:text-slate-200 sm:table-cell">{t("admin.errorRoute")}</th>
                <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{t("admin.errorMessage")}</th>
              </tr>
            </thead>
            <tbody>
              {errors.map((e) => (
                <Fragment key={e.id}>
                  <tr
                    onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                    className="cursor-pointer border-b border-slate-100 transition last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {format(new Date(e.timestamp), "dd.MM.yyyy HH:mm")}
                    </td>
                    <td className="hidden px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300 sm:table-cell">
                      {e.route ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-900 dark:text-slate-100">
                      {e.message ?? "—"}
                    </td>
                  </tr>
                  {expanded === e.id && e.stack && (
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td colSpan={3} className="bg-slate-50 px-4 py-3 dark:bg-slate-800/40">
                        <pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-xs text-slate-600 dark:text-slate-300">
                          {e.stack}
                        </pre>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
