"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Calendar, CalendarPlus } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "@/lib/i18n";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { LoadingSkeleton } from "@/components/loading-skeleton";

type Appointment = {
  id: string;
  scheduledTime: string;
  status: "scheduled" | "cancelled" | "filled";
  patientName: string | null;
  filledByPatientName: string | null;
};

type Filter = "all" | "scheduled" | "cancelled" | "filled";

type PreparedLinks = {
  count: number;
  delivered: number;
  links: { slug: string; patient_id: string }[];
};

const STATUS_COLOR: Record<Appointment["status"], string> = {
  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  cancelled: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  filled: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

function dayBucket(iso: string): "today" | "tomorrow" | "later" {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (sameDay(d, now)) return "today";
  if (sameDay(d, tomorrow)) return "tomorrow";
  return "later";
}

export default function AppointmentsPage() {
  const t = useTranslations();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [toCancel, setToCancel] = useState<Appointment | null>(null);
  const [prepared, setPrepared] = useState<PreparedLinks | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/appointments", { cache: "no-store" });
      if (!res.ok) throw new Error("request failed");
      const data = await res.json();
      setAppointments(data.appointments ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function confirmCancel() {
    if (!toCancel) return;
    const appointment = toCancel;
    setToCancel(null);
    const res = await fetch(`/api/appointments/${appointment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    if (!res.ok) {
      toast.error(t("common.error"));
      return;
    }
    toast.success(t("appointments.cancelledSuccess"));
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appointment.id ? { ...a, status: "cancelled" } : a,
      ),
    );
  }

  async function notifyWaitlist(appointment: Appointment) {
    setPrepared(null);
    const res = await fetch("/api/notifications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointment_id: appointment.id }),
    });
    const data = await res.json().catch(() => null);
    if (data?.code === "LIMIT_REACHED") {
      toast.error(t("subscription.limitReached"));
      return;
    }
    if (!res.ok || !data) {
      toast.error(t("notification.sendError"));
      return;
    }
    if (data.code === "WAITLIST_EMPTY") {
      toast(t("notification.waitlistEmpty"));
      return;
    }
    if (data.code === "NO_OPTED_IN_PATIENTS") {
      toast(t("notification.noOptInPatients"));
      return;
    }
    if (data.code === "NOTIFICATIONS_PREPARED") {
      toast.success(
        t("notification.notificationsSent", {
          delivered: data.delivered ?? 0,
          count: data.count ?? 0,
        }),
      );
      setPrepared({
        count: data.count,
        delivered: data.delivered ?? 0,
        links: data.links,
      });
      return;
    }
    toast.error(t("notification.sendError"));
  }

  const filtered = appointments.filter((a) =>
    filter === "all" ? true : a.status === filter,
  );

  const statusLabel: Record<Appointment["status"], string> = {
    scheduled: t("appointments.scheduled"),
    cancelled: t("appointments.cancelled"),
    filled: t("appointments.filled"),
  };

  const groups: { key: "today" | "tomorrow" | "later"; label: string }[] = [
    { key: "today", label: t("dashboard.today") },
    { key: "tomorrow", label: t("dashboard.tomorrow") },
    { key: "later", label: t("dashboard.later") },
  ];

  const tabs: Filter[] = ["all", "scheduled", "cancelled", "filled"];

  function renderTable(list: Appointment[]) {
    return (
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                {t("appointments.dateLabel")}
              </th>
              <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                {t("appointments.patientLabel")}
              </th>
              <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                {t("appointments.statusLabel")}
              </th>
              <th className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-200">
                {t("patients.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr
                key={a.id}
                className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
              >
                <td className="px-4 py-3 text-slate-900 dark:text-slate-100">
                  {format(new Date(a.scheduledTime), "dd.MM.yyyy HH:mm")}
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                  {a.filledByPatientName ?? a.patientName ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${STATUS_COLOR[a.status]}`}
                  >
                    {statusLabel[a.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap justify-end gap-2">
                    {a.status === "scheduled" && (
                      <button
                        onClick={() => setToCancel(a)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-amber-700 transition hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-slate-700 dark:text-amber-400 dark:hover:bg-amber-900/20"
                      >
                        {t("appointments.cancelled")}
                      </button>
                    )}
                    {a.status === "cancelled" && (
                      <button
                        onClick={() => notifyWaitlist(a)}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {t("appointments.notifyWaitlist")}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t("appointments.title")}
        </h1>
        <a
          href="/dashboard/appointments/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <CalendarPlus className="h-4 w-4" />
          {t("appointments.newAppointment")}
        </a>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              filter === tab
                ? "bg-blue-600 text-white"
                : "border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            {t(`appointments.${tab}`)}
          </button>
        ))}
      </div>

      {prepared && (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="mb-2 font-medium text-slate-900 dark:text-slate-100">
            {t("notification.notificationsSent", {
              delivered: prepared.delivered,
              count: prepared.count,
            })}
          </p>
          <p className="mb-1 font-medium text-slate-700 dark:text-slate-200">
            {t("notification.previewLinks")}:
          </p>
          <ul className="space-y-1">
            {prepared.links.map((link) => (
              <li
                key={link.slug}
                className="break-all font-mono text-xs text-slate-500 dark:text-slate-400"
              >
                {typeof window !== "undefined" ? window.location.origin : ""}
                /fill/{link.slug}
              </li>
            ))}
          </ul>
        </div>
      )}

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

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          icon={Calendar}
          title={t("emptyState.noAppointments")}
          description={t("dashboard.welcomeIntro")}
          actionLabel={t("appointments.newAppointment")}
          actionHref="/dashboard/appointments/new"
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-6">
          {groups.map((group) => {
            const list = filtered.filter(
              (a) => dayBucket(a.scheduledTime) === group.key,
            );
            if (list.length === 0) return null;
            return (
              <div key={group.key}>
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {group.label}
                </h2>
                {renderTable(list)}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={toCancel !== null}
        message={t("appointments.cancelConfirm")}
        confirmLabel={t("appointments.cancelled")}
        cancelLabel={t("common.cancel")}
        onConfirm={confirmCancel}
        onCancel={() => setToCancel(null)}
      />
    </div>
  );
}
