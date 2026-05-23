import type { Metadata } from "next";
import Link from "next/link";
import {
  Bell,
  CalendarClock,
  ListOrdered,
  ShieldCheck,
} from "lucide-react";
import { getTranslations } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: "SlotFill – Termine automatisch aus der Warteliste füllen",
    description: t("landing.heroSubtitle"),
  };
}

export default async function LandingPage() {
  const t = await getTranslations();

  const features = [
    { icon: ListOrdered, title: t("landing.feature1Title"), desc: t("landing.feature1Desc") },
    { icon: Bell, title: t("landing.feature2Title"), desc: t("landing.feature2Desc") },
    { icon: CalendarClock, title: t("landing.feature3Title"), desc: t("landing.feature3Desc") },
    { icon: ShieldCheck, title: t("landing.feature4Title"), desc: t("landing.feature4Desc") },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <span className="text-lg font-bold">{t("nav.brand")}</span>
        <nav className="flex items-center gap-4 text-sm">
          <a href="#features" className="hidden hover:underline sm:inline">
            {t("nav.features")}
          </a>
          <Link href="/pricing" className="hover:underline">
            {t("nav.pricing")}
          </Link>
          <Link href="/blog" className="hidden hover:underline sm:inline">
            {t("nav.blog")}
          </Link>
          <Link href="/kontakt" className="hidden hover:underline sm:inline">
            {t("nav.contact")}
          </Link>
          <Link href="/auth/login" className="hover:underline">
            {t("nav.login")}
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
          >
            {t("nav.getStarted")}
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {t("landing.heroTitle")}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          {t("landing.heroSubtitle")}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/pricing"
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            {t("landing.ctaPrimary")}
          </Link>
          <a
            href="#features"
            className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {t("landing.ctaSecondary")}
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold">
          {t("landing.featuresTitle")}
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

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">{t("landing.ctaBlockTitle")}</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          {t("landing.ctaBlockSubtitle")}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/pricing"
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            {t("landing.ctaPrimary")}
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {t("landing.comparePrices")}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap gap-4">
            <Link href="/impressum" className="hover:underline">
              {t("legal.impressumTitle")}
            </Link>
            <Link href="/datenschutz" className="hover:underline">
              {t("legal.datenschutzTitle")}
            </Link>
            <Link href="/agb" className="hover:underline">
              {t("legal.agbTitle")}
            </Link>
            <Link href="/blog" className="hover:underline">
              {t("nav.blog")}
            </Link>
            <Link href="/kontakt" className="hover:underline">
              {t("nav.contact")}
            </Link>
          </div>
          <p className="mt-4">{t("landing.footerNote")}</p>
          <p className="mt-2">
            © {new Date().getFullYear()} {t("nav.brand")}. {t("landing.rights")}
          </p>
        </div>
      </footer>
    </div>
  );
}
