import type { Metadata } from "next";
import Link from "next/link";
import { PRODUCT_LOCALES, getPivot, PIVOT_COLORS } from "@/lib/pivot-content";
import { PivotShell } from "@/components/pivot/PivotShell";
import { DashboardMockup } from "@/components/pivot/DashboardMockup";
import { CANONICAL_URL, CONTACT_EMAIL } from "@/lib/brand";

export function generateStaticParams() {
  return PRODUCT_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const d = getPivot(locale);
  return {
    title: `${d.brand} — ${d.tagline}`,
    description: d.hero.subline,
    metadataBase: new URL(CANONICAL_URL),
    alternates: { canonical: `/${locale}`, languages: { en: "/en", fr: "/fr", es: "/es" } },
    openGraph: { title: `${d.brand} — ${d.tagline}`, description: d.hero.subline, url: `${CANONICAL_URL}/${locale}`, siteName: d.brand, type: "website", locale },
  };
}

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`mx-auto max-w-6xl px-4 ${className}`}>{children}</section>;
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const d = getPivot(locale);
  const L = (p: string) => `/${locale}${p}`;

  return (
    <PivotShell locale={locale}>
      {/* Hero + Mockup */}
      <div style={{ background: `linear-gradient(180deg, ${PIVOT_COLORS.tealTint}33, ${PIVOT_COLORS.bg})` }}>
        <Section className="grid grid-cols-1 items-center gap-10 py-16 lg:grid-cols-[1fr_1.05fr] lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ borderColor: PIVOT_COLORS.line, color: PIVOT_COLORS.tealDark }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: PIVOT_COLORS.teal }} /> {d.tagline}
            </span>
            <h1 className="mt-5 text-3xl font-extrabold leading-[1.12] tracking-tight sm:text-4xl lg:text-5xl" style={{ color: PIVOT_COLORS.ink }}>
              {d.hero.h1}
            </h1>
            <p className="mt-5 text-lg leading-relaxed" style={{ color: PIVOT_COLORS.ink }}>{d.hero.subline}</p>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed" style={{ color: PIVOT_COLORS.slate }}>{d.hero.supporting}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={`mailto:${CONTACT_EMAIL}`} className="rounded-xl px-7 py-3.5 text-center text-[15px] font-semibold text-white transition" style={{ backgroundColor: PIVOT_COLORS.teal }}>
                {d.cta.requestAccess}
              </a>
              <Link href={L("/demo")} className="rounded-xl border bg-white px-7 py-3.5 text-center text-[15px] font-semibold transition" style={{ borderColor: PIVOT_COLORS.line, color: PIVOT_COLORS.ink }}>
                {d.cta.viewDemo}
              </Link>
            </div>
            <p className="mt-6 text-[13px]" style={{ color: PIVOT_COLORS.slate }}>{d.hero.trust}</p>
          </div>
          <DashboardMockup locale={locale} />
        </Section>
      </div>

      {/* How it works */}
      <Section className="py-16" >
        <div id="how" className="scroll-mt-20">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: PIVOT_COLORS.ink }}>{d.howItWorks.title}</h2>
          <ol className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {d.howItWorks.steps.map((s, i) => (
              <li key={s} className="rounded-2xl border bg-white p-5" style={{ borderColor: PIVOT_COLORS.line }}>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-bold text-white" style={{ backgroundColor: PIVOT_COLORS.teal }}>{i + 1}</span>
                <p className="mt-3 text-[14px] leading-relaxed" style={{ color: PIVOT_COLORS.ink }}>{s}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* For clinics + For patients */}
      <Section className="grid grid-cols-1 gap-6 py-8 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-8" style={{ borderColor: PIVOT_COLORS.line }}>
          <h3 className="text-xl font-bold" style={{ color: PIVOT_COLORS.ink }}>{d.forClinics.title}</h3>
          <p className="mt-3 text-[14px] leading-relaxed" style={{ color: PIVOT_COLORS.slate }}>{d.forClinics.intro}</p>
          <ul className="mt-5 space-y-2.5">
            {d.forClinics.points.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-[14px]" style={{ color: PIVOT_COLORS.ink }}>
                <span className="mt-0.5 font-bold" style={{ color: PIVOT_COLORS.teal }}>✓</span>{p}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl p-8" style={{ backgroundColor: PIVOT_COLORS.tealDeep }}>
          <h3 className="text-xl font-bold text-white">{d.forPatients.title}</h3>
          <p className="mt-3 text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.78)" }}>{d.forPatients.intro}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {d.forPatients.points.map((p) => (
              <span key={p} className="rounded-lg px-3 py-1.5 text-[12.5px] font-medium" style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "#fff" }}>{p}</span>
            ))}
          </div>
        </div>
      </Section>

      {/* Demo preview */}
      <Section className="py-16">
        <div className="rounded-3xl border p-8 sm:p-10" style={{ borderColor: PIVOT_COLORS.line, backgroundColor: PIVOT_COLORS.surface }}>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight" style={{ color: PIVOT_COLORS.ink }}>{d.demo.title}</h2>
              <p className="mt-3 text-[15px]" style={{ color: PIVOT_COLORS.slate }}>{d.demo.intro}</p>
              <ul className="mt-5 space-y-1.5 text-[13px]" style={{ color: PIVOT_COLORS.slate }}>
                {d.demo.notes.map((n) => (<li key={n} className="flex items-start gap-2"><span style={{ color: PIVOT_COLORS.teal }}>·</span>{n}</li>))}
              </ul>
              <Link href={L("/demo")} className="mt-6 inline-block rounded-xl px-6 py-3 text-[14px] font-semibold text-white" style={{ backgroundColor: PIVOT_COLORS.teal }}>{d.cta.viewDemo}</Link>
            </div>
            <DashboardMockup locale={locale} />
          </div>
        </div>
      </Section>

      {/* Pricing prepared + Safety */}
      <Section className="grid grid-cols-1 gap-6 pb-8 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-8" style={{ borderColor: PIVOT_COLORS.line }}>
          <h3 className="text-lg font-bold" style={{ color: PIVOT_COLORS.ink }}>{d.pricing.title}</h3>
          <p className="mt-3 text-[14px] leading-relaxed" style={{ color: PIVOT_COLORS.slate }}>{d.pricing.note}</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="mt-5 inline-block rounded-xl border px-6 py-3 text-[14px] font-semibold" style={{ borderColor: PIVOT_COLORS.teal, color: PIVOT_COLORS.tealDark }}>{d.cta.pilotAccess}</a>
        </div>
        <div className="rounded-2xl border p-8" style={{ borderColor: PIVOT_COLORS.line, backgroundColor: PIVOT_COLORS.bg }}>
          <h3 className="text-lg font-bold" style={{ color: PIVOT_COLORS.ink }}>{d.safety.title}</h3>
          <p className="mt-3 text-[13px] leading-relaxed" style={{ color: PIVOT_COLORS.slate }}>{d.safety.body}</p>
          <Link href={L("/safety-notes")} className="mt-4 inline-block text-[13px] font-semibold underline" style={{ color: PIVOT_COLORS.tealDark }}>{d.nav.safety} →</Link>
        </div>
      </Section>
    </PivotShell>
  );
}
