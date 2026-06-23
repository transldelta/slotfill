import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  HeartPulse,
  Building2,
  Activity,
  Smartphone,
  Users,
  Microscope,
  Smile,
  ArrowRight,
  Clock,
  Zap,
  TrendingUp,
  Check,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SlotFillLogo } from "@/components/ui/SlotFillLogo";
import { HealthcareImage } from "@/components/ui/HealthcareImage";
import { locales, type Locale } from "@/i18n/routing";
import { CANONICAL_URL, PUBLIC_BRAND_NAME } from "@/lib/brand";
import { getMarketScope } from "@/lib/market-scope";
import { PRICING_PLANS } from "@/lib/pricing";

const APP_URL = CANONICAL_URL;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing" });
  const title = `${PUBLIC_BRAND_NAME} – ${t("heroTitle")}`;
  const description = t("heroSubtitle");

  return {
    title,
    description,
    metadataBase: new URL(APP_URL),
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `/${l}`]),
      ) as Record<string, string>,
    },
    openGraph: {
      title,
      description,
      url: `/${locale}`,
      siteName: PUBLIC_BRAND_NAME,
      locale: locale === "de" ? "de_DE" : locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// Schema.org JSON-LD – SoftwareApplication + Organization.
function buildSchemaOrg(locale: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: PUBLIC_BRAND_NAME,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description:
          "ClinicSlotHub helps patients book clinic appointments online. Clinics show available appointment options and receive patient requests in a simple, clear flow.",
        url: APP_URL,
        inLanguage: locale,
        offers: {
          "@type": "Offer",
          price: "49",
          priceCurrency: "EUR",
          description: "Starter plan from €49/month. Pricing confirmed before activation.",
        },
      },
      {
        "@type": "Organization",
        name: PUBLIC_BRAND_NAME,
        url: APP_URL,
        description: "ClinicSlotHub – online clinic appointment booking for patients and clinics.",
      },
    ],
  };
}

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // headers() marks this route as dynamic → Router Cache TTL = 0.
  void headers();

  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tLegal = await getTranslations({ locale, namespace: "legal" });

  const patientSteps = [
    t("patientStep1"),
    t("patientStep2"),
    t("patientStep3"),
    t("patientStep4"),
    t("patientStep5"),
  ];
  const providerSteps = [
    t("providerStep1"),
    t("providerStep2"),
    t("providerStep3"),
    t("providerStep4"),
    t("providerStep5"),
  ];

  // Editorial image bands for the healthcare verticals (less boxy than icon cards).
  const verticalTiles = [
    { key: "dentalConsultation" as const, icon: Smile, label: t("useCase2"), caption: t("mediaDentist"), tone: "blue" as const },
    { key: "therapySession" as const, icon: HeartPulse, label: t("useCase5"), caption: t("mediaTherapy"), tone: "teal" as const },
    { key: "diagnosticCenter" as const, icon: Microscope, label: t("useCase6"), caption: t("mediaDiagnostic"), tone: "mixed" as const },
  ];
  // Remaining verticals shown as quiet inline pills.
  const verticalPills = [
    { icon: Stethoscope, label: t("useCase1") },
    { icon: Building2, label: t("useCase3") },
    { icon: Activity, label: t("useCase4") },
  ];

  const clinicCards = [t("clinic1"), t("clinic2"), t("clinic3"), t("clinic4")];
  const trustPoints = [t("trustPoint1"), t("trustPoint2"), t("trustPoint3"), t("trustPoint4")];
  const safetyPoints = [t("safety1"), t("safety2"), t("safety3")];

  // What ClinicSlotHub sells — SaaS access points for providers.
  const sellPoints = [t("sell1"), t("sell2"), t("sell3"), t("sell4"), t("sell5"), t("sell6")];

  // FAQ — trust-building answers, no client JS (native details/summary).
  const faqs = [
    { q: t("faq1Q"), a: t("faq1A") },
    { q: t("faq2Q"), a: t("faq2A") },
    { q: t("faq3Q"), a: t("faq3A") },
    { q: t("faq4Q"), a: t("faq4A") },
    { q: t("faq5Q"), a: t("faq5A") },
  ];

  // Pricing packages — prices come from the single source lib/pricing.ts (same
  // numbers as the /pricing page). Visible "ab/from … € / month" starting prices;
  // CTA → contact / practice-access request only. No payment provider.
  const planMeta: Record<string, { icon: typeof Zap; desc: string; cta: string; features: string[] }> = {
    starter: { icon: Zap, desc: t("planStarterDesc"), cta: t("planStarterCta"), features: [t("planStarterF1"), t("planStarterF2"), t("planStarterF3")] },
    professional: { icon: TrendingUp, desc: t("planPracticeDesc"), cta: t("planPracticeCta"), features: [t("planPracticeF1"), t("planPracticeF2"), t("planPracticeF3")] },
    praxis_plus: { icon: Building2, desc: t("planClinicDesc"), cta: t("planClinicCta"), features: [t("planClinicF1"), t("planClinicF2"), t("planClinicF3")] },
  };
  const pricingPlans = PRICING_PLANS.map((p) => ({
    name: p.name,
    priceFrom: p.priceFrom,
    highlight: !!p.recommended,
    ...planMeta[p.key],
  }));

  const schemaOrg = buildSchemaOrg(locale);

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100" style={{ backgroundColor: "var(--color-bg)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />

      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-md"
        style={{
          backgroundColor: "color-mix(in srgb, var(--color-bg) 85%, transparent)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <SlotFillLogo href={`/${locale}`} size={40} hideWordmarkOnMobile priority />
          <nav className="flex items-center gap-1 text-sm">
            <a
              href="#how-patients"
              className="hidden rounded-md px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 sm:inline"
            >
              {tNav("features")}
            </a>
            <a
              href="#for-clinics"
              className="hidden rounded-md px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 sm:inline"
            >
              {tNav("forClinics")}
            </a>
            <a
              href="#pricing"
              className="hidden rounded-md px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 sm:inline"
            >
              {tNav("pricing")}
            </a>
            <Link
              href="/book/testpraxis-delta"
              className="hidden rounded-md px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 sm:inline"
            >
              {tNav("demoClinic")}
            </Link>
            <a
              href="#faq"
              className="hidden rounded-md px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 sm:inline"
            >
              {tNav("faq")}
            </a>
            <Link
              href="/auth/login"
              className="hidden rounded-md px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 sm:inline"
            >
              {tNav("login")}
            </Link>
            <Link href={`/${locale}/termin-buchen`} className="btn-brand ml-1 px-4 py-2 text-xs">
              {tNav("bookAppointment")}
            </Link>
            <LanguageSwitcher currentLocale={locale as Locale} currentPath="/" />
          </nav>
        </div>
      </header>

      {/* ─── HERO — editorial split: human photo + clear booking copy ─── */}
      <div className="w-full bg-gradient-to-b from-blue-50/70 to-white dark:from-blue-950/20 dark:to-transparent">
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:py-16 lg:grid-cols-2 lg:gap-14 lg:py-24">
          {/* Copy */}
          <div className="order-2 text-center lg:order-1 lg:text-left">
            <div
              className="mb-5 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold shadow-sm"
              style={{ borderColor: "var(--color-border)", color: "var(--color-muted)", backgroundColor: "var(--color-surface)" }}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ backgroundColor: "var(--color-accent)" }} />
              {t("heroBadge")}
            </div>
            <h1 className="text-balance text-[1.9rem] font-extrabold leading-[1.14] tracking-tight text-slate-900 dark:text-slate-100 sm:text-[2.5rem] lg:text-[3rem]">
              {t("heroTitle")}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg lg:mx-0">
              {t("heroSubtitle")}
            </p>
            <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-start">
              <Link href={`/${locale}/termin-buchen`} className="btn-brand px-7 py-3.5 text-base">
                {t("ctaPrimary")}
              </Link>
              <Link href="/book/testpraxis-delta" className="btn-outline-brand px-7 py-3.5 text-base">
                {t("ctaSecondary")}
              </Link>
              <a
                href="#for-providers"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-3.5 text-base font-semibold text-slate-700 underline-offset-4 transition hover:underline dark:text-slate-300"
              >
                {t("ctaForClinics")} <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            {/* Patient journey — quiet inline row, not boxes */}
            <div className="mt-9 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
              {[t("journey1"), t("journey2"), t("journey3")].map((step, i) => (
                <div key={step} className="inline-flex items-center justify-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 sm:justify-start">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    {i + 1}
                  </span>
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* Human hero image with light, real overlays */}
          <div className="relative order-1 lg:order-2">
            <HealthcareImage
              imageKey="heroDoctorConsultation"
              icon={Stethoscope}
              alt={t("mediaHero")}
              caption={t("mediaHero")}
              tone="mixed"
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="aspect-[4/5] w-full shadow-xl sm:aspect-[5/4] lg:aspect-[4/5]"
            >
              {/* Floating availability card — real booking preview, no fake OS chrome.
                  Mobil unten platziert (über dem Tablet/Tisch, verdeckt nicht das Gesicht),
                  ab sm oben rechts. */}
              <div className="absolute bottom-3 left-3 z-10 w-52 rounded-2xl border bg-white/95 p-4 shadow-2xl ring-1 ring-black/5 backdrop-blur dark:bg-slate-900/90 sm:bottom-auto sm:left-auto sm:right-3 sm:top-3 sm:w-60" style={{ borderColor: "var(--color-border)" }}>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-slate-100">
                    <span className="h-2 w-2 rounded-full" style={{ background: "var(--gradient-brand)" }} />
                    {t("previewClinic")}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    <Clock className="h-3 w-3" style={{ color: "var(--color-accent)" }} />
                    {t("previewToday")}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {["09:00", "10:30"].map((tm) => (
                    <div key={tm} className="flex items-center justify-between rounded-lg border px-3 py-2" style={{ borderColor: "var(--color-border)" }}>
                      <span className="text-[13px] font-semibold tabular-nums text-slate-800 dark:text-slate-200">{tm}</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color: "var(--color-accent)" }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--color-accent)" }} />
                        {t("previewAvailable")}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Honest status: a request waits for the practice to confirm — no guarantee. */}
                <div className="mt-3 flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-[11px]" style={{ backgroundColor: "var(--color-surface-2)" }}>
                  <span className="font-medium text-slate-600 dark:text-slate-300">{t("previewRequest")}</span>
                  <span className="text-slate-400 dark:text-slate-500">{t("previewPending")}</span>
                </div>
              </div>
            </HealthcareImage>
          </div>
        </section>
      </div>

      {/* ─── PATIENT BOOKING FLOW — image / text editorial row ─── */}
      <section id="how-patients" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <HealthcareImage
            imageKey="patientMobileBooking"
            icon={Smartphone}
            alt={t("mediaPatient")}
            caption={t("mediaPatient")}
            tone="blue"
            className="aspect-[3/2] w-full shadow-lg"
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--color-accent)" }}>
              {t("humanEyebrow")}
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              {t("patientFlowTitle")}
            </h2>
            <p className="mt-3 max-w-md text-base text-slate-600 dark:text-slate-300">{t("patientFlowLead")}</p>
            <ol className="mt-7 space-y-4">
              {patientSteps.map((step, i) => (
                <li key={step} className="flex items-start gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: "var(--gradient-brand)" }}>
                    {i + 1}
                  </span>
                  <span className="pt-1 text-[15px] font-medium text-slate-700 dark:text-slate-200">{step}</span>
                </li>
              ))}
            </ol>
            <Link href={`/${locale}/termin-buchen`} className="btn-brand mt-8 px-6 py-3 text-sm">
              {t("ctaPrimary")} <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── PROVIDER FLOW — reversed editorial row with request preview ─── */}
      <div id="for-providers" className="w-full scroll-mt-20 bg-slate-50/70 dark:bg-white/[0.02]">
        <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="order-2 lg:order-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--color-accent)" }}>
                {tNav("forClinics")}
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                {t("providerFlowTitle")}
              </h2>
              <p className="mt-3 max-w-md text-base text-slate-600 dark:text-slate-300">{t("providerFlowLead")}</p>
              <ol className="mt-7 space-y-4">
                {providerSteps.map((step, i) => (
                  <li key={step} className="flex items-start gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: "var(--gradient-brand)" }}>
                      {i + 1}
                    </span>
                    <span className="pt-1 text-[15px] font-medium text-slate-700 dark:text-slate-200">{step}</span>
                  </li>
                ))}
              </ol>
              <a href="#for-clinics" className="btn-outline-brand mt-8 px-6 py-3 text-sm">
                {t("ctaForClinics")} <ArrowRight className="ml-1.5 h-4 w-4" />
              </a>
            </div>
            <HealthcareImage
              imageKey="clinicReception"
              icon={Users}
              alt={t("mediaReception")}
              caption={t("mediaReception")}
              tone="teal"
              className="order-1 aspect-[3/2] w-full shadow-lg lg:order-2"
            >
              {/* Floating provider request preview — anonymized, no real data */}
              <div className="absolute bottom-3 left-3 z-10 w-48 rounded-2xl border bg-white/95 p-3 shadow-lg backdrop-blur dark:bg-slate-900/90 sm:w-52" style={{ borderColor: "var(--color-border)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{t("providerPreviewTitle")}</span>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white" style={{ background: "var(--gradient-brand)" }}>{t("providerPreviewNew")}</span>
                </div>
                <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{t("providerPreviewRequests")}</p>
                <div className="mt-1.5 flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5" style={{ borderColor: "var(--color-border)" }}>
                  <span className="truncate text-[11px] font-medium text-slate-700 dark:text-slate-300">#1042 · 09:00</span>
                  <span className="flex shrink-0 gap-1">
                    <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">{t("providerPreviewConfirm")}</span>
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">{t("providerPreviewDecline")}</span>
                  </span>
                </div>
              </div>
            </HealthcareImage>
          </div>
        </section>
      </div>

      {/* ─── HEALTHCARE VERTICALS — image bands + quiet pills ─── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">{t("useCasesTitle")}</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t("useCasesSubline")}</p>
        </div>
        <p className="mt-8 text-center text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{t("useCasesExamplesLabel")}</p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {verticalTiles.map((v) => (
            <HealthcareImage
              key={v.key}
              imageKey={v.key}
              icon={v.icon}
              alt={v.caption}
              caption={v.caption}
              tone={v.tone}
              rounded="rounded-2xl"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="aspect-[4/3] w-full"
            >
              <div className="absolute inset-x-0 bottom-0 z-[5] bg-gradient-to-t from-black/55 via-black/10 to-transparent p-4 pt-10">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-white drop-shadow">
                  <v.icon className="h-4 w-4" />
                  {v.label}
                </span>
              </div>
            </HealthcareImage>
          ))}
        </div>
        {/* Quiet pills for the remaining verticals */}
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          {verticalPills.map((p) => (
            <span
              key={p.label}
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
            >
              <p.icon className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
              {p.label}
            </span>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-slate-500 dark:text-slate-400">{t("useCasesMore")}</p>
      </section>

      {/* ─── ONLINE BOOKING — team photo + clear value ─── */}
      <div className="w-full bg-slate-50/70 dark:bg-white/[0.02]">
        <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <HealthcareImage
              imageKey="clinicTeam"
              icon={Users}
              alt={t("mediaTeam")}
              caption={t("mediaTeam")}
              tone="mixed"
              className="aspect-square w-full shadow-lg"
            />
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium" style={{ backgroundColor: "var(--color-surface-2)", color: "var(--color-muted)" }}>
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                {t("onlineBookingBadge")}
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">{t("onlineBookingTitle")}</h2>
              <p className="mt-3 max-w-md text-base text-slate-600 dark:text-slate-300">{t("onlineBookingDesc")}</p>
              <ul className="mt-6 space-y-3">
                {[t("onlineBookingBullet1"), t("onlineBookingBullet2"), t("onlineBookingBullet3")].map((b) => (
                  <li key={b} className="flex items-start gap-3 text-[15px] text-slate-700 dark:text-slate-200">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--color-accent)" }} />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={`/${locale}/termin-buchen`} className="btn-brand px-6 py-3 text-sm">
                  {t("onlineBookingButton")}
                </Link>
                <Link href="/book/testpraxis-delta" className="btn-outline-brand px-6 py-3 text-sm">
                  {t("cta3")}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ─── FOR CLINICS — clean checklist, not heavy cards ─── */}
      <section id="for-clinics" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">{t("clinicsTitle")}</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t("clinicsSubline")}</p>
        </div>
        <div className="mx-auto mt-10 grid max-w-3xl gap-x-10 gap-y-4 sm:grid-cols-2">
          {clinicCards.map((c) => (
            <div key={c} className="flex items-start gap-3 border-b py-3" style={{ borderColor: "var(--color-border)" }}>
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--color-accent)" }} />
              <span className="text-[15px] font-medium text-slate-700 dark:text-slate-200">{c}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── WHAT SLOTFILL SELLS — clear SaaS offer ─── */}
      <div className="w-full bg-slate-50/70 dark:bg-white/[0.02]">
        <section className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--color-accent)" }}>
              {tNav("forClinics")}
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">{t("sellTitle")}</h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-300">{t("sellSubline")}</p>
          </div>
          <div className="mx-auto mt-10 grid max-w-3xl gap-x-10 gap-y-4 sm:grid-cols-2">
            {sellPoints.map((s) => (
              <div key={s} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--color-accent)" }} />
                <span className="text-[15px] font-medium text-slate-700 dark:text-slate-200">{s}</span>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-sm font-medium text-slate-500 dark:text-slate-400">
            {t("sellNote")}
          </p>
        </section>
      </div>

      {/* ─── PRICING TEASER — packages for providers, no patient payment ─── */}
      <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">{t("pricingTitle")}</h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-300">{t("pricingSubline")}</p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-7 shadow-sm transition-all duration-200 hover:shadow-md ${
                plan.highlight ? "ring-2 lg:-translate-y-1.5" : ""
              }`}
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: plan.highlight ? "var(--color-primary)" : "var(--color-border)",
                ...(plan.highlight ? { boxShadow: "0 0 0 1px var(--color-primary)" } : {}),
              }}
            >
              {plan.highlight && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-0.5 text-xs font-semibold text-white"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  {t("planPopular")}
                </span>
              )}
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white" style={{ background: "var(--gradient-brand)" }}>
                  <plan.icon className="h-5 w-5" />
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{plan.name}</span>
              </div>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{plan.desc}</p>
              <p className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                {t("pricePerMonthFrom", { price: plan.priceFrom })}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t("pricingOnRequest")}</p>
              <ul className="mt-4 flex-1 space-y-2.5 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--color-accent)" }} />
                    <span className="text-slate-700 dark:text-slate-300">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href={`/${locale}/kontakt`} className="btn-brand mt-7 w-full px-5 py-2.5 text-sm">
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
        {/* See full pricing page + money logic */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <Link href={`/${locale}/pricing`} className="btn-outline-brand px-6 py-2.5 text-sm">
            {t("pricingSeeAll")} <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
          <p className="mx-auto max-w-2xl text-center text-xs text-slate-500 dark:text-slate-400">
            {t("pricingMoneyNote")}
          </p>
        </div>
      </section>

      {/* ─── TRUST + SAFETY — human image, no false promises ─── */}
      <div className="w-full bg-gradient-to-b from-teal-50/30 to-white dark:from-teal-950/10 dark:to-transparent">
        <section id="trust" className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <HealthcareImage
              imageKey="healthcareTrust"
              icon={HeartPulse}
              alt={t("mediaTrust")}
              caption={t("mediaTrust")}
              tone="teal"
              className="aspect-[3/2] w-full shadow-lg"
            />
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">{t("trustTitle")}</h2>
              <p className="mt-2 text-base text-slate-600 dark:text-slate-300">{t("trustSubtitle")}</p>
              <ul className="mt-6 space-y-3">
                {trustPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-[15px] text-slate-700 dark:text-slate-200">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--color-accent)" }} />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Safety strip — manual confirmation / legal review / market scope.
              The market-scope footer line below carries the approved
              service-scope disclaimer (guard-safe single source). */}
          <div
            className="mt-12 rounded-2xl border p-6 sm:p-8"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex rounded-xl p-2.5" style={{ background: "var(--gradient-brand)" }}>
                <ShieldCheck className="h-5 w-5 text-white" />
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t("safetyTitle")}</h3>
            </div>
            <ul className="mt-5 grid gap-3 sm:grid-cols-3">
              {safetyPoints.map((s) => (
                <li key={s} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--color-accent)" }} />
                  {s}
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t pt-4 text-xs text-slate-500 dark:text-slate-400" style={{ borderColor: "var(--color-border)" }}>
              {getMarketScope(locale).footer}
            </p>
          </div>
        </section>
      </div>

      {/* ─── FAQ — trust-building, native accordion (no client JS) ─── */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">{t("faqTitle")}</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t("faqSubtitle")}</p>
        </div>
        <div className="mt-10 space-y-3">
          {faqs.map((f, i) => (
            <details
              key={f.q}
              className="group rounded-2xl border bg-white px-5 py-4 transition open:shadow-sm dark:bg-slate-900"
              style={{ borderColor: "var(--color-border)" }}
              {...(i === 0 ? { open: true } : {})}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-slate-900 dark:text-slate-100">
                {f.q}
                <ArrowRight className="h-4 w-4 shrink-0 rotate-90 text-slate-400 transition group-open:-rotate-90" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section
        className="rounded-3xl px-8 py-16 text-center"
        style={{ background: "var(--gradient-brand)", margin: "2.5rem auto", maxWidth: "48rem" }}
      >
        <h2 className="text-2xl font-bold text-white sm:text-3xl">{t("ctaBlockTitle")}</h2>
        <p className="mt-2 text-white/80">{t("ctaBlockSubtitle")}</p>
        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/${locale}/termin-buchen`}
            className="inline-flex w-full items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-slate-50 sm:w-auto"
          >
            {t("ctaPrimary")}
          </Link>
          <Link
            href="/book/testpraxis-delta"
            className="inline-flex w-full items-center justify-center rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
          >
            {t("ctaSecondary")}
          </Link>
          <Link
            href={`/${locale}#for-clinics`}
            className="inline-flex w-full items-center justify-center rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
          >
            {t("ctaForClinics")}
          </Link>
        </div>
        <p className="mt-4 text-xs text-white/70">{t("pricingForClinics")}</p>
      </section>

      {/* Footer */}
      <footer className="border-t" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-6 flex items-center justify-between">
            <SlotFillLogo href={`/${locale}`} size={30} />
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm" style={{ color: "var(--color-muted)" }}>
            <Link href={`/${locale}/impressum`} className="transition hover:text-slate-900 dark:hover:text-slate-100">
              {tLegal("impressumTitle")}
            </Link>
            <Link href={`/${locale}/datenschutz`} className="transition hover:text-slate-900 dark:hover:text-slate-100">
              {tLegal("datenschutzTitle")}
            </Link>
            <Link href={`/${locale}/agb`} className="transition hover:text-slate-900 dark:hover:text-slate-100">
              {tLegal("agbTitle")}
            </Link>
            <Link href={`/${locale}/avv`} className="transition hover:text-slate-900 dark:hover:text-slate-100">
              AVV
            </Link>
            <Link href={`/${locale}/pricing`} className="transition hover:text-slate-900 dark:hover:text-slate-100">
              {tNav("pricing")}
            </Link>
            <Link href={`/${locale}/blog`} className="transition hover:text-slate-900 dark:hover:text-slate-100">
              {tNav("blog")}
            </Link>
            <Link href={`/${locale}/kontakt`} className="transition hover:text-slate-900 dark:hover:text-slate-100">
              {tNav("contact")}
            </Link>
            <Link href={`/${locale}/termin-buchen`} className="transition hover:text-slate-900 dark:hover:text-slate-100">
              {tNav("bookAppointment")}
            </Link>
            <Link href={`/${locale}/feedback`} className="transition hover:text-slate-900 dark:hover:text-slate-100">
              {tNav("feedback")}
            </Link>
          </div>
          <div className="mt-6 border-t pt-6 text-xs" style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }} aria-label="Copyright">
            <p>{getMarketScope(locale).footer}</p>
            <p className="mt-1">© {new Date().getFullYear()} {tNav("brand")}. {t("rights")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
