"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useTranslations } from "@/lib/i18n";

type Plan = {
  name: string;
  max_notifications_per_month: number;
};

type Subscription = {
  status: string;
  notifications_used_this_month: number;
  trial_ends_at: string | null;
};

const STATUS_STYLE: Record<string, string> = {
  trial: "bg-yellow-100 text-yellow-800",
  active: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  past_due: "bg-orange-100 text-orange-800",
};

const STATUS_LABEL_KEY: Record<string, string> = {
  trial: "subscription.trial",
  active: "subscription.active",
  cancelled: "subscription.cancelled",
  past_due: "subscription.pastDue",
};

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

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">{t("subscription.title")}</h1>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-border p-8 text-center">
          <p className="mb-4 text-muted-foreground">{t("subscription.subscriptionError")}</p>
          <button
            onClick={load}
            className="rounded-lg border border-border px-4 py-2 text-sm transition hover:bg-secondary"
          >
            {t("subscription.retry")}
          </button>
        </div>
      )}

      {!loading && !error && subscription && (
        <div className="space-y-6">
          <div className="rounded-lg border border-border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("subscription.currentPlan")}
                </p>
                <p className="text-xl font-semibold">{plan?.name ?? "—"}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  STATUS_STYLE[subscription.status] ?? "bg-gray-100 text-gray-800"
                }`}
              >
                {t(STATUS_LABEL_KEY[subscription.status] ?? "subscription.trial")}
              </span>
            </div>

            {subscription.status === "trial" && subscription.trial_ends_at && (
              <p className="mt-3 text-sm text-muted-foreground">
                {t("subscription.trialEnds")}:{" "}
                {format(new Date(subscription.trial_ends_at), "dd.MM.yyyy")}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-border p-5">
            <p className="mb-2 text-sm font-medium">
              {t("subscription.notificationsUsed")}
            </p>
            <p className="mb-2 text-sm text-muted-foreground">
              {used} {t("subscription.of")} {max}
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-full ${limitReached ? "bg-red-500" : "bg-blue-600"}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {limitReached && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
              {t("subscription.limitReached")}
            </div>
          )}

          <Link
            href="/pricing"
            className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            {t("subscription.upgrade")}
          </Link>
        </div>
      )}
    </div>
  );
}
