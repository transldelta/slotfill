"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Bell, Building2, CheckCircle, Clock, Mail, Percent, Users } from "lucide-react";
import { useTranslations } from "@/lib/i18n";
import { LoadingSkeleton } from "@/components/loading-skeleton";

type LeadStats = {
  real_contacts: number;
  test_contacts: number;
  real_bookings: number;
  test_bookings: number;
  last_real_contact_at: string | null;
  last_real_booking_at: string | null;
};

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
  const [leadStats, setLeadStats] = useState<LeadStats | null>(null);
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const [statsRes, errRes, leadRes] = await Promise.all([
        fetch("/api/admin/stats", { cache: "no-store" }),
        fetch("/api/admin/errors?limit=5", { cache: "no-store" }),
        fetch("/api/admin/lead-stats", { cache: "no-store" }),
      ]);
      if (!statsRes.ok) throw new Error("stats failed");
      const statsData = await statsRes.json();
      setStats(statsData.stats ?? null);
      if (errRes.ok) {
        const errData = await errRes.json();
        setErrors(errData.errors ?? []);
      }
      if (leadRes.ok) {
        setLeadStats(await leadRes.json());
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

      {/* ── Real Lead Status Box ────────────────────────────────────── */}
      <div className="rounded-2xl border border-green-100 bg-green-50 p-5 shadow-sm dark:border-green-900/20 dark:bg-green-900/10">
        <div className="mb-3 flex items-center gap-2">
          <Mail className="h-4 w-4 text-green-700 dark:text-green-400" />
          <span className="text-sm font-semibold text-green-800 dark:text-green-300">
            Echte Anfragen (Lead-Status)
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Echte Kontaktanfragen */}
          <Link
            href="/admin/contact-messages"
            className="rounded-xl border border-green-100 bg-white px-4 py-3 transition hover:border-green-300 dark:border-green-900/30 dark:bg-slate-900"
          >
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {leadStats?.real_contacts ?? (loading ? "…" : "0")}
            </div>
            <div className="mt-0.5 text-xs text-green-700 dark:text-green-400">
              Echte Kontaktanfragen
            </div>
          </Link>

          {/* Echte Buchungsanfragen */}
          <Link
            href="/admin/booking-requests"
            className="rounded-xl border border-green-100 bg-white px-4 py-3 transition hover:border-green-300 dark:border-green-900/30 dark:bg-slate-900"
          >
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {leadStats?.real_bookings ?? (loading ? "…" : "0")}
            </div>
            <div className="mt-0.5 text-xs text-green-700 dark:text-green-400">
              Echte Buchungsanfragen
            </div>
          </Link>

          {/* Testdaten Kontakt */}
          <div className="rounded-xl border border-amber-100 bg-white px-4 py-3 dark:border-amber-900/20 dark:bg-slate-900">
            <div className="text-2xl font-bold text-slate-400 dark:text-slate-500">
              {leadStats?.test_contacts ?? (loading ? "…" : "0")}
            </div>
            <div className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">
              Test-Kontaktanfragen
            </div>
          </div>

          {/* Testdaten Buchung */}
          <div className="rounded-xl border border-amber-100 bg-white px-4 py-3 dark:border-amber-900/20 dark:bg-slate-900">
            <div className="text-2xl font-bold text-slate-400 dark:text-slate-500">
              {leadStats?.test_bookings ?? (loading ? "…" : "0")}
            </div>
            <div className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">
              Test-Buchungsanfragen
            </div>
          </div>
        </div>

        {/* Letzte echte Anfrage */}
        <div className="mt-3 rounded-xl border border-green-100 bg-white px-4 py-2.5 dark:border-green-900/30 dark:bg-slate-900">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Letzte echte Anfrage:{" "}
          </span>
          <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
            {loading
              ? "…"
              : (() => {
                  const dates = [
                    leadStats?.last_real_contact_at,
                    leadStats?.last_real_booking_at,
                  ]
                    .filter(Boolean)
                    .map((d) => new Date(d!).getTime());
                  if (dates.length === 0) return "Noch keine echten Anfragen";
                  return new Date(Math.max(...dates)).toLocaleString("de-DE");
                })()}
          </span>
        </div>

        <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400">
          Testdaten (is_test = true) werden getrennt und nicht als echte Leads
          gezählt.
        </p>
      </div>

      {/* ── System-Statistiken (Waitlist/Dashboard-System) ──────────── */}
      <div>
        <p className="mb-3 text-xs text-slate-400 dark:text-slate-500">
          System-Kennzahlen (Praxis-Dashboard / Wartelisten-System) –
          ausschließlich Demo- und Testdaten bis zum ersten echten Kunden.
        </p>
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
