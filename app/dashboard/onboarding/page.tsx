"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { useTranslations } from "@/lib/i18n";
import { LoadingSkeleton } from "@/components/loading-skeleton";

type StepKey =
  | "account"
  | "patient"
  | "waitlist"
  | "appointment"
  | "cancel"
  | "notify"
  | "notifications"
  | "fillLink"
  | "done";

type Flags = {
  patient: boolean;
  waitlist: boolean;
  appointment: boolean;
  cancelled: boolean;
  notification: boolean;
};

const STEP_HREF: Partial<Record<StepKey, string>> = {
  patient: "/dashboard/patients/new",
  waitlist: "/dashboard/waitlist",
  appointment: "/dashboard/appointments/new",
  cancel: "/dashboard/appointments",
  notify: "/dashboard/appointments",
  notifications: "/dashboard/notifications",
  fillLink: "/dashboard/appointments",
};

export default function OnboardingPage() {
  const t = useTranslations();
  const [flags, setFlags] = useState<Flags | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, wRes, aRes, nRes] = await Promise.all([
        fetch("/api/patients", { cache: "no-store" }),
        fetch("/api/waitlist", { cache: "no-store" }),
        fetch("/api/appointments", { cache: "no-store" }),
        fetch("/api/notifications", { cache: "no-store" }),
      ]);
      const p = pRes.ok ? await pRes.json() : { patients: [] };
      const w = wRes.ok ? await wRes.json() : { entries: [] };
      const a = aRes.ok ? await aRes.json() : { appointments: [] };
      const n = nRes.ok ? await nRes.json() : { notifications: [] };
      const appts = a.appointments ?? [];
      setFlags({
        patient: (p.patients ?? []).length > 0,
        waitlist: (w.entries ?? []).length > 0,
        appointment: appts.length > 0,
        cancelled: appts.some(
          (x: { status?: string }) => x.status === "cancelled" || x.status === "filled",
        ),
        notification: (n.notifications ?? []).length > 0,
      });
    } catch {
      setFlags({ patient: false, waitlist: false, appointment: false, cancelled: false, notification: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const done = (key: StepKey): boolean => {
    if (!flags) return false;
    switch (key) {
      case "account":
        return true;
      case "patient":
        return flags.patient;
      case "waitlist":
        return flags.waitlist;
      case "appointment":
        return flags.appointment;
      case "cancel":
      case "notify":
      case "fillLink":
        return flags.cancelled;
      case "notifications":
        return flags.notification;
      case "done":
        return flags.notification && flags.cancelled;
      default:
        return false;
    }
  };

  const steps: StepKey[] = [
    "account",
    "patient",
    "waitlist",
    "appointment",
    "cancel",
    "notify",
    "notifications",
    "fillLink",
    "done",
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t("onboarding.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("onboarding.subtitle")}
        </p>
      </div>

      <p className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-300">
        {t("onboarding.testModeHint")}
      </p>

      {loading && <LoadingSkeleton variant="list" count={5} />}

      {!loading && (
        <ol className="space-y-3">
          {steps.map((key) => {
            const isDone = done(key);
            const href = STEP_HREF[key];
            return (
              <li
                key={key}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                {isDone ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
                ) : (
                  <Circle className="mt-0.5 h-5 w-5 shrink-0 text-slate-400 dark:text-slate-500" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {t(`onboarding.steps.${key}`)}
                    </p>
                    <span
                      className={`shrink-0 text-xs ${isDone ? "text-green-600 dark:text-green-400" : "text-slate-400 dark:text-slate-500"}`}
                    >
                      {isDone ? t("onboarding.completed") : t("onboarding.open")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {t(`onboarding.hints.${key}`)}
                  </p>
                  {href && (
                    <Link
                      href={href}
                      className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {t("onboarding.go")}
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
