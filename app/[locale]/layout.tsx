import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { locales, type Locale } from "@/i18n/routing";
import { LocaleHtmlLang } from "@/components/LocaleHtmlLang";

// Lokalisierte Basis-Metadata für alle [locale]-Seiten ohne eigene Description.
// Bewusst Anfrage-Sprache ("request"), keine Buchungs-/Bestätigungssprache.
const LAYOUT_META: Record<string, { title: string; description: string }> = {
  de: {
    title: "ClinicSlotHub – Klinik-Termine online anfragen",
    description:
      "ClinicSlotHub ermöglicht Patient:innen, Termine bei Praxen und Kliniken online anzufragen. Die Einrichtung prüft jede Anfrage und bestätigt manuell – mehrsprachig und datenschutzbewusst.",
  },
  en: {
    title: "ClinicSlotHub – Request clinic appointments online",
    description:
      "ClinicSlotHub lets patients request clinic appointments online in a simple, clear flow. Clinics review each request and confirm manually — multilingual and privacy-conscious.",
  },
  fr: {
    title: "ClinicSlotHub – Demander un rendez-vous en clinique en ligne",
    description:
      "ClinicSlotHub permet aux patients de demander en ligne un rendez-vous auprès de cabinets et de cliniques. L'établissement examine chaque demande et confirme manuellement – multilingue et respectueux de la protection des données.",
  },
  es: {
    title: "ClinicSlotHub – Solicite citas en clínicas en línea",
    description:
      "ClinicSlotHub permite a los pacientes solicitar citas en consultas y clínicas en línea. El centro revisa cada solicitud y la confirma manualmente – multilingüe y respetuoso con la protección de datos.",
  },
  pt: {
    title: "ClinicSlotHub – Solicite consultas em clínicas online",
    description:
      "O ClinicSlotHub permite que pacientes solicitem consultas em clínicas e consultórios online. A instituição analisa cada solicitação e confirma manualmente – multilíngue e atento à proteção de dados.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = LAYOUT_META[locale] ?? LAYOUT_META.en;
  return { title: meta.title, description: meta.description };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// WICHTIG: Dieses Layout rendert KEIN <html>/<body>. Das übernimmt ausschließlich
// das Root-Layout (app/layout.tsx). Ein zweites <html>/<body> hier würde zu
// doppelt verschachtelten Dokument-Tags und damit zu einem Hydration-Crash
// (React #418/#423 → "client-side exception") führen.
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  // SICHERHEIT/SAUBERKEIT: Nur öffentliche Namespaces an den Client ausliefern.
  // next-intl shippt alle übergebenen Message-Werte ins HTML/i18n-JSON. Private
  // Namespaces (auth/dashboard/admin/errors/…) dürfen NICHT öffentlich im HTML
  // landen. Öffentliche [locale]-Client-Komponenten nutzen nur diese Namespaces:
  const PUBLIC_NAMESPACES = ["nav", "landing", "pricing", "contact", "common"] as const;
  const publicMessages = Object.fromEntries(
    PUBLIC_NAMESPACES.filter((ns) => ns in (messages as Record<string, unknown>)).map(
      (ns) => [ns, (messages as Record<string, unknown>)[ns]],
    ),
  );

  return (
    <NextIntlClientProvider messages={publicMessages}>
      <LocaleHtmlLang locale={locale} />
      {children}
    </NextIntlClientProvider>
  );
}
