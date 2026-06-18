import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MessageCircle, Phone, Building2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
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
          "ClinicSlotHub helps clinics in emerging healthcare markets organize WhatsApp, phone, reception and mobile patient requests in one simple waitlist. No patient login. The clinic stays in control.",
        url: APP_URL,
        inLanguage: locale,
        offers: {
          "@type": "Offer",
          price: "49",
          priceCurrency: "EUR",
          description: "Starter plan from €49/month, 14-day free trial included",
        },
      },
      {
        "@type": "Organization",
        name: "ClinicSlotHub",
        url: APP_URL,
        description: "ClinicSlotHub – Mobile request and waitlist desk for clinics in emerging healthcare markets.",
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

  const features = [
    { title: t("feature1Title"), desc: t("feature1Desc") },
    { title: t("feature2Title"), desc: t("feature2Desc") },
    { title: t("feature3Title"), desc: t("feature3Desc") },
    { title: t("feature4Title"), desc: t("feature4Desc") },
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

      {/* Positionierungs-Banner (Emerging Markets) */}
      {(() => {
        const banners: Record<string, string> = {
          de: "Neu: ClinicSlotHub — mobiler Anfrage- und Warteliste-Desk für Kliniken in wachstumsstarken Gesundheitsmärkten.",
          en: "New: ClinicSlotHub — mobile request and waitlist desk for clinics in emerging healthcare markets.",
          fr: "Nouveau : ClinicSlotHub — bureau mobile de demandes et de liste d'attente pour les cliniques des marchés de santé émergents.",
          es: "Nuevo: ClinicSlotHub — central móvil de solicitudes y lista de espera para clínicas en mercados de salud emergentes.",
          pt: "Novo: ClinicSlotHub — central móvel de pedidos e lista de espera para clínicas em mercados de saúde emergentes.",
          zh: "新功能：ClinicSlotHub — 面向新兴医疗市场诊所的移动请求与候补名单中心。",
          hi: "नया: ClinicSlotHub — उभरते स्वास्थ्य बाज़ारों के क्लीनिकों के लिए मोबाइल अनुरोध और प्रतीक्षा-सूची डेस्क।",
          ar: "جديد: ClinicSlotHub — مكتب الطلبات وقائمة الانتظار عبر الهاتف للعيادات في أسواق الرعاية الصحية الناشئة.",
          bn: "নতুন: ClinicSlotHub — উদীয়মান স্বাস্থ্যসেবা বাজারের ক্লিনিকগুলোর জন্য মোবাইল অনুরোধ ও অপেক্ষমাণ-তালিকা ডেস্ক।",
          ru: "Новое: ClinicSlotHub — мобильный центр заявок и листа ожидания для клиник на развивающихся рынках здравоохранения.",
        };
        const bannerText = banners[locale] ?? banners["en"];
        return (
          <div className="w-full border-b border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-900/20">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2">
              <p className="text-xs text-blue-700 dark:text-blue-300">{bannerText}</p>
              <Link
                href={`/${locale}/launch`}
                className="shrink-0 rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 transition"
              >
                {locale === "de" ? "Mehr erfahren" : locale === "fr" ? "En savoir plus" : locale === "es" ? "Saber más" : locale === "pt" ? "Saiba mais" : locale === "ar" ? "اعرف أكثر" : "Learn more"}
              </Link>
            </div>
          </div>
        );
      })()}

      {/* Hero */}
      <div className="w-full bg-gradient-to-b from-blue-50/70 to-white dark:from-blue-950/20 dark:to-transparent">
      <section className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:py-28">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl lg:text-[3.5rem] lg:leading-[1.05]">
          {t("heroTitle")}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
          {t("heroSubtitle")}
        </p>
        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href={`/${locale}/pricing`} className="btn-brand w-full px-7 py-3.5 text-base sm:w-auto">
            {t("ctaPrimary")}
          </Link>
          <Link href={`/${locale}/launch`} className="btn-outline-brand w-full px-7 py-3.5 text-base sm:w-auto">
            {t("demoCta")}
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
          {[t("heroTrust1"), t("heroTrust2"), t("heroTrust3")].map((item) => (
            <span key={item} className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "var(--color-accent)" }} />
              {item}
            </span>
          ))}
        </div>
      </section>
      </div>

      {/* Product preview — stylized clinic waitlist (language-neutral, no external assets) */}
      <div className="mx-auto -mt-10 mb-4 max-w-2xl px-4 sm:-mt-14">
        <div
          className="overflow-hidden rounded-2xl border bg-white shadow-xl shadow-slate-900/[0.06] dark:bg-slate-900"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center justify-between border-b px-5 py-3.5" style={{ borderColor: "var(--color-border)" }}>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t("onlineBookingTitle")}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {t("heroTrust2")}
            </span>
          </div>
          <ul className="divide-y" style={{ borderColor: "var(--color-border)" }}>
            {[
              { Icon: MessageCircle, initial: "A", tint: "#22c55e", dot: "#22c55e" },
              { Icon: Phone, initial: "M", tint: "#3b82f6", dot: "#f59e0b" },
              { Icon: Building2, initial: "S", tint: "#8b5cf6", dot: "#94a3b8" },
            ].map((r) => (
              <li key={r.initial} className="flex items-center gap-3 px-5 py-3.5">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: r.tint }}
                  aria-hidden
                >
                  {r.initial}
                </span>
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{ backgroundColor: "var(--color-surface-2)", color: r.tint }}
                  aria-hidden
                >
                  <r.Icon className="h-3.5 w-3.5" />
                </span>
                <div className="flex-1" aria-hidden>
                  <div className="h-2.5 w-28 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="mt-1.5 h-2 w-16 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: r.dot }} aria-hidden />
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500" aria-hidden>
          {t("onlineBookingBadge")}
        </p>
      </div>

      {/* How it works — 3 simple steps */}
      <section className="mx-auto max-w-5xl px-4 py-20">
        <h2 className="mb-12 text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          {t("stepsTitle")}
        </h2>
        <ol className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {[t("step1"), t("step2"), t("step3")].map((step, i) => (
            <li key={step} className="text-center sm:text-left">
              <span
                className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full text-base font-bold"
                style={{ backgroundColor: "var(--color-surface-2)", color: "var(--color-accent)" }}
              >
                {i + 1}
              </span>
              <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Who it's built for */}
      <div className="w-full bg-slate-50/60 dark:bg-transparent">
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          {t("audienceTitle")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
          {t("audienceIntro")}
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
          {t("audienceList")}
        </p>
      </section>
      </div>

      {/* Why clinics use it — calm benefit list */}
      <section id="features" className="mx-auto max-w-5xl px-4 py-20">
        <h2 className="mb-3 text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          {t("featuresTitle")}
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-base text-slate-500 dark:text-slate-400">
          {t("trustSubtitle")}
        </p>
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="flex items-start gap-4">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0" style={{ color: "var(--color-accent)" }} />
              <div>
                <h3 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust — subtle teal-tint section */}
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
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/${locale}/pricing`}
            className="inline-flex w-full items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-slate-50 sm:w-auto"
          >
            {t("ctaPrimary")}
          </Link>
          <Link
            href={`/${locale}/pricing`}
            className="inline-flex w-full items-center justify-center rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
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
          <div className="mt-6 border-t pt-6 text-xs" style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
            aria-label="Copyright">
            <p>© {new Date().getFullYear()} {tNav("brand")}. {t("rights")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
