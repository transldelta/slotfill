"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useTranslations } from "@/lib/i18n";
import { LoadingSkeleton } from "@/components/loading-skeleton";

type Plan = {
  plan_key: string;
  name: string;
  max_notifications_per_month: number;
};

type Subscription = {
  status: string;
  notifications_used_this_month: number;
  trial_ends_at: string | null;
};

const STATUS_STYLE: Record<string, string> = {
  trial: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  past_due: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
};

const STATUS_LABEL_KEY: Record<string, string> = {
  trial: "subscription.trial",
  active: "subscription.active",
  cancelled: "subscription.cancelled",
  past_due: "subscription.pastDue",
};

const HIGHEST_PLAN = "praxis_plus";

export default function SubscriptionPage() {
  const t = useTranslations();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/subscription", { cache: "no-store" });
      if (!res.ok) throw new Error("request failed");
      const data = await res.json();
      setSubscription(data.subscription ?? null);
      setPlan(data.plan ?? null);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const max = plan?.max_notifications_per_month ?? 0;
  const used = subscription?.notifications_used_this_month ?? 0;
  const limitReached = max > 0 && used >= max;
  const percent = max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0;
  const isHighestPlan = plan?.plan_key === HIGHEST_PLAN;

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">
        {t("subscription.title")}
      </h1>

      {loading && <LoadingSkeleton variant="list" count={3} />}

      {!loading && error && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="mb-4 text-slate-500 dark:text-slate-400">
            {t("subscription.subscriptionError")}
          </p>
          <button
            onClick={load}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {t("subscription.retry")}
          </button>
        </div>
      )}

      {!loading && !error && subscription && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t("subscription.currentPlan")}
                </p>
                <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {plan?.name ?? "—"}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  STATUS_STYLE[subscription.status] ??
                  "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                }`}
              >
                {t(STATUS_LABEL_KEY[subscription.status] ?? "subscription.trial")}
              </span>
            </div>

            {subscription.status === "trial" && subscription.trial_ends_at && (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                {t("subscription.trialEnds")}:{" "}
                {format(new Date(subscription.trial_ends_at), "dd.MM.yyyy")}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {t("subscription.notificationsUsed")}
              </p>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {percent}%
              </span>
            </div>
            <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
              {used} {t("subscription.of")} {max}
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className={`h-full ${limitReached ? "bg-red-500" : "bg-blue-600"}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {limitReached && (
            <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
              {t("subscription.limitReached")}
            </div>
          )}

          {!isHighestPlan && (
            <Link
              href="/pricing"
              className="inline-block rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {t("subscription.upgrade")}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
