"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "@/lib/i18n";

type Plan = {
  id: string;
  plan_key: string;
  name: string;
  price_monthly: number;
  feature_keys: string[];
};

const CTA_BY_KEY: Record<string, string> = {
  starter: "pricing.ctaStarter",
  professional: "pricing.ctaProfessional",
  praxis_plus: "pricing.ctaClinicPro",
};

export default function PricingPage() {
  const t = useTranslations();
  const router = useRouter();
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
        toast.error(t("pricing.stripePriceMissing"));
        return;
      }
      if (data?.code === "STRIPE_NOT_CONFIGURED") {
        toast.error(t("pricing.checkoutUnavailable"));
        return;
      }
      toast.error(t("subscription.checkoutError"));
    } catch {
      toast.error(t("subscription.checkoutError"));
    } finally {
      setPending(null);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">{t("pricing.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("pricing.subtitle")}</p>
        <p className="mt-1 text-sm text-primary">{t("pricing.trial")}</p>
      </div>

      {/* Value proposition */}
      <p className="mb-8 text-center text-sm font-medium text-green-700 dark:text-green-400">
        💡 {t("pricing.valueProposition")}
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
          {t("pricing.plansError")}
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
                      {t("pricing.popularBadge")}
                    </span>
                  )}
                  <h2 className="text-xl font-semibold">{plan.name}</h2>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price_monthly} €</span>
                    <span className="text-sm text-muted-foreground">
                      {t("pricing.monthly")}
                    </span>
                  </div>

                  <p className="mt-6 mb-3 text-sm font-medium">{t("pricing.features")}</p>
                  <ul className="flex-1 space-y-2 text-sm">
                    {(plan.feature_keys ?? []).map((key) => (
                      <li key={key} className="flex items-center gap-2">
                        <Check className="h-4 w-4 shrink-0 text-green-600" />
                        <span>{t(`pricing.featureKeys.${key}`)}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => startCheckout(plan.plan_key)}
                    disabled={pending !== null}
                    className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {pending === plan.plan_key
                      ? t("common.loading")
                      : t(CTA_BY_KEY[plan.plan_key] ?? "pricing.ctaStarter")}
                  </button>
                </div>
              );
            })}

          {/* Enterprise – static card, always visible */}
          <div className="flex flex-col rounded-xl border border-border bg-secondary/10 p-6 shadow-sm">
            <h2 className="text-xl font-semibold">{t("pricing.enterpriseName")}</h2>
            <div className="mt-4">
              <span className="text-2xl font-bold leading-tight">
                {t("pricing.enterprisePriceLabel")}
              </span>
            </div>

            <p className="mt-6 mb-3 text-sm font-medium">{t("pricing.features")}</p>
            <ul className="flex-1 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-green-600" />
                <span>{t("pricing.featureKeys.everythingInProfessional")}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-green-600" />
                <span>{t("pricing.featureKeys.unlimitedPatients")}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-green-600" />
                <span>{t("pricing.featureKeys.prioritySupport")}</span>
              </li>
            </ul>

            <a
              href="/kontakt"
              className="mt-6 block w-full rounded-lg border border-blue-600 px-4 py-2.5 text-center text-sm font-medium text-blue-600 transition hover:bg-blue-50 dark:hover:bg-blue-950/30"
            >
              {t("pricing.ctaEnterprise")}
            </a>
          </div>
        </div>
      )}

      {/* Trial & Provider info box */}
      <div className="mt-10 rounded-xl border border-blue-200 bg-blue-50 px-6 py-5 text-sm text-blue-800 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-300">
        <p className="font-semibold">{t("pricing.trialInfo")}</p>
        <ul className="mt-2 space-y-1 list-none">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-green-500" />
            {t("pricing.trialNoCreditCard")}
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-green-500" />
            {t("pricing.trialNoSms")}
          </li>
        </ul>
        <p className="mt-3 text-xs text-blue-600 dark:text-blue-400">
          {t("pricing.providerCostNote")}
        </p>
      </div>

      {/* Stripe not live + price variation notes */}
      <div className="mt-4 space-y-1 text-center text-xs text-muted-foreground">
        <p>{t("pricing.stripeNotLive")}</p>
        <p>{t("pricing.priceNote")}</p>
      </div>
    </main>
  );
}
