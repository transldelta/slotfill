"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import {
  CalendarCheck,
  CalendarPlus,
  CheckCircle,
  ListOrdered,
  UserPlus,
  Users,
  Calendar as CalendarIcon,
  User as UserIcon,
  LayoutDashboard,
} from "lucide-react";
import { useTranslations } from "@/lib/i18n";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { EmptyState } from "@/components/empty-state";

type Activity = {
  type: "appointment" | "patient";
  id: string;
  timestamp: string;
  status: string | null;
  patientName: string | null;
};

type Stats = {
  practiceName: string;
  totalPatients: number;
  waitlistCount: number;
  appointmentsToday: number;
  filledToday: number;
  notificationsThisMonth: number;
  revenueSaved: number;
  recentActivity: Activity[];
};

const euro = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

export default function DashboardPage() {
  const t = useTranslations();
  const [stats, setStats] = useState<Stats | null>(null);
  const [notificationLimit, setNotificationLimit] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [statsRes, subRes] = await Promise.all([
        fetch("/api/dashboard/stats", { cache: "no-store" }),
        fetch("/api/subscription", { cache: "no-store" }),
      ]);
      if (!statsRes.ok) throw new Error("stats failed");
      const statsData = await statsRes.json();
      setStats(statsData.stats ?? null);
      if (subRes.ok) {
        const subData = await subRes.json();
        setNotificationLimit(subData.plan?.max_notifications_per_month ?? null);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="card" />
        <LoadingSkeleton variant="list" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="mb-4 text-slate-500 dark:text-slate-400">
          {t("dashboard.statsError")}
        </p>
        <button
          onClick={load}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {t("dashboard.retry")}
        </button>
      </div>
    );
  }

  const isEmpty =
    stats.totalPatients === 0 &&
    stats.waitlistCount === 0 &&
    stats.appointmentsToday === 0 &&
    stats.recentActivity.length === 0;

  const cards = [
    {
      label: t("dashboard.totalPatients"),
      value: stats.totalPatients,
      icon: Users,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300",
    },
    {
      label: t("dashboard.waitlistCount"),
      value: stats.waitlistCount,
      icon: ListOrdered,
      color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300",
    },
    {
      label: t("dashboard.appointmentsToday"),
      value: stats.appointmentsToday,
      icon: CalendarCheck,
      color: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-300",
    },
    {
      label: t("dashboard.filledToday"),
      value: stats.filledToday,
      icon: CheckCircle,
      color: "text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-300",
    },
  ];

  const used = stats.notificationsThisMonth;
  const max = notificationLimit ?? 0;
  const percent = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t("dashboard.welcomeBack")}, {stats.practiceName}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {format(new Date(), "EEEE, d. MMMM yyyy", { locale: de })}
        </p>
      </div>

      {isEmpty ? (
        <EmptyState
          icon={LayoutDashboard}
          title={t("dashboard.emptyTitle")}
          description={t("dashboard.emptyDescription")}
          actionLabel={t("dashboard.newPatient")}
          actionHref="/dashboard/patients/new"
        />
      ) : (
        <>
          {/* Statistik-Karten */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className={`mb-3 inline-flex rounded-lg p-2 ${card.color}`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {card.value}
                </div>
                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {card.label}
                </div>
              </div>
            ))}
          </div>

          {/* Zweite Reihe */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {t("dashboard.notificationsThisMonth")}
              </p>
              <p className="mt-1 mb-3 text-sm text-slate-500 dark:text-slate-400">
                {used} {t("subscription.of")} {max}
              </p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full bg-blue-600"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {t("dashboard.revenueSaved")}
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                {euro.format(stats.revenueSaved)}
              </p>
            </div>
          </div>

          {/* Letzte Aktivitäten */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
              {t("dashboard.recentActivity")}
            </h2>
            {stats.recentActivity.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t("dashboard.noRecentActivity")}
              </p>
            ) : (
              <ul className="space-y-3">
                {stats.recentActivity.map((a) => (
                  <li key={`${a.type}-${a.id}`} className="flex items-center gap-3">
                    <span className="inline-flex rounded-lg bg-slate-100 p-2 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {a.type === "appointment" ? (
                        <CalendarIcon className="h-4 w-4" />
                      ) : (
                        <UserIcon className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-slate-900 dark:text-slate-100">
                        {a.type === "appointment"
                          ? t("dashboard.activityAppointmentCreated")
                          : t("dashboard.activityPatientCreated")}
                        {a.patientName ? ` – ${a.patientName}` : ""}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDistanceToNow(new Date(a.timestamp), {
                          addSuffix: true,
                          locale: de,
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {/* Schnellzugriff */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
          {t("dashboard.quickActions")}
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/patients/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <UserPlus className="h-4 w-4" />
            {t("dashboard.newPatient")}
          </Link>
          <Link
            href="/dashboard/appointments/new"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <CalendarPlus className="h-4 w-4" />
            {t("dashboard.newAppointment")}
          </Link>
          <Link
            href="/dashboard/waitlist"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ListOrdered className="h-4 w-4" />
            {t("dashboard.viewWaitlist")}
          </Link>
        </div>
      </div>
    </div>
  );
}
