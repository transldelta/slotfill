"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Check, Zap, TrendingUp, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Locale } from "@/i18n/routing";
import { getPricingContent, type PlanKey } from "@/lib/pricing-content";

// ─── DB plan shape (name + price come from the API; features are hardcoded below) ─

type Plan = {
  id: string;
  plan_key: string;
  name: string;
  price_monthly: number;
};

// Visual emphasis per plan key. All TEXT is localized in lib/pricing-content.ts.
const PLAN_META: Record<string, { icon: React.ElementType; recommended?: boolean; premium?: boolean }> = {
  starter: { icon: Zap },
  professional: { icon: TrendingUp, recommended: true },
  praxis_plus: { icon: Building2, premium: true },
};


export default function LocalePricingPage() {
  const t = useTranslations("pricing");
  const tCommon = useTranslations("common");
  const tSub = useTranslations("subscription");
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) ?? "de";
  const pc = getPricingContent(locale);

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
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/30 to-white dark:from-indigo-950/10 dark:to-transparent">
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-4 flex justify-end">
        <LanguageSwitcher currentLocale={locale as Locale} currentPath="/pricing" />
      </div>

      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          {pc.header}
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">{pc.intro}</p>
      </div>

      {/* Value proposition */}
      <p className="mb-8 text-center text-sm font-medium text-emerald-700 dark:text-emerald-400">
        💡 {t("valueProposition")}
      </p>

      {/* Loading skeleton — 3 cards */}
      {loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[420px] animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="py-4 text-center text-slate-500">{t("plansError")}</p>
      )}

      {/* Plan cards — 3 columns, features hardcoded per plan */}
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const pm = PLAN_META[plan.plan_key];
            if (!pm) return null;
            const key = plan.plan_key as PlanKey;

            const Icon = pm.icon;
            const isHighlight = pm.recommended ?? false;
            const isClinicPro = plan.plan_key === "praxis_plus";
            const badge = pm.recommended ? pc.badgeRecommended : pm.premium ? pc.badgePremium : null;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border p-7 shadow-sm transition-all duration-200 ${
                  isHighlight
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20 hover:shadow-lg dark:bg-blue-950/20"
                    : isClinicPro
                    ? "border-emerald-200 bg-white hover:border-emerald-300 hover:shadow-md dark:border-emerald-800/40 dark:bg-slate-900"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                }`}
              >
                {/* Badge */}
                {badge && (
                  <span
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-semibold text-white whitespace-nowrap ${
                      pm.premium ? "bg-emerald-600" : "bg-blue-600"
                    }`}
                  >
                    {badge}
                  </span>
                )}

                {/* Plan header */}
                <div className="flex items-start gap-3 mb-5">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      isHighlight
                        ? "bg-blue-600 text-white"
                        : isClinicPro
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {pc.planName[key] ?? plan.name}
                    </h2>
                    <p className="mt-0.5 text-xs leading-snug text-slate-500 dark:text-slate-400">
                      {pc.subtitle[key]}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                    {plan.price_monthly} €
                  </span>
                  <span className="text-sm text-slate-400 dark:text-slate-500">
                    {t("monthly")}
                  </span>
                </div>

                {/* Divider */}
                <div className={`mb-5 border-t ${
                  isHighlight
                    ? "border-blue-200/70 dark:border-blue-800/40"
                    : isClinicPro
                    ? "border-emerald-100/80 dark:border-emerald-900/30"
                    : "border-slate-100 dark:border-slate-800"
                }`} />

                {/* Features — localized in lib/pricing-content.ts */}
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  {pc.featuresLabel}
                </p>
                <ul className="flex-1 space-y-2.5 text-sm">
                  {pc.features[key].map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          isHighlight
                            ? "text-blue-600"
                            : isClinicPro
                            ? "text-emerald-600"
                            : "text-emerald-600"
                        }`}
                      />
                      <span className="text-slate-700 dark:text-slate-300">
                        {feature}
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
                      : isClinicPro
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500"
                      : "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
                  }`}
                >
                  {pending === plan.plan_key ? tCommon("loading") : pc.requestAccess}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Clinic access — pricing logic note */}
      <div className="mt-12 rounded-2xl border border-blue-100 bg-blue-50 px-6 py-6 dark:border-blue-900/40 dark:bg-blue-900/10">
        <p className="text-sm font-medium text-blue-900 dark:text-blue-200">{pc.priceLogicNote}</p>
        <p className="mt-3 flex items-start gap-2 text-sm text-blue-800 dark:text-blue-300">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
          {t("providerCostNote")}
        </p>
      </div>

      {/* Access note */}
      <div className="mt-4 space-y-1 text-center text-xs text-slate-400 dark:text-slate-500">
        <p>{t("stripeNotLive")}</p>
      </div>
    </main>
    </div>
  );
}
