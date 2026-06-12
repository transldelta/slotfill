"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Check, Zap, TrendingUp, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Locale } from "@/i18n/routing";

type Plan = {
  id: string;
  plan_key: string;
  name: string;
  price_monthly: number;
  feature_keys: string[];
};

const CTA_BY_KEY: Record<string, string> = {
  starter: "ctaStarter",
  professional: "ctaProfessional",
  praxis_plus: "ctaClinicPro",
};

type PlanMeta = {
  subtitle: string;
  badge?: string;
  badgeColor?: "blue" | "emerald";
  icon: React.ElementType;
  highlight?: boolean;
};

const PLAN_META: Record<string, PlanMeta> = {
  starter: {
    subtitle: "Ideal für einzelne Praxen, die digitale Anfragen einführen möchten.",
    icon: Zap,
  },
  professional: {
    subtitle: "Für wachsende Praxisteams mit höherem Anfragevolumen.",
    badge: "Empfohlen",
    badgeColor: "blue",
    icon: TrendingUp,
    highlight: true,
  },
  praxis_plus: {
    subtitle: "Für größere Praxen, MVZ und Einrichtungen mit mehreren Behandlern.",
    badge: "Premium",
    badgeColor: "emerald",
    icon: Building2,
  },
};

export default function LocalePricingPage() {
  const t = useTranslations("pricing");
  const tCommon = useTranslations("common");
  const tSub = useTranslations("subscription");
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) ?? "de";

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/plans", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.code === "PLANS_LOADED") setPlans(data.plans ?? []);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  async function startCheckout(planKey: string) {
    setPending(planKey);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey }),
      });

      if (res.status === 401) {
        router.push("/auth/login");
        return;
      }

      const data = await res.json().catch(() => null);
      if (data?.code === "CHECKOUT_SESSION_CREATED" && data.url) {
        window.location.href = data.url;
        return;
      }
      if (data?.code === "STRIPE_PRICE_MISSING") {
        toast.error(t("stripePriceMissing"));
        return;
      }
      if (data?.code === "STRIPE_NOT_CONFIGURED") {
        router.push(`/${locale}/kontakt`);
        return;
      }
      toast.error(tSub("checkoutError"));
    } catch {
      toast.error(tSub("checkoutError"));
    } finally {
      setPending(null);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-4 flex justify-end">
        <LanguageSwitcher currentLocale={locale as Locale} currentPath="/pricing" />
      </div>

      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">{t("subtitle")}</p>
        <p className="mt-1 text-sm font-medium text-blue-600 dark:text-blue-400">{t("trial")}</p>
      </div>

      {/* Value proposition */}
      <p className="mb-8 text-center text-sm font-medium text-emerald-700 dark:text-emerald-400">
        💡 {t("valueProposition")}
      </p>

      {/* Loading skeleton — 3 cards */}
      {loading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-96 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="py-4 text-center text-slate-500">{t("plansError")}</p>
      )}

      {/* Plan cards — 3 columns */}
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const meta = PLAN_META[plan.plan_key] ?? {
              subtitle: "",
              icon: Zap,
            };
            const Icon = meta.icon;
            const isHighlight = meta.highlight ?? false;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border p-7 shadow-sm transition ${
                  isHighlight
                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500/30 dark:bg-blue-950/20"
                    : plan.plan_key === "praxis_plus"
                    ? "border-emerald-300 bg-emerald-50/50 dark:border-emerald-800/60 dark:bg-emerald-950/10"
                    : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                }`}
              >
                {/* Badge */}
                {meta.badge && (
                  <span
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-semibold text-white whitespace-nowrap ${
                      meta.badgeColor === "emerald"
                        ? "bg-emerald-600"
                        : "bg-blue-600"
                    }`}
                  >
                    {meta.badge}
                  </span>
                )}

                {/* Plan header */}
                <div className="flex items-start gap-3 mb-5">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      isHighlight
                        ? "bg-blue-600 text-white"
                        : plan.plan_key === "praxis_plus"
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {plan.name}
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-snug">
                      {meta.subtitle}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                    {plan.price_monthly} €
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {t("monthly")}
                  </span>
                </div>

                {/* Features */}
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {t("features")}
                </p>
                <ul className="flex-1 space-y-2 text-sm">
                  {(plan.feature_keys ?? []).map((key) => (
                    <li key={key} className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span className="text-slate-700 dark:text-slate-300">
                        {t(`featureKeys.${key}`)}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => startCheckout(plan.plan_key)}
                  disabled={pending !== null}
                  className={`mt-7 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    isHighlight
                      ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
                      : plan.plan_key === "praxis_plus"
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500"
                      : "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
                  }`}
                >
                  {pending === plan.plan_key
                    ? tCommon("loading")
                    : t(CTA_BY_KEY[plan.plan_key] ?? "ctaStarter")}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Trial & info box */}
      <div className="mt-12 rounded-2xl border border-blue-100 bg-blue-50 px-6 py-6 dark:border-blue-900/40 dark:bg-blue-900/10">
        <p className="font-semibold text-blue-900 dark:text-blue-200">{t("trialInfo")}</p>
        <ul className="mt-3 space-y-1.5 text-sm text-blue-800 dark:text-blue-300">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-emerald-500" />
            {t("trialNoCreditCard")}
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-emerald-500" />
            {t("trialNoSms")}
          </li>
        </ul>
        <p className="mt-4 text-xs text-blue-600 dark:text-blue-400">
          {t("providerCostNote")}
        </p>
      </div>

      {/* Stripe soft-launch + price note */}
      <div className="mt-4 space-y-1 text-center text-xs text-slate-400 dark:text-slate-500">
        <p>{t("stripeNotLive")}</p>
        <p>{t("priceNote")}</p>
      </div>
    </main>
  );
}
