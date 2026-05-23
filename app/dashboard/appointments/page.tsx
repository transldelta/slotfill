"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useTranslations } from "@/lib/i18n";
import { ConfirmDialog } from "@/components/confirm-dialog";

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
  links: { slug: string; patient_id: string }[];
};

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
    if (!res.ok || !data) {
      toast.error(t("notification.sendError"));
      return;
    }
    if (data.code === "WAITLIST_EMPTY") {
      toast(t("notification.waitlistEmpty"));
      return;
    }
    if (data.code === "NOTIFICATIONS_PREPARED") {
      toast.success(t("notification.notificationsPrepared"));
      setPrepared({ count: data.count, links: data.links });
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
  const statusColor: Record<Appointment["status"], string> = {
    scheduled: "bg-blue-100 text-blue-800",
    cancelled: "bg-amber-100 text-amber-800",
    filled: "bg-green-100 text-green-800",
  };

  const tabs: Filter[] = ["all", "scheduled", "cancelled", "filled"];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{t("appointments.title")}</h1>
        <Link
          href="/dashboard/appointments/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          {t("appointments.newAppointment")}
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              filter === tab
                ? "bg-blue-600 text-white"
                : "border border-border hover:bg-secondary"
            }`}
          >
            {t(`appointments.${tab}`)}
          </button>
        ))}
      </div>

      {prepared && (
        <div className="mb-4 rounded-lg border border-border bg-secondary/20 p-4 text-sm">
          <p className="font-medium">
            {t("notification.notificationsPrepared")} ({prepared.count})
          </p>
          <p className="mb-2 text-muted-foreground">{t("notification.whatsappPlaceholder")}</p>
          <p className="mb-1 font-medium">{t("notification.previewLinks")}:</p>
          <ul className="space-y-1">
            {prepared.links.map((link) => (
              <li key={link.slug} className="break-all font-mono text-xs">
                {typeof window !== "undefined" ? window.location.origin : ""}
                /fill/{link.slug}
              </li>
            ))}
          </ul>
        </div>
      )}

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 w-full animate-pulse rounded bg-gray-200" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-border p-8 text-center">
          <p className="mb-4 text-muted-foreground">{t("common.error")}</p>
          <button
            onClick={load}
            className="rounded-lg border border-border px-4 py-2 text-sm transition hover:bg-secondary"
          >
            {t("common.retry")}
          </button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          {t("appointments.noAppointments")}
        </p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-border bg-secondary/30">
              <tr>
                <th className="px-4 py-3 font-medium">{t("appointments.dateLabel")}</th>
                <th className="px-4 py-3 font-medium">{t("appointments.patientLabel")}</th>
                <th className="px-4 py-3 font-medium">{t("appointments.statusLabel")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("patients.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-border transition last:border-0 hover:bg-secondary/20"
                >
                  <td className="px-4 py-3">
                    {format(new Date(a.scheduledTime), "dd.MM.yyyy HH:mm")}
                  </td>
                  <td className="px-4 py-3">
                    {a.filledByPatientName ?? a.patientName ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${statusColor[a.status]}`}
                    >
                      {statusLabel[a.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      {a.status === "scheduled" && (
                        <button
                          onClick={() => setToCancel(a)}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs text-amber-700 transition hover:bg-amber-50"
                        >
                          {t("appointments.cancelled")}
                        </button>
                      )}
                      {a.status === "cancelled" && (
                        <button
                          onClick={() => notifyWaitlist(a)}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
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
