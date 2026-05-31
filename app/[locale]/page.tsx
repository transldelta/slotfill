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
import { locales, type Locale } from "@/i18n/routing";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://slotfill.de";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const title = `SlotFill – ${t("heroTitle")}`;
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
      siteName: "SlotFill",
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
        name: "SlotFill",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description:
          "SlotFill hilft Arzt- und Facharztpraxen, kurzfristige Terminlücken aus der Warteliste zu füllen.",
        url: APP_URL,
        inLanguage: locale,
        offers: {
          "@type": "Offer",
          price: "29",
          priceCurrency: "EUR",
          description: "Starter-Plan ab 29 € pro Monat, 14-tägige Testphase inklusive",
        },
      },
      {
        "@type": "Organization",
        name: "SlotFill",
        url: APP_URL,
        description: "SlotFill – Software für die Wartelisten-Verwaltung in Arztpraxen.",
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
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />

      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <span className="text-lg font-bold">{tNav("brand")}</span>
        <nav className="flex items-center gap-4 text-sm">
          <a href="#features" className="hidden hover:underline sm:inline">
            {tNav("features")}
          </a>
          <Link href={`/${locale}/pricing`} className="hover:underline">
            {tNav("pricing")}
          </Link>
          <Link href={`/${locale}/blog`} className="hidden hover:underline sm:inline">
            {tNav("blog")}
          </Link>
          <Link href={`/${locale}/kontakt`} className="hidden hover:underline sm:inline">
            {tNav("contact")}
          </Link>
          <Link href="/auth/login" className="hover:underline">
            {tNav("login")}
          </Link>
          <Link
            href={`/${locale}/pricing`}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
          >
            {tNav("getStarted")}
          </Link>
          <LanguageSwitcher currentLocale={locale as Locale} currentPath="/" />
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {t("heroTitle")}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          {t("heroSubtitle")}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={`/${locale}/pricing`}
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            {t("ctaPrimary")}
          </Link>
          <a
            href="#features"
            className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-3 inline-flex rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
                <f.icon className="h-5 w-5" />
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
              className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {point}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">{t("ctaBlockTitle")}</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          {t("ctaBlockSubtitle")}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href={`/${locale}/pricing`}
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            {t("ctaPrimary")}
          </Link>
          <Link
            href={`/${locale}/pricing`}
            className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {t("comparePrices")}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap gap-4">
            <Link href="/impressum" className="hover:underline">
              {tLegal("impressumTitle")}
            </Link>
            <Link href="/datenschutz" className="hover:underline">
              {tLegal("datenschutzTitle")}
            </Link>
            <Link href="/agb" className="hover:underline">
              {tLegal("agbTitle")}
            </Link>
            <Link href={`/${locale}/blog`} className="hover:underline">
              {tNav("blog")}
            </Link>
            <Link href={`/${locale}/kontakt`} className="hover:underline">
              {tNav("contact")}
            </Link>
          </div>
          <p className="mt-4">{t("footerNote")}</p>
          <p className="mt-2">
            © {new Date().getFullYear()} {tNav("brand")}. {t("rights")}
          </p>
        </div>
      </footer>
    </div>
  );
}
