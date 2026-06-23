"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Check, Zap, TrendingUp, Building2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Locale } from "@/i18n/routing";
import { PRICE_FROM_BY_KEY, type PricingPlanKey } from "@/lib/pricing";

// ─── DB plan shape (name + price come from the API; features are hardcoded below) ─

type Plan = {
  id: string;
  plan_key: string;
  name: string;
  price_monthly: number;
};

// Plan-CTAs nutzen dieselbe Anfrage-Copy wie die Homepage (landing-Namespace) –
// keine abweichende oder Trial-Sprache ("… anfragen", nicht "… testen").
const LANDING_CTA_BY_KEY: Record<string, string> = {
  starter: "planStarterCta",
  professional: "planPracticeCta",
  praxis_plus: "planClinicCta",
};

// ─── Hardcoded feature lists per plan + locale ────────────────────────────────
// Bypasses DB feature_keys to avoid inaccurate labels (e.g. "unlimitedPatients").
// Only concrete, verifiable features are listed.

type PlanMeta = {
  subtitle: string;
  badge?: string;
  badgeColor?: "blue" | "emerald";
  icon: React.ElementType;
  highlight?: boolean;
  features: string[];
};

const PLAN_CONTENT: Record<string, Record<string, PlanMeta>> = {
  de: {
    starter: {
      subtitle:
        "Für einzelne Praxen oder kleine Teams, die digitale Terminanfragen strukturiert starten möchten.",
      icon: Zap,
      features: [
        "Öffentlicher Buchungslink für Ihre Praxis",
        "Patientenanfragen ohne Login",
        "Einfache Warteliste",
        "Basis-Patientenverwaltung",
        "Vorbereitete Benachrichtigungstexte",
        "Die Praxis behält die Kontrolle",
        "Kein Patienten-Login nötig",
      ],
    },
    professional: {
      subtitle:
        "Für Praxisteams mit mehreren Mitarbeitenden und regelmäßigem Anfragevolumen.",
      badge: "Empfohlen",
      badgeColor: "blue",
      icon: TrendingUp,
      highlight: true,
      features: [
        "Alles aus Starter",
        "Team-Workflow für mehrere Mitarbeitende",
        "Erweiterte Statistiken",
        "Strukturierte Anfrage- und Statusverwaltung",
        "Bessere Übersicht über Warteliste und freie Zeitfenster",
        "Geeignet für aktive Praxisteams",
      ],
    },
    praxis_plus: {
      subtitle:
        "Für größere Praxen, Gesundheitszentren, Kliniken oder Organisationen mit mehreren Behandlern und höherem Anfragevolumen.",
      badge: "Premium",
      badgeColor: "emerald",
      icon: Building2,
      features: [
        "Alles aus Practice",
        "Geeignet für größere Wartelisten und höheres Anfragevolumen",
        "Für mehrere Behandler und größere Organisationen",
        "Erweiterte Organisationsübersicht",
        "Vorrang bei Einrichtung und Support",
        "Erweiterter Einrichtungs- und Betriebsrahmen für intensivere Nutzung",
      ],
    },
  },
  en: {
    starter: {
      subtitle:
        "For individual practices or small teams ready to start managing appointment requests digitally.",
      icon: Zap,
      features: [
        "Public booking link for your practice",
        "Patient requests without login",
        "Basic waitlist management",
        "Patient management",
        "Prepared notification templates",
        "Your clinic stays in control",
        "No patient login required",
      ],
    },
    professional: {
      subtitle:
        "For practice teams with multiple staff and regular appointment request volume.",
      badge: "Recommended",
      badgeColor: "blue",
      icon: TrendingUp,
      highlight: true,
      features: [
        "Everything in Starter",
        "Team workflow for multiple staff members",
        "Advanced statistics",
        "Structured request and status management",
        "Better overview of waitlist and open slots",
        "Designed for active practice teams",
      ],
    },
    praxis_plus: {
      subtitle:
        "For larger practices, healthcare centers, clinics or organizations with multiple practitioners and higher request volumes.",
      badge: "Premium",
      badgeColor: "emerald",
      icon: Building2,
      features: [
        "Everything in Practice",
        "Suited for larger waitlists and higher request volumes",
        "For multiple practitioners and larger organizations",
        "Extended organizational overview",
        "Priority setup and support",
        "Extended setup and operations framework for intensive use",
      ],
    },
  },
};

// Fallback to "en" for locales without dedicated content
function getPlanContent(locale: string, planKey: string): PlanMeta | null {
  const loc = PLAN_CONTENT[locale] ?? PLAN_CONTENT["en"];
  return loc[planKey] ?? null;
}

// Statische, sichere Pläne — KEINE DB-/Stripe-Abhängigkeit (verhindert Crashes
// ohne konfigurierte Umgebung). Preise sind eine vorsichtige Pilot-Orientierung;
// die Aktivierung erfolgt nur nach Bestätigung, es wird keine Zahlung verarbeitet.
// Preise stammen aus der zentralen Einzelquelle lib/pricing.ts (identisch zur
// Homepage – kein zweiter, abweichender Preis mehr).
const STATIC_PLANS: Plan[] = [
  { id: "starter", plan_key: "starter", name: "Starter", price_monthly: PRICE_FROM_BY_KEY.starter },
  { id: "professional", plan_key: "professional", name: "Practice", price_monthly: PRICE_FROM_BY_KEY.professional },
  { id: "praxis_plus", plan_key: "praxis_plus", name: "Clinic", price_monthly: PRICE_FROM_BY_KEY.praxis_plus },
];

export default function LocalePricingPage() {
  const t = useTranslations("pricing");
  const tCommon = useTranslations("common");
  // Gemeinsame Preis-/Hinweis-Copy mit der Homepage (landing-Namespace).
  const tl = useTranslations("landing");
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) ?? "de";

  const [pending, setPending] = useState<string | null>(null);
  const plans = STATIC_PLANS;
  const loading = false;
  const error = false;

  // Keine Zahlung: Plan-CTA leitet zur Kontakt-/Praxiszugang-Anfrage.
  function requestPlanAccess(planKey: string) {
    setPending(planKey);
    router.push(`/${locale}/kontakt`);
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
          {t("trial")}
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">{t("subtitle")}</p>
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
            const meta = getPlanContent(locale, plan.plan_key);
            if (!meta) return null;

            const Icon = meta.icon;
            const isHighlight = meta.highlight ?? false;
            const isClinicPro = plan.plan_key === "praxis_plus";

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
                        : isClinicPro
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
                    <p className="mt-0.5 text-xs leading-snug text-slate-500 dark:text-slate-400">
                      {meta.subtitle}
                    </p>
                  </div>
                </div>

                {/* Price — same "ab/from … € / month" logic as the homepage */}
                <div className="mb-5">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                    {tl("pricePerMonthFrom", { price: plan.price_monthly })}
                  </span>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{tl("pricingOnRequest")}</p>
                </div>

                {/* Divider */}
                <div className={`mb-5 border-t ${
                  isHighlight
                    ? "border-blue-200/70 dark:border-blue-800/40"
                    : isClinicPro
                    ? "border-emerald-100/80 dark:border-emerald-900/30"
                    : "border-slate-100 dark:border-slate-800"
                }`} />

                {/* Features — hardcoded, never from DB */}
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  {t("features")}
                </p>
                <ul className="flex-1 space-y-2.5 text-sm">
                  {meta.features.map((feature, i) => (
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
                  onClick={() => requestPlanAccess(plan.plan_key)}
                  disabled={pending !== null}
                  className={`mt-7 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    isHighlight
                      ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
                      : isClinicPro
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500"
                      : "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
                  }`}
                >
                  {pending === plan.plan_key
                    ? tCommon("loading")
                    : tl(LANDING_CTA_BY_KEY[plan.plan_key] ?? "planStarterCta")}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Unified orientation / market-review / no-patient-payment note (same as homepage) */}
      <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-slate-500 dark:text-slate-400">
        {tl("pricingMoneyNote")}
      </p>

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
    </div>
  );
}
