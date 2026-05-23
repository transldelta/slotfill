"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Bell, Building2, CheckCircle, Clock, Percent, Users } from "lucide-react";
import { useTranslations } from "@/lib/i18n";
import { LoadingSkeleton } from "@/components/loading-skeleton";

type Stats = {
  totalPractices: number;
  activePractices: number;
  trialPractices: number;
  mrr: number;
  totalRevenue: number;
  notificationsSent: number;
  fillRate: number;
};

type ErrorLog = {
  id: string;
  timestamp: string;
  message: string | null;
  route: string | null;
};

const euro = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

export default function AdminOverviewPage() {
  const t = useTranslations();
  const [stats, setStats] = useState<Stats | null>(null);
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const [statsRes, errRes] = await Promise.all([
        fetch("/api/admin/stats", { cache: "no-store" }),
        fetch("/api/admin/errors?limit=5", { cache: "no-store" }),
      ]);
      if (!statsRes.ok) throw new Error("stats failed");
      const statsData = await statsRes.json();
      setStats(statsData.stats ?? null);
      if (errRes.ok) {
        const errData = await errRes.json();
        setErrors(errData.errors ?? []);
      }
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingSkeleton variant="card" count={6} />;

  if (failed || !stats) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="mb-4 text-slate-500 dark:text-slate-400">
          {t("admin.accessDenied")}
        </p>
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
    { label: t("admin.totalPractices"), value: stats.totalPractices, icon: Building2, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300" },
    { label: t("admin.activePractices"), value: stats.activePractices, icon: CheckCircle, color: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-300" },
    { label: t("admin.trialPractices"), value: stats.trialPractices, icon: Clock, color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-300" },
    { label: t("admin.mrr"), value: euro.format(stats.mrr), icon: Users, color: "text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-300" },
    { label: t("admin.notificationsSent"), value: stats.notificationsSent, icon: Bell, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-300" },
    { label: t("admin.fillRate"), value: `${stats.fillRate}%`, icon: Percent, color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        {t("admin.overview")}
      </h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className={`mb-3 inline-flex rounded-lg p-2 ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {card.value}
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {card.label}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {t("admin.recentErrors")}
          </h2>
          <Link
            href="/admin/errors"
            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            {t("admin.errors")}
          </Link>
        </div>
        {errors.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("admin.noErrors")}
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {errors.map((e) => (
              <li key={e.id} className="flex justify-between gap-4">
                <span className="truncate text-slate-900 dark:text-slate-100">
                  {e.message ?? "—"}
                </span>
                <span className="shrink-0 text-slate-500 dark:text-slate-400">
                  {format(new Date(e.timestamp), "dd.MM.yyyy HH:mm")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
