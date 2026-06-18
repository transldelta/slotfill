import type { Metadata } from "next";
import Link from "next/link";
import { locales, type Locale } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/language-switcher";
import { CANONICAL_URL } from "@/lib/brand";

/**
 * Share Kit – kopierfertige Texte für manuelles Teilen.
 * DE + EN vollständig. Andere Locales leiten auf EN weiter.
 */

export const dynamic = "force-static";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type ShareContent = {
  dir: "ltr" | "rtl";
  title: string;
  subtitle: string;
  note: string;
  shortPostLabel: string;
  shortPost: string;
  longPostLabel: string;
  longPost: string;
  dmLabel: string;
  dm: string;
  emailLabel: string;
  email: string;
  communityLabel: string;
  community: string;
  bioLabel: string;
  bio: string;
  hashtagsLabel: string;
  hashtags: string;
  ogTitle: string;
  ogDesc: string;
};

const SHARE: Record<string, ShareContent> = {
  de: {
    dir: "ltr",
    title: "Share Kit – ClinicSlotHub",
    subtitle: "Kopierfertige Texte für manuelles Teilen. Kein automatischer Versand. Nur für persönlichen Einsatz.",
    note: "Alle Texte: keine Fake-Kunden, kein Umsatz, keine Garantien, keine Kaltakquise.",
    shortPostLabel: "Kurzpost (Social Media, 1–2 Sätze)",
    shortPost: `Ich habe ClinicSlotHub gestartet – eine digitale Wartelisten-Plattform für Praxen, Kliniken und Healthcare Provider. Jede Praxis bekommt einen eigenen öffentlichen Buchungslink. Mehrsprachig, datenschutzbewusst, 14 Tage kostenlos. → clinicslothub.com`,
    longPostLabel: "Langer Post (LinkedIn / Community)",
    longPost: `Ich habe ClinicSlotHub öffentlich gestartet.

ClinicSlotHub ist eine mehrsprachige Plattform, mit der Kliniken in wachstumsstarken Gesundheitsmärkten WhatsApp-, Telefon-, Rezeptions- und mobile Patientenanfragen in einer einfachen Warteliste organisieren.

Das Problem: Wenn ein Patient absagt, bleibt der Termin oft leer – weil die Praxis keine Zeit hat, die Warteliste manuell durchzugehen.

Die Lösung: Jede Praxis bekommt einen eigenen öffentlichen Buchungslink – teilbar per Website, E-Mail oder QR-Code. Patienten stellen darüber eine Anfrage, ohne sich anzumelden. Die Praxis bestätigt oder lehnt direkt im Dashboard ab.

Aktuell: Early Access. Keine übertriebenen Zahlen. Ein funktionierendes Produkt, das jetzt getestet werden soll.

14 Tage kostenlos, keine Kreditkarte: clinicslothub.com

Feedback und Fragen sehr willkommen.`,
    dmLabel: "DM / Kurznachricht",
    dm: `Hallo! Ich habe ClinicSlotHub gestartet – eine digitale Wartelisten-Plattform für Praxen. Falls du jemanden kennst, der Terminlücken-Probleme hat: clinicslothub.com – 14 Tage kostenlos, keine Kreditkarte.`,
    emailLabel: "E-Mail-Text (zum Weiterleiten)",
    email: `Betreff: ClinicSlotHub – digitale Warteliste für Praxen

Hallo,

ich möchte dir ClinicSlotHub vorstellen – eine neue SaaS-Plattform für Praxen, Kliniken und Healthcare Provider.

Was es löst: Wenn ein Termin kurzfristig wegfällt, bleibt der Slot oft leer. ClinicSlotHub digitalisiert die Warteliste: Patienten tragen sich ein, bei einem freien Termin werden passende Patienten per E-Mail benachrichtigt.

Was es ist: Live-MVP, Early Access, Zugang auf Anfrage.
Was es nicht ist: Keine Garantien, keine Fake-Kunden, keine übertriebenen Versprechen.

Link: clinicslothub.com

Bei Fragen bin ich erreichbar unter transl.delta@gmail.com.

Viele Grüße`,
    communityLabel: "Community-Post (Forum / Reddit / Indie Hackers)",
    community: `[Eigenprojekt] Mobiler Anfrage- und Warteliste-Desk für Kliniken in wachstumsstarken Gesundheitsmärkten – Early Access, Feedback willkommen

Ich habe ClinicSlotHub entwickelt: eine mehrsprachige SaaS für Arzt- und Therapiepraxen, die Wartelisten digital verwalten und freie Termine schneller besetzen möchten.

Status: Live-MVP, Early Access.
Stack: Next.js, modern cloud infrastructure.
10 Sprachen: DE, EN, FR, ES, PT, ZH, HI, AR, BN, RU.

→ clinicslothub.com

Freue mich über technisches und produktbezogenes Feedback.`,
    bioLabel: "Profil-Bio (1 Satz)",
    bio: `Ich entwickle ClinicSlotHub – mobiler Anfrage- und Warteliste-Desk für Kliniken in wachstumsstarken Gesundheitsmärkten. clinicslothub.com`,
    hashtagsLabel: "Hashtag-Vorschläge",
    hashtags: `#ClinicSlotHub #HealthcareSaaS #Warteliste #Praxismanagement #SoftLaunch #IndieHacker #B2BSaaS #HealthTech #Terminmanagement`,
    ogTitle: "Share Kit – ClinicSlotHub",
    ogDesc: "Kopierfertige Launch-Texte für ClinicSlotHub. Kein automatischer Versand.",
  },
  en: {
    dir: "ltr",
    title: "Share Kit – ClinicSlotHub",
    subtitle: "Ready-to-copy launch texts for manual sharing. No automated sending. Personal use only.",
    note: "All texts: no fake customers, no revenue claims, no guarantees, no cold outreach.",
    shortPostLabel: "Short post (social media, 1–2 sentences)",
    shortPost: `I launched ClinicSlotHub – a digital waitlist platform for clinics, medical practices and healthcare providers. Each practice gets its own public booking link. Multilingual, privacy-conscious, 14-day free trial. → clinicslothub.com`,
    longPostLabel: "Long post (LinkedIn / community)",
    longPost: `I publicly launched ClinicSlotHub.

ClinicSlotHub is a multilingual platform that helps clinics in emerging healthcare markets organize WhatsApp, phone, reception and mobile patient requests in one simple waitlist.

The problem: when a patient cancels, the slot often stays empty — because the practice has no time to manually go through the waitlist.

The solution: every practice gets its own public booking link — shareable via website, email or QR code. Patients submit a request without creating an account. The practice confirms or rejects directly in the dashboard.

Current status: early access. No exaggerated numbers. A working product that's now being tested.

14-day free trial, no credit card: clinicslothub.com

Feedback and questions very welcome.`,
    dmLabel: "DM / short message",
    dm: `Hi! I launched ClinicSlotHub — a digital waitlist platform for medical practices. If you know anyone dealing with appointment cancellation gaps: clinicslothub.com — 14 days free, no credit card.`,
    emailLabel: "Email text (to forward)",
    email: `Subject: ClinicSlotHub – digital waitlist for clinics and practices

Hi,

I'd like to introduce ClinicSlotHub — a new SaaS platform for practices, clinics and healthcare providers.

What it solves: when an appointment is cancelled at short notice, the slot often stays empty. ClinicSlotHub digitalises the waitlist: patients sign up, and when a slot opens, matching patients are notified by email.

What it is: live MVP, early access, access on request.
What it isn't: no guarantees, no fake customers, no exaggerated claims.

Link: clinicslothub.com

For questions: transl.delta@gmail.com

Best regards`,
    communityLabel: "Community post (forum / Reddit / Indie Hackers)",
    community: `[My project] Mobile request and waitlist desk for clinics in emerging healthcare markets — early access, feedback welcome

I built ClinicSlotHub: a multilingual SaaS for medical and therapy practices that want to manage waitlists digitally and fill appointment slots faster.

Status: live MVP, early access.
Stack: Next.js, modern cloud infrastructure.
10 languages: DE, EN, FR, ES, PT, ZH, HI, AR, BN, RU.

→ clinicslothub.com

Happy to get technical and product feedback.`,
    bioLabel: "Profile bio (1 sentence)",
    bio: `Building ClinicSlotHub — mobile request and waitlist desk for clinics in emerging healthcare markets. clinicslothub.com`,
    hashtagsLabel: "Hashtag suggestions",
    hashtags: `#ClinicSlotHub #HealthcareSaaS #Waitlist #PracticeManagement #SoftLaunch #IndieHacker #B2BSaaS #HealthTech #AppointmentManagement`,
    ogTitle: "Share Kit – ClinicSlotHub",
    ogDesc: "Ready-to-copy launch texts for ClinicSlotHub. No automated sending.",
  },
};

function getShare(locale: string): ShareContent {
  return SHARE[locale] ?? SHARE["en"];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const s = getShare(locale);
  return {
    title: `${s.ogTitle} – ClinicSlotHub`,
    description: s.ogDesc,
    metadataBase: new URL(CANONICAL_URL),
    alternates: {
      canonical: `/${locale}/share`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/share`])) as Record<string, string>,
    },
    openGraph: { title: s.ogTitle, description: s.ogDesc, siteName: "ClinicSlotHub", type: "website" },
  };
}

function TextBlock({ label, content }: { label: string; content: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50">
      <div className="border-b border-slate-200 px-4 py-2.5 dark:border-slate-700">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</p>
      </div>
      <pre className="whitespace-pre-wrap break-words px-4 py-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-sans">
        {content}
      </pre>
    </div>
  );
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const s = getShare(locale);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12" dir={s.dir}>
      <div className="mb-6 flex justify-end">
        <LanguageSwitcher currentLocale={locale as Locale} currentPath="/share" />
      </div>

      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{s.title}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{s.subtitle}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">{s.note}</p>

      <div className="mt-8 space-y-5">
        <TextBlock label={s.shortPostLabel} content={s.shortPost} />
        <TextBlock label={s.longPostLabel} content={s.longPost} />
        <TextBlock label={s.dmLabel} content={s.dm} />
        <TextBlock label={s.emailLabel} content={s.email} />
        <TextBlock label={s.communityLabel} content={s.community} />
        <TextBlock label={s.bioLabel} content={s.bio} />
        <TextBlock label={s.hashtagsLabel} content={s.hashtags} />
      </div>

      <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-700">
        <Link href={`/${locale}/launch`} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
          ← {locale === "de" ? "Zurück zur Launch-Seite" : "Back to Launch page"}
        </Link>
      </div>
    </main>
  );
}
