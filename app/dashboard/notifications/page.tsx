"use client";

import { useCallback, useEffect, useState } from "react";
import { formatBerlin } from "@/lib/datetime";
import { Bell } from "lucide-react";
import { useTranslations } from "@/lib/i18n";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { EmptyState } from "@/components/empty-state";

type NotificationEntry = {
  id: string;
  patientName: string | null;
  delivered: boolean;
  status: string | null;
  createdAt: string;
};

const STATUS_STYLE: Record<string, string> = {
  sent: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  prepared: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  skipped_no_provider: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  skipped_no_consent: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  skipped_invalid_phone: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

export default function NotificationsPage() {
  const t = useTranslations();
  const [items, setItems] = useState<NotificationEntry[]>([]);
  const [providerConfigured, setProviderConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) throw new Error("request failed");
      const data = await res.json();
      setItems(data.notifications ?? []);
      setProviderConfigured(data.providerConfigured ?? true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function renderStatus(n: NotificationEntry) {
    // Status bevorzugen; Altzeilen ohne status anhand delivered/Provider abbilden.
    const key =
      n.status ?? (n.delivered ? "sent" : providerConfigured ? "failed" : "skipped_no_provider");
    const cls = STATUS_STYLE[key] ?? STATUS_STYLE.prepared;
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${cls}`}>
        {t(`notification.statusLabels.${key}`)}
      </span>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t("notification.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("notification.intro")}
        </p>
      </div>

      {loading && <LoadingSkeleton variant="table" />}

      {!loading && error && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="mb-4 text-slate-500 dark:text-slate-400">
            {t("common.error")}
          </p>
          <button
            onClick={load}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {t("common.retry")}
          </button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <EmptyState
          icon={Bell}
          title={t("emptyState.noNotifications")}
          description={t("notification.intro")}
        />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                  {t("notification.recipient")}
                </th>
                <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                  {t("notification.sentAt")}
                </th>
                <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                  {t("dashboard.status")}
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((n) => (
                <tr
                  key={n.id}
                  className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3 text-slate-900 dark:text-slate-100">
                    {n.patientName ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {formatBerlin(n.createdAt)}
                  </td>
                  <td className="px-4 py-3">{renderStatus(n)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
