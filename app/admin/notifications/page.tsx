"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "@/lib/i18n";
import { LoadingSkeleton } from "@/components/loading-skeleton";

type ByPractice = {
  practiceId: string;
  name: string;
  sent: number;
  delivered: number;
  clicked: number;
  clickRate: number;
};

type NotificationStats = {
  totalSent: number;
  totalDelivered: number;
  totalClicked: number;
  byPractice: ByPractice[];
};

export default function AdminNotificationsPage() {
  const t = useTranslations();
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/notifications/stats", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("request failed");
      const data = await res.json();
      setStats(data.stats ?? null);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingSkeleton variant="card" count={3} />;

  if (error || !stats) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="mb-4 text-slate-500 dark:text-slate-400">{t("common.error")}</p>
        <button
          onClick={load}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {t("admin.retry")}
        </button>
      </div>
    );
  }

  const cards = [
    { label: t("admin.totalSent"), value: stats.totalSent },
    { label: t("admin.totalDelivered"), value: stats.totalDelivered },
    { label: t("admin.totalClicked"), value: stats.totalClicked },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        {t("admin.notifications")}
      </h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {c.value}
            </div>
            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {c.label}
            </div>
          </div>
        ))}
      </div>

      {stats.byPractice.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{t("admin.practiceName")}</th>
                <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{t("admin.totalSent")}</th>
                <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{t("admin.totalDelivered")}</th>
                <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{t("admin.totalClicked")}</th>
                <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{t("admin.clickRate")}</th>
              </tr>
            </thead>
            <tbody>
              {stats.byPractice.map((row) => (
                <tr
                  key={row.practiceId}
                  className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                >
                  <td className="px-4 py-3 text-slate-900 dark:text-slate-100">{row.name}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.sent}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.delivered}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.clicked}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.clickRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
