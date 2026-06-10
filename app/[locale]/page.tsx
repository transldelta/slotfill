import type { Metadata } from "next";
import Link from "next/link";
import {
  Bell,
  CalendarClock,
  ListOrdered,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SlotFillLogo } from "@/components/ui/SlotFillLogo";
import { locales, type Locale } from "@/i18n/routing";
import { CANONICAL_URL } from "@/lib/brand";

const APP_URL = CANONICAL_URL;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const title = `ClinicSlotHub – ${t("heroTitle")}`;
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
      siteName: "ClinicSlotHub",
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
        name: "ClinicSlotHub",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description:
          "ClinicSlotHub helps clinics, medical offices and healthcare providers worldwide fill appointment slots from the waitlist automatically.",
        url: APP_URL,
        inLanguage: locale,
        offers: {
          "@type": "Offer",
          price: "29",
          priceCurrency: "EUR",
          description: "Starter plan from €29/month, 14-day free trial included",
        },
      },
      {
        "@type": "Organization",
        name: "ClinicSlotHub",
        url: APP_URL,
        description: "ClinicSlotHub – Appointment and waitlist management for clinics and healthcare providers worldwide.",
      },
    ],
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tLegal = await getTranslations({ locale, namespace: "legal" });

  const features = [
    { icon: ListOrdered, title: t("feature1Title"), desc: t("feature1Desc") },
    { icon: Bell, title: t("feature2Title"), desc: t("feature2Desc") },
    { icon: CalendarClock, title: t("feature3Title"), desc: t("feature3Desc") },
    { icon: ShieldCheck, title: t("feature4Title"), desc: t("feature4Desc") },
  ];

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
              href="#features"
              className="hidden rounded-md px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 sm:inline"
            >
              {tNav("features")}
            </a>
            <Link
              href={`/${locale}/pricing`}
              className="rounded-md px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              {tNav("pricing")}
            </Link>
            <Link
              href={`/${locale}/blog`}
              className="hidden rounded-md px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 sm:inline"
            >
              {tNav("blog")}
            </Link>
            <Link
              href={`/${locale}/kontakt`}
              className="hidden rounded-md px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 sm:inline"
            >
              {tNav("contact")}
            </Link>
            <Link
              href={`/${locale}/termin-buchen`}
              className="hidden rounded-md px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 sm:inline"
            >
              {tNav("bookAppointment")}
            </Link>
            <Link
              href="/auth/login"
              className="rounded-md px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              {tNav("login")}
            </Link>
            <Link href={`/${locale}/pricing`} className="btn-brand ml-1 px-4 py-2 text-xs">
              {tNav("getStarted")}
            </Link>
            <LanguageSwitcher currentLocale={locale as Locale} currentPath="/" />
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium" style={{ borderColor: "var(--color-border)", color: "var(--color-muted)", backgroundColor: "var(--color-surface)" }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--color-accent)" }} />
          {t("heroBadge")}
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {t("heroTitle")}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          {t("heroSubtitle")}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={`/${locale}/pricing`} className="btn-brand">
            {t("ctaPrimary")}
          </Link>
          <a
            href="#features"
            className="btn-outline-brand"
          >
            {t("ctaSecondary")}
          </a>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          {t("trialNote")}
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {t("trialNoMessages")}
        </p>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold">
          {t("featuresTitle")}
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border p-6 shadow-sm transition-all duration-200 hover:shadow-brand"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
              }}
            >
              <div
                className="mb-3 inline-flex rounded-xl p-2.5"
                style={{ background: "var(--gradient-brand)" }}
              >
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust */}
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
              className="flex items-start gap-3 rounded-xl border px-5 py-4 text-left shadow-sm"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
              }}
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

      {/* Online-Booking Section */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div
          className="rounded-2xl border p-8"
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
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-lg">
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
            <div className="shrink-0">
              <Link href={`/${locale}/termin-buchen`} className="btn-brand">
                {t("onlineBookingButton")}
              </Link>
            </div>
          </div>
        </div>
      </section>

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
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href={`/${locale}/pricing`}
            className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-slate-50"
          >
            {t("ctaPrimary")}
          </Link>
          <Link
            href={`/${locale}/pricing`}
            className="inline-flex items-center justify-center rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {t("comparePrices")}
          </Link>
        </div>
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
          <div className="mt-6 border-t pt-6 text-xs" style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}>
            <p>© {new Date().getFullYear()} {tNav("brand")}. {t("rights")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
