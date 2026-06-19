import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, ArrowRight, Globe, Mail, BookOpen, DollarSign } from "lucide-react";
import { locales, type Locale } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/language-switcher";
import { CANONICAL_URL } from "@/lib/brand";

/**
 * Public Launch Hub – ersetzt Social-Media-Kanal.
 * Zentrale Seite für alle öffentlichen Launch-Informationen.
 * Alle Inhalte: DE + EN. Andere Locales leiten auf Launch-Seite weiter.
 */

export const dynamic = "force-static";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type HubContent = {
  dir: "ltr" | "rtl";
  title: string;
  subtitle: string;
  what: string;
  whatDesc: string;
  forWhom: string;
  forWhomItems: string[];
  tryTitle: string;
  trySteps: string[];
  screenshotsTitle: string;
  linksTitle: string;
  statusNote: string;
  legalNote: string;
  ogTitle: string;
  ogDesc: string;
};

const HUB: Record<string, HubContent> = {
  de: {
    dir: "ltr",
    title: "ClinicSlotHub – Launch-Zentrale",
    subtitle: "Alles, was du über ClinicSlotHub wissen musst – an einem Ort.",
    what: "Was ist ClinicSlotHub?",
    whatDesc: "ClinicSlotHub ist eine browserbasierte SaaS-Plattform für Praxen, Kliniken, Therapiezentren und Healthcare Provider weltweit. Jede Praxis erhält einen eigenen öffentlichen Buchungslink – teilbar per Website, E-Mail oder QR-Code. Patienten stellen darüber eine Terminanfrage, ohne sich anzumelden. Die Praxis bestätigt oder lehnt Anfragen direkt im Dashboard ab.",
    forWhom: "Für wen?",
    forWhomItems: [
      "Arztpraxen (Allgemein- und Fachärzte)",
      "Physiotherapie, Logopädie, Ergotherapie",
      "Psychotherapiepraxen",
      "Zahnarztpraxen",
      "Kleine Kliniken und Healthcare Provider weltweit",
    ],
    tryTitle: "Wie kann ich es testen?",
    trySteps: [
      "clinicslothub.com aufrufen",
      "Auf ‚Kostenlos testen' klicken",
      "E-Mail + Passwort eingeben, E-Mail bestätigen",
      "Im Dashboard deinen eigenen öffentlichen Buchungslink kopieren",
      "14 Tage kostenlos alle Funktionen nutzen – keine Kreditkarte",
    ],
    screenshotsTitle: "So sieht die Plattform aus",
    linksTitle: "Wichtige Links",
    statusNote: "Aktueller Status: Öffentlicher Soft Launch · Keine zahlenden Kunden · Kein Umsatz · Ehrliches Produkt · Feedback willkommen",
    legalNote: "Lokale rechtliche und datenschutzrechtliche Anforderungen vor produktivem Einsatz mit echten Patientendaten prüfen.",
    ogTitle: "ClinicSlotHub – Öffentliche Launch-Zentrale",
    ogDesc: "Alles über ClinicSlotHub: Was es ist, für wen, wie testen. Mehrsprachige SaaS für Praxen weltweit.",
  },
  en: {
    dir: "ltr",
    title: "ClinicSlotHub – Launch Hub",
    subtitle: "Everything you need to know about ClinicSlotHub — in one place.",
    what: "What is ClinicSlotHub?",
    whatDesc: "ClinicSlotHub is a browser-based SaaS platform for practices, clinics, therapy centers and healthcare providers worldwide. Every practice gets its own public booking link — shareable via website, email or QR code. Patients submit an appointment request without creating an account. The practice confirms or rejects requests directly in the dashboard.",
    forWhom: "Who is it for?",
    forWhomItems: [
      "General practitioners and specialist practices",
      "Physiotherapy, speech therapy, occupational therapy",
      "Psychotherapy practices",
      "Dental practices",
      "Small clinics and healthcare providers worldwide",
    ],
    tryTitle: "How can I try it?",
    trySteps: [
      "Visit clinicslothub.com",
      "Click 'Try for Free'",
      "Enter email + password, confirm your email",
      "Copy your own public booking link from the dashboard",
      "Use all features free for 14 days — no credit card",
    ],
    screenshotsTitle: "What the platform looks like",
    linksTitle: "Key links",
    statusNote: "Current status: Public soft launch · No paying customers · No revenue · Honest product · Feedback welcome",
    legalNote: "Local legal and data protection requirements should be reviewed before productive use with real patient data.",
    ogTitle: "ClinicSlotHub – Public Launch Hub",
    ogDesc: "Everything about ClinicSlotHub: what it is, who it's for, how to try it. Multilingual SaaS for healthcare worldwide.",
  },
};

function getHub(locale: string): HubContent {
  return HUB[locale] ?? HUB["en"];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const h = getHub(locale);
  return {
    title: `${h.ogTitle} – ClinicSlotHub`,
    description: h.ogDesc,
    // Alte Kampagnenseite – nicht Teil der aktuellen Positionierung, nicht indexieren.
    robots: { index: false, follow: false },
    metadataBase: new URL(CANONICAL_URL),
    alternates: {
      canonical: `/${locale}/public-launch`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/public-launch`])) as Record<string, string>,
    },
    openGraph: {
      title: h.ogTitle,
      description: h.ogDesc,
      url: `${CANONICAL_URL}/${locale}/public-launch`,
      siteName: "ClinicSlotHub",
      type: "website",
      images: [{ url: `${CANONICAL_URL}/images/launch/01-home-de-hero.png`, width: 1440, height: 1000 }],
    },
    twitter: { card: "summary_large_image", title: h.ogTitle, description: h.ogDesc },
  };
}

export default async function PublicLaunchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const h = getHub(locale);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12" dir={h.dir}>
      <div className="mb-6 flex justify-end">
        <LanguageSwitcher currentLocale={locale as Locale} currentPath="/public-launch" />
      </div>

      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{h.title}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{h.subtitle}</p>

      {/* Status banner */}
      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
        {h.statusNote}
      </div>

      {/* What */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{h.what}</h2>
        <p className="mt-3 leading-relaxed text-slate-700 dark:text-slate-300">{h.whatDesc}</p>
      </section>

      {/* For whom */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{h.forWhom}</h2>
        <ul className="mt-3 space-y-2">
          {h.forWhomItems.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Screenshots */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{h.screenshotsTitle}</h2>
        <div className="mt-4 space-y-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-700">
            <Image src="/images/launch/01-home-de-hero.png" alt="Homepage DE" width={1440} height={1000} className="w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm dark:border-slate-700">
              <Image src="/images/launch/03-pricing-de.png" alt="Pricing" width={1440} height={1000} className="w-full" />
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm dark:border-slate-700">
              <Image src="/images/launch/04-blog-de.png" alt="Blog" width={1440} height={1100} className="w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm dark:border-slate-700">
              <Image src="/images/launch/05-home-en-hero.png" alt="Homepage EN" width={1440} height={1000} className="w-full" />
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm dark:border-slate-700">
              <Image src="/images/launch/06-mobile-home-de.png" alt="Mobile" width={390} height={844} className="w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* How to try */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{h.tryTitle}</h2>
        <ol className="mt-3 space-y-2">
          {h.trySteps.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
        <div className="mt-5">
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            {locale === "de" ? "Jetzt registrieren" : "Register now"} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Key links */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{h.linksTitle}</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { href: `/${locale}/launch`, icon: Globe, label: locale === "de" ? "Launch-Seite" : "Launch page" },
            { href: `/${locale}/pricing`, icon: DollarSign, label: locale === "de" ? "Preise" : "Pricing" },
            { href: `/${locale}/blog`, icon: BookOpen, label: "Blog" },
            { href: `/${locale}/kontakt`, icon: Mail, label: locale === "de" ? "Kontakt" : "Contact" },
            { href: `/${locale}/termin-buchen`, icon: ArrowRight, label: locale === "de" ? "Terminanfrage testen" : "Test booking form" },
            { href: `/${locale}/share`, icon: ArrowRight, label: locale === "de" ? "Share Kit" : "Share Kit" },
          ].map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Icon className="h-4 w-4 text-blue-500" />
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* Legal note */}
      <p className="mt-8 text-xs text-slate-500 dark:text-slate-500 leading-relaxed">{h.legalNote}</p>
    </main>
  );
}
