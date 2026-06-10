"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Check } from "lucide-react";
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

export default function LocalePricingPage() {
  const t = useTranslations("pricing");
  const tNav = useTranslations("nav");
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
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        <p className="mt-1 text-sm text-primary">{t("trial")}</p>
      </div>

      {/* Value proposition */}
      <p className="mb-8 text-center text-sm font-medium text-green-700 dark:text-green-400">
        💡 {t("valueProposition")}
      </p>

      {loading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="py-4 text-center text-muted-foreground">
          {t("plansError")}
        </p>
      )}

      {!loading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {!error &&
            plans.map((plan) => {
              const isPopular = plan.plan_key === "professional";
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-xl border p-6 shadow-sm ${
                    isPopular
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                      : "border-border bg-secondary/10"
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-semibold text-white whitespace-nowrap">
                      {t("popularBadge")}
                    </span>
                  )}
                  <h2 className="text-xl font-semibold">{plan.name}</h2>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price_monthly} €</span>
                    <span className="text-sm text-muted-foreground">
                      {t("monthly")}
                    </span>
                  </div>

                  <p className="mt-6 mb-3 text-sm font-medium">{t("features")}</p>
                  <ul className="flex-1 space-y-2 text-sm">
                    {(plan.feature_keys ?? []).map((key) => (
                      <li key={key} className="flex items-center gap-2">
                        <Check className="h-4 w-4 shrink-0 text-green-600" />
                        <span>{t(`featureKeys.${key}`)}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => startCheckout(plan.plan_key)}
                    disabled={pending !== null}
                    className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {pending === plan.plan_key
                      ? tCommon("loading")
                      : t(CTA_BY_KEY[plan.plan_key] ?? "ctaStarter")}
                  </button>
                </div>
              );
            })}

          {/* Enterprise – static card, always visible */}
          <div className="flex flex-col rounded-xl border border-border bg-secondary/10 p-6 shadow-sm">
            <h2 className="text-xl font-semibold">{t("enterpriseName")}</h2>
            <div className="mt-4">
              <span className="text-2xl font-bold leading-tight">
                {t("enterprisePriceLabel")}
              </span>
            </div>

            <p className="mt-6 mb-3 text-sm font-medium">{t("features")}</p>
            <ul className="flex-1 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-green-600" />
                <span>{t("featureKeys.everythingInProfessional")}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-green-600" />
                <span>{t("featureKeys.unlimitedPatients")}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-green-600" />
                <span>{t("featureKeys.prioritySupport")}</span>
              </li>
            </ul>

            <a
              href={`/${locale}/kontakt`}
              className="mt-6 block w-full rounded-lg border border-blue-600 px-4 py-2.5 text-center text-sm font-medium text-blue-600 transition hover:bg-blue-50 dark:hover:bg-blue-950/30"
            >
              {t("ctaEnterprise")}
            </a>
          </div>
        </div>
      )}

      {/* Trial & Provider info box */}
      <div className="mt-10 rounded-xl border border-blue-200 bg-blue-50 px-6 py-5 text-sm text-blue-800 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-300">
        <p className="font-semibold">{t("trialInfo")}</p>
        <ul className="mt-2 space-y-1 list-none">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-green-500" />
            {t("trialNoCreditCard")}
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-green-500" />
            {t("trialNoSms")}
          </li>
        </ul>
        <p className="mt-3 text-xs text-blue-600 dark:text-blue-400">
          {t("providerCostNote")}
        </p>
      </div>

      {/* Stripe not live + price variation notes */}
      <div className="mt-4 space-y-1 text-center text-xs text-muted-foreground">
        <p>{t("stripeNotLive")}</p>
        <p>{t("priceNote")}</p>
      </div>
    </main>
  );
}
