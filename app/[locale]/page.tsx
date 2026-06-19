import type { Metadata } from "next";
import Link from "next/link";
import {
  Bell,
  CalendarClock,
  ListOrdered,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  HeartPulse,
  Building2,
  Activity,
  ClipboardList,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SlotFillLogo } from "@/components/ui/SlotFillLogo";
import { locales, type Locale } from "@/i18n/routing";
import { CANONICAL_URL, PUBLIC_BRAND_NAME } from "@/lib/brand";
import { getMarketScope } from "@/lib/market-scope";

const APP_URL = CANONICAL_URL;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
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
          "Slotfill helps patients book clinic appointments online. Clinics show available appointment options and receive patient requests in a simple, clear flow.",
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
        description: "Slotfill – online clinic appointment booking for patients and clinics.",
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
  // Without it, Next.js can serve a stale pre-rendered RSC payload to
  // users who navigate via <Link>, even when force-dynamic is set.
  void headers();

  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tLegal = await getTranslations({ locale, namespace: "legal" });

  const clinicCards = [
    { icon: CalendarClock, text: t("clinic1") },
    { icon: ListOrdered, text: t("clinic2") },
    { icon: Bell, text: t("clinic3") },
    { icon: ShieldCheck, text: t("clinic4") },
  ];

  const useCases = [
    { icon: Stethoscope, label: t("useCase1") },
    { icon: HeartPulse, label: t("useCase2") },
    { icon: Building2, label: t("useCase3") },
    { icon: Activity, label: t("useCase4") },
    { icon: ClipboardList, label: t("useCase5") },
    { icon: CalendarClock, label: t("useCase6") },
  ];

  const patientSteps = [t("journey1"), t("journey2"), t("journey3")];
  const providerSteps = [t("providerStep1"), t("providerStep2"), t("providerStep3"), t("providerStep4")];

  const schemaOrg = buildSchemaOrg(locale);

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* Schema.org JSON-LD */}
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
          <SlotFillLogo href={`/${locale}`} size={34} />
          <nav className="flex items-center gap-1 text-sm">
            <a
              href="#how"
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
            <Link
              href="/book/testpraxis-delta"
              className="hidden rounded-md px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 sm:inline"
            >
              {tNav("demoClinic")}
            </Link>
            <Link
              href="/auth/login"
              className="rounded-md px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
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

      {/* Hero — full-bleed blue-tint section */}
      <div className="w-full bg-gradient-to-b from-blue-50/70 to-white dark:from-blue-950/20 dark:to-transparent">
      <section className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:py-24">
        {/* Subtle radial glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 mx-auto h-full max-w-lg rounded-full opacity-[0.06] blur-3xl dark:opacity-[0.04]"
          style={{ background: "var(--gradient-brand)" }}
        />
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold shadow-sm" style={{ borderColor: "var(--color-border)", color: "var(--color-muted)", backgroundColor: "var(--color-surface)" }}>
          <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ backgroundColor: "var(--color-accent)" }} />
          {t("heroBadge")}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl lg:text-6xl">
          {t("heroTitle")}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
          {t("heroSubtitle")}
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          <Link href={`/${locale}/termin-buchen`} className="btn-brand w-full px-7 py-3.5 text-base sm:w-auto">
            {t("ctaPrimary")}
          </Link>
          <a href="#for-providers" className="btn-outline-brand w-full px-7 py-3.5 text-base sm:w-auto">
            {t("ctaForClinics")}
          </a>
          <Link href="/book/testpraxis-delta" className="w-full rounded-lg px-7 py-3.5 text-center text-base font-semibold text-slate-700 underline-offset-4 transition hover:underline dark:text-slate-300 sm:w-auto">
            {t("cta3")}
          </Link>
        </div>
        {/* Patient journey — 3 simple steps */}
        <div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
          {[t("journey1"), t("journey2"), t("journey3")].map((step, i) => (
            <div
              key={step}
              className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left dark:bg-slate-900"
              style={{ borderColor: "var(--color-border)" }}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: "var(--gradient-brand)" }}
              >
                {i + 1}
              </span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{step}</span>
            </div>
          ))}
        </div>

        {/* Hero product preview — anonymized: patient booking + practice dashboard */}
        <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl border bg-white shadow-xl dark:bg-slate-900" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex items-center gap-2 border-b px-4 py-2.5" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface-2)" }}>
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" aria-hidden />
            <span className="ml-2 truncate text-xs font-medium text-slate-400 dark:text-slate-500">slotfill</span>
          </div>
          <div className="grid grid-cols-1 gap-5 p-5 text-left sm:grid-cols-2">
          {/* Patient booking preview */}
          <div className="rounded-xl border bg-white p-5 dark:bg-slate-900" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t("previewClinic")}</span>
              <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: "var(--color-surface-2)", color: "var(--color-muted)" }}>{t("previewToday")}</span>
            </div>
            <div className="mt-3 space-y-2">
              {["09:00", "10:30"].map((tm) => (
                <div key={tm} className="flex items-center justify-between rounded-lg border px-3 py-2" style={{ borderColor: "var(--color-border)" }}>
                  <span className="text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-200">{tm}</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--color-accent)" }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--color-accent)" }} />
                    {t("previewAvailable")}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs" style={{ backgroundColor: "var(--color-surface-2)" }}>
              <span className="font-medium text-slate-600 dark:text-slate-300">{t("previewRequest")}</span>
              <span className="text-slate-400 dark:text-slate-500">{t("previewPending")}</span>
            </div>
          </div>
          {/* Practice dashboard preview */}
          <div className="rounded-xl border bg-white p-5 dark:bg-slate-900" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t("providerPreviewTitle")}</span>
              <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white" style={{ background: "var(--gradient-brand)" }}>{t("providerPreviewNew")}</span>
            </div>
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{t("providerPreviewRequests")}</p>
            <div className="mt-2 space-y-2">
              {["Appointment #1042 · 09:00", "Walk-in #18 · 10:00"].map((row) => (
                <div key={row} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2" style={{ borderColor: "var(--color-border)" }}>
                  <span className="truncate text-[12.5px] font-medium text-slate-700 dark:text-slate-300">{row}</span>
                  <span className="flex shrink-0 gap-1.5">
                    <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">{t("providerPreviewConfirm")}</span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10.5px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">{t("providerPreviewDecline")}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          </div>
        </div>
      </section>
      </div>

      {/* Use cases — healthcare verticals only */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">{t("useCasesTitle")}</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-slate-500 dark:text-slate-400">{t("useCasesSubline")}</p>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {useCases.map((u) => (
            <div
              key={u.label}
              className="flex flex-col items-center gap-3 rounded-2xl border bg-white p-5 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900"
              style={{ borderColor: "var(--color-border)" }}
            >
              <span className="inline-flex rounded-xl p-2.5 shadow-sm" style={{ background: "var(--gradient-brand)" }}>
                <u.icon className="h-5 w-5 text-white" />
              </span>
              <span className="text-[13px] font-medium leading-tight text-slate-800 dark:text-slate-200">{u.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Patient flow + Provider flow */}
      <div id="for-providers" className="w-full scroll-mt-20 bg-slate-50/60 dark:bg-transparent">
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Patient flow */}
          <div className="rounded-2xl border bg-white p-8 shadow-sm dark:bg-slate-900" style={{ borderColor: "var(--color-border)" }}>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("patientFlowTitle")}</h3>
            <ol className="mt-5 space-y-3">
              {patientSteps.map((step, i) => (
                <li key={step} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: "var(--gradient-brand)" }}>{i + 1}</span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          {/* Provider flow */}
          <div className="rounded-2xl border p-8 shadow-sm" style={{ borderColor: "var(--color-accent)", backgroundColor: "var(--color-surface)" }}>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("providerFlowTitle")}</h3>
            <ol className="mt-5 space-y-3">
              {providerSteps.map((step, i) => (
                <li key={step} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: "var(--gradient-brand)" }}>{i + 1}</span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
      </div>

      {/* 1. How online booking works (patient + demo) */}
      <div id="how" className="w-full scroll-mt-20 bg-slate-50/60 dark:bg-transparent">
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div
          className="rounded-2xl border p-8 shadow-sm"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium" style={{ backgroundColor: "var(--color-surface-2)", color: "var(--color-muted)" }}>
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                {t("onlineBookingBadge")}
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {t("onlineBookingTitle")}
              </h2>
              <p className="mt-2 max-w-lg text-sm text-slate-600 dark:text-slate-400">
                {t("onlineBookingDesc")}
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <span style={{ color: "var(--color-accent)" }}>✓</span>
                  {t("onlineBookingBullet1")}
                </li>
                <li className="flex items-center gap-2">
                  <span style={{ color: "var(--color-accent)" }}>✓</span>
                  {t("onlineBookingBullet2")}
                </li>
                <li className="flex items-center gap-2">
                  <span style={{ color: "var(--color-accent)" }}>✓</span>
                  {t("onlineBookingBullet3")}
                </li>
              </ul>
            </div>
            <div className="flex shrink-0 flex-col gap-3">
              <Link href={`/${locale}/termin-buchen`} className="btn-brand text-center">
                {t("onlineBookingButton")}
              </Link>
              <Link href="/book/testpraxis-delta" className="btn-outline-brand text-center">
                {t("ctaSecondary")}
              </Link>
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* 2. For clinics and practices */}
      <section id="for-clinics" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          {t("clinicsTitle")}
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-slate-500 dark:text-slate-400">
          {t("clinicsSubline")}
        </p>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {clinicCards.map((c) => (
            <div
              key={c.text}
              className="rounded-2xl border p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
              }}
            >
              <div
                className="mb-4 inline-flex rounded-xl p-2.5 shadow-sm"
                style={{ background: "var(--gradient-brand)" }}
              >
                <c.icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-200">
                {c.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Trust — subtle teal-tint section */}
      <div className="w-full bg-gradient-to-b from-teal-50/25 to-white dark:from-teal-950/10 dark:to-transparent">
      <section
        id="trust"
        className="mx-auto max-w-4xl px-4 py-16 text-center"
      >
        <h2 className="text-2xl font-bold">{t("trustTitle")}</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          {t("trustSubtitle")}
        </p>
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(
            [
              t("trustPoint1"),
              t("trustPoint2"),
              t("trustPoint3"),
              t("trustPoint4"),
            ] as string[]
          ).map((point) => (
            <li
              key={point}
              className="flex items-start gap-3 rounded-xl border border-teal-100 bg-white px-5 py-4 text-left shadow-sm dark:border-teal-900/30 dark:bg-slate-900"
            >
              <CheckCircle2
                className="mt-0.5 h-5 w-5 shrink-0"
                style={{ color: "var(--color-accent)" }}
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {point}
              </span>
            </li>
          ))}
        </ul>
      </section>
      </div>

      {/* CTA */}
      <section
        className="mx-auto max-w-3xl rounded-3xl px-8 py-16 text-center mx-4 my-8"
        style={{
          background: "var(--gradient-brand)",
          margin: "2rem auto",
          maxWidth: "48rem",
        }}
      >
        <h2 className="text-2xl font-bold text-white">{t("ctaBlockTitle")}</h2>
        <p className="mt-2 text-white/80">
          {t("ctaBlockSubtitle")}
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/${locale}/termin-buchen`}
            className="inline-flex w-full items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-slate-50 sm:w-auto"
          >
            {t("ctaPrimary")}
          </Link>
          <Link
            href={`/${locale}#for-clinics`}
            className="inline-flex w-full items-center justify-center rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
          >
            {t("ctaForClinics")}
          </Link>
        </div>
        {/* Preise richten sich an Praxen/Kliniken, nicht an Patienten */}
        <p className="mt-4 text-xs text-white/70">{t("pricingForClinics")}</p>
      </section>

      {/* Footer */}
      <footer
        className="border-t"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
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
          <div className="mt-6 border-t pt-6 text-xs" style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
            aria-label="Copyright">
            <p>{getMarketScope(locale).footer}</p>
            <p className="mt-1">© {new Date().getFullYear()} {tNav("brand")}. {t("rights")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
