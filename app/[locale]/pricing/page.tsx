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
  praxis_plus: "ctaPraxisPlus",
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
        toast.error(t("checkoutUnavailable"));
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
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-4 flex justify-end">
        <LanguageSwitcher currentLocale={locale as Locale} currentPath="/pricing" />
      </div>
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        <p className="mt-1 text-sm text-primary">{t("trial")}</p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="py-8 text-center text-muted-foreground">
          {t("plansError")}
        </p>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="flex flex-col rounded-xl border border-border bg-secondary/10 p-6 shadow-sm"
            >
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
          ))}
        </div>
      )}
    </main>
  );
}
