import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { CheckCircle2, Mail, Globe, ArrowRight, Info, UserCheck, LayoutDashboard, Link as LinkIcon } from "lucide-react";
import { locales, type Locale } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/language-switcher";
import { CANONICAL_URL } from "@/lib/brand";
import { localesNeedingNativeReview } from "@/lib/locale-quality";

export const dynamic = "force-static";

// Public Language Gate: nur en/de haben eine geprüfte Detail-Launch-Seite.
// needs_review-Locales (fr/es/pt/ar/hi/bn/ru/zh) werden auf ihre saubere,
// vollständig lokalisierte Startseite geleitet — keine veraltete Launch-Copy.
const LAUNCH_DETAIL_LOCALES = ["en", "de"] as const;
function shouldRedirectLaunch(locale: string): boolean {
  return localesNeedingNativeReview().includes(locale) || !LAUNCH_DETAIL_LOCALES.includes(locale as "en" | "de");
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// ─── Lokalisierter Inhalt ─────────────────────────────────────────────────────

type LaunchContent = {
  dir: "ltr" | "rtl";
  badge: string;
  headline: string;
  subline: string;
  problem: string;
  solution: string;
  whatWorks: string;
  features: string[];
  statusTitle: string;
  status: string;
  trialNote: string;
  legalNote: string;
  ctaTrial: string;
  ctaContact: string;
  ctaBook: string;
  ogTitle: string;
  ogDesc: string;
};

const CONTENT: Record<string, LaunchContent> = {
  de: {
    dir: "ltr",
    badge: "Early Access · Juni 2026",
    headline: "ClinicSlotHub – der mobile Anfrage- und Warteliste-Desk für Kliniken in wachstumsstarken Gesundheitsmärkten",
    subline:
      "Für Kliniken in wachstumsstarken Gesundheitsmärkten, die WhatsApp-, Telefon-, Rezeptions- und mobile Patientenanfragen in einer einfachen Warteliste organisieren möchten.",
    problem:
      "Viele Kliniken verlieren täglich Zeit, weil Anfragen über WhatsApp, Telefon und Rezeption verstreut ankommen und manuell koordiniert werden. Das kostet Personal und führt zu unnötigen Leerterminen.",
    solution:
      "ClinicSlotHub bündelt diesen Prozess: Jede Klinik erhält einen eigenen öffentlichen Anfrage-Link, teilbar via WhatsApp, Website, E-Mail oder QR-Code. Patienten senden ohne Login eine Anfrage; die Klinik sieht diese im Dashboard und prüft sie. WhatsApp-, Telefon- und Rezeptions-Fallback bleiben in der Hand der Klinik – kein automatischer Versand, keine automatische Terminbestätigung.",
    whatWorks: "Was aktuell funktioniert:",
    features: [
      "Eigener öffentlicher Anfrage-Link pro Klinik – teilbar via WhatsApp, Website, E-Mail oder QR-Code",
      "Patienten senden Anfrage ohne Login – kein Konto, kein Aufwand",
      "Anfragen im Dashboard prüfen und beantworten",
      "Einfache digitale Warteliste mit strukturierten Patientenprofilen",
      "Funktioniert mit WhatsApp, Telefon und Rezeption · kein zusätzliches Tool nötig",
      "Mehrsprachige Oberfläche in 10 Sprachen",
      "Early Access – Zugang auf Anfrage",
    ],
    statusTitle: "Aktueller Status",
    status:
      "Early Access für Kliniken in wachstumsstarken Gesundheitsmärkten. Ein funktionierendes Live-Produkt, das jetzt mit echten Kliniken getestet und verbessert wird. Keine Erfolgsversprechen, keine erfundenen Zahlen.",
    trialNote: "Zugang auf Anfrage – wir begleiten die Einrichtung der ersten Test-Klinik.",
    legalNote:
      "Hinweis: Lokale rechtliche und datenschutzrechtliche Anforderungen sollten vor dem produktiven Einsatz mit echten Patientendaten geprüft werden.",
    ctaTrial: "Zugang anfragen",
    ctaContact: "Kontakt aufnehmen",
    ctaBook: "Demo-Anfrage testen",
    ogTitle: "ClinicSlotHub – Early Access",
    ogDesc:
      "Mobiler Anfrage- und Warteliste-Desk für Kliniken in wachstumsstarken Gesundheitsmärkten.",
  },
  en: {
    dir: "ltr",
    badge: "Early Access · June 2026",
    headline: "ClinicSlotHub – the mobile request and waitlist desk for clinics in emerging healthcare markets",
    subline:
      "For clinics in emerging healthcare markets that want to organize WhatsApp, phone, reception and mobile patient requests in one simple waitlist.",
    problem:
      "Many clinics lose time every day because requests arrive scattered across WhatsApp, phone and reception and are coordinated manually. This costs staff time and leads to avoidable empty slots.",
    solution:
      "ClinicSlotHub brings this together: each clinic gets its own public request link that can be shared via WhatsApp, a website, by email or as a QR code. Patients submit a request without logging in; the clinic sees the request in the dashboard and reviews it. WhatsApp, phone and reception fallback stay in the clinic's hands — no automatic sending and no automatic appointment confirmation.",
    whatWorks: "What is working right now:",
    features: [
      "Own public request link per clinic – shareable via WhatsApp, website, email or QR code",
      "Patients submit requests without logging in – no account, no friction",
      "Review and respond to requests directly in the dashboard",
      "Simple digital waitlist with structured patient profiles",
      "Works with WhatsApp, phone and reception · no extra tool needed",
      "Multilingual interface in 10 languages",
      "Early access – request access to get started",
    ],
    statusTitle: "Current status",
    status:
      "Early access for clinics in emerging healthcare markets. A working live product that is now being tested and improved with real clinics. No promises of results and no invented numbers.",
    trialNote: "Access on request — we help you set up the first test clinic.",
    legalNote:
      "Note: Local legal and data protection requirements should be reviewed before productive use with real patient data.",
    ctaTrial: "Request access",
    ctaContact: "Get in touch",
    ctaBook: "Try the demo request",
    ogTitle: "ClinicSlotHub – Early Access",
    ogDesc:
      "Mobile request and waitlist desk for clinics in emerging healthcare markets.",
  },
};

function getContent(locale: string): LaunchContent {
  return CONTENT[locale] ?? CONTENT["en"];
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const c = getContent(locale);
  return {
    title: `${c.ogTitle} – ClinicSlotHub`,
    description: c.ogDesc,
    metadataBase: new URL(CANONICAL_URL),
    alternates: {
      canonical: `/${locale}/launch`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `/${l}/launch`]),
      ) as Record<string, string>,
    },
    openGraph: {
      title: c.ogTitle,
      description: c.ogDesc,
      url: `${CANONICAL_URL}/${locale}/launch`,
      siteName: "ClinicSlotHub",
      type: "website",
      images: [
        {
          url: `${CANONICAL_URL}/images/launch/01-home-de-hero.png`,
          width: 1440,
          height: 1000,
          alt: "ClinicSlotHub Dashboard",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: c.ogTitle,
      description: c.ogDesc,
    },
  };
}

// ─── Lokalisierte 3-Schritt-Erklärung ────────────────────────────────────────

type HowItWorks = {
  steps: Array<{ title: string; desc: string }>;
};

const HOW_IT_WORKS: Record<string, HowItWorks> = {
  de: {
    steps: [
      {
        title: "Praxis erhält eigenen Buchungslink",
        desc: "Nach der Registrierung bekommt jede Praxis einen einzigartigen Link, den sie auf ihrer Website, per E-Mail oder als QR-Code teilen kann.",
      },
      {
        title: "Patienten stellen Anfragen – ohne Login",
        desc: "Patienten öffnen den Link, füllen das Formular aus und senden ihre Anfrage. Kein Konto, kein Passwort – null Aufwand.",
      },
      {
        title: "Praxis verwaltet alles im Dashboard",
        desc: "Anfragen, Warteliste und Benachrichtigungen – alles an einem Ort. Die Praxis bestätigt oder lehnt Termine manuell ab.",
      },
    ],
  },
  en: {
    steps: [
      {
        title: "Practice gets a booking link",
        desc: "After registration each practice gets a unique booking link to share on their website, by email or as a QR code.",
      },
      {
        title: "Patients submit requests — no login",
        desc: "Patients open the link, fill in the form and submit. No account, no password — zero friction.",
      },
      {
        title: "Practice manages everything in the dashboard",
        desc: "Requests, waitlist and notifications — all in one place. The practice confirms or declines appointments manually.",
      },
    ],
  },
};

function getHowItWorks(locale: string): HowItWorks {
  return HOW_IT_WORKS[locale] ?? HOW_IT_WORKS["en"];
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default async function LaunchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Language Gate: needs_review-Locales sehen keine veraltete Launch-Copy.
  if (shouldRedirectLaunch(locale)) {
    redirect(`/${locale}`);
  }

  const c = getContent(locale);
  const hiw = getHowItWorks(locale);
  const stepIcons = [LinkIcon, UserCheck, LayoutDashboard];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/35 to-white dark:from-blue-950/10 dark:to-transparent">
    <main className="mx-auto max-w-4xl px-4 py-12" dir={c.dir}>
      {/* Language switcher */}
      <div className="mb-6 flex justify-end">
        <LanguageSwitcher currentLocale={locale as Locale} currentPath="/launch" />
      </div>

      {/* Badge */}
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700 shadow-sm dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
        {c.badge}
      </div>

      {/* Headline */}
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl lg:text-5xl">
        {c.headline}
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
        {c.subline}
      </p>

      {/* CTA buttons — above fold */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/auth/register" className="btn-brand">
          {c.ctaTrial}
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Link>
        <Link
          href={`/${locale}/kontakt`}
          className="btn-outline-brand"
        >
          <Mail className="mr-1.5 h-4 w-4" />
          {c.ctaContact}
        </Link>
      </div>

      {/* Hero screenshot */}
      <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 shadow-lg dark:border-slate-700">
        <Image
          src="/images/launch/01-home-de-hero.png"
          alt="ClinicSlotHub Dashboard"
          width={1440}
          height={1000}
          className="w-full"
          priority
        />
      </div>

      {/* 3-step "how it works" */}
      <section className="mt-14">
        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Wie es funktioniert
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {hiw.steps.map((step, i) => {
            const Icon = stepIcons[i];
            return (
              <div
                key={i}
                className="relative flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                {/* Step number */}
                <span className="absolute right-4 top-4 text-xs font-bold text-slate-300 dark:text-slate-700">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm" style={{ background: "var(--gradient-brand)" }}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {step.title}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="mt-14 space-y-5">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300">
            {c.problem}
          </p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-6 dark:border-blue-900/30 dark:bg-blue-950/10">
          <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300">
            {c.solution}
          </p>
        </div>
      </section>

      {/* What works now */}
      <section className="mt-10 rounded-2xl border border-slate-100 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-800/30">
        <h2 className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {c.whatWorks}
        </h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {c.features.map((f, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              {f}
            </li>
          ))}
        </ul>
      </section>

      {/* Screenshot pair */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-md dark:border-slate-700">
          <Image
            src="/images/launch/02-booking-form-de.png"
            alt="Booking form"
            width={1440}
            height={1100}
            className="w-full"
          />
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-md dark:border-slate-700">
          <Image
            src="/images/launch/06-mobile-home-de.png"
            alt="Mobile view"
            width={390}
            height={844}
            className="w-full"
          />
        </div>
      </div>

      {/* Status */}
      <section className="mt-10 surface-card p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {c.statusTitle}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {c.status}
        </p>
        <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">{c.trialNote}</p>
      </section>

      {/* Languages */}
      <section className="mt-8 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Globe className="h-4 w-4 shrink-0 text-blue-500" />
        <span>DE · EN · FR · ES · PT · ZH · HI · AR · BN · RU</span>
      </section>

      {/* Legal note */}
      <div className="mt-6 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-900/10">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
          {c.legalNote}
        </p>
      </div>

      {/* Bottom links */}
      <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-slate-200 pt-6 dark:border-slate-700">
        <Link
          href={`/${locale}/blog`}
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          → Blog
        </Link>
        <Link
          href={`/${locale}/pricing`}
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          → Pricing
        </Link>
        <Link
          href={`/${locale}/termin-buchen`}
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          → {c.ctaBook}
        </Link>
      </div>
    </main>
    </div>
  );
}
