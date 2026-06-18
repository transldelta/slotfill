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
  const title = `${d.hero.h1} — ${d.brand}`;
  return {
    title,
    description: d.hero.subline,
    metadataBase: new URL(CANONICAL_URL),
    alternates: { canonical: `/${locale}`, languages: { en: "/en", fr: "/fr", es: "/es" } },
    openGraph: { title, description: d.hero.subline, url: `${CANONICAL_URL}/${locale}`, siteName: d.brand, type: "website", locale },
  };
}

function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return <section id={id} className={`mx-auto max-w-6xl px-4 ${className}`}>{children}</section>;
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const d = getPivot(locale);
  const L = (p: string) => `/${locale}${p}`;
  const mailto = `mailto:${CONTACT_EMAIL}`;

  return (
    <PivotShell locale={locale}>
      {/* ── Hero + Mockup ─────────────────────────────────────────────────── */}
      <div style={{ background: `linear-gradient(180deg, ${PIVOT_COLORS.tealTint}55, ${PIVOT_COLORS.bg})` }}>
        <Section className="grid grid-cols-1 items-center gap-12 py-16 lg:grid-cols-[1fr_1.15fr] lg:py-24">
          <div>
            {/* Product label — smaller than the plain promise below */}
            <span className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ borderColor: PIVOT_COLORS.line, color: PIVOT_COLORS.tealDark }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: PIVOT_COLORS.teal }} /> {d.tagline}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl" style={{ color: PIVOT_COLORS.ink }}>
              {d.hero.h1}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed" style={{ color: PIVOT_COLORS.ink }}>{d.hero.subline}</p>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed" style={{ color: PIVOT_COLORS.slate }}>{d.hero.supporting}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={L("/demo")} className="rounded-xl px-7 py-3.5 text-center text-[15px] font-semibold text-white transition" style={{ backgroundColor: PIVOT_COLORS.teal }}>
                {d.cta.viewDemo}
              </Link>
              <a href={mailto} className="rounded-xl border bg-white px-7 py-3.5 text-center text-[15px] font-semibold transition" style={{ borderColor: PIVOT_COLORS.line, color: PIVOT_COLORS.ink }}>
                {d.cta.requestAccess}
              </a>
            </div>
            <p className="mt-6 text-[13px]" style={{ color: PIVOT_COLORS.slate }}>{d.hero.trust}</p>
          </div>
          <DashboardMockup locale={locale} />
        </Section>
      </div>

      {/* ── What ClinicSlotHub does (3 short cards) ───────────────────────── */}
      <Section className="py-16">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: PIVOT_COLORS.ink }}>{d.what.title}</h2>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {d.what.cards.map((c, i) => (
            <div key={c.title} className="rounded-2xl border bg-white p-6" style={{ borderColor: PIVOT_COLORS.line }}>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg text-[14px] font-bold text-white" style={{ backgroundColor: PIVOT_COLORS.teal }}>{i + 1}</span>
              <h3 className="mt-4 text-[16px] font-bold" style={{ color: PIVOT_COLORS.ink }}>{c.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed" style={{ color: PIVOT_COLORS.slate }}>{c.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Simple monthly plans (revenue clarity, no payment) ────────────── */}
      <div style={{ backgroundColor: PIVOT_COLORS.surface }}>
        <Section id="pricing" className="scroll-mt-20 py-16">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: PIVOT_COLORS.ink }}>{d.pricing.title}</h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed" style={{ color: PIVOT_COLORS.slate }}>{d.pricing.intro}</p>
          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {d.pricing.plans.map((p, i) => {
              const featured = i === 1;
              return (
                <div key={p.name} className="flex flex-col rounded-2xl border p-7" style={{ borderColor: featured ? PIVOT_COLORS.teal : PIVOT_COLORS.line, backgroundColor: featured ? PIVOT_COLORS.bg : PIVOT_COLORS.surface, borderWidth: featured ? 2 : 1 }}>
                  <p className="text-[13px] font-bold uppercase tracking-[0.12em]" style={{ color: PIVOT_COLORS.tealDark }}>{p.name}</p>
                  <p className="mt-3 text-[22px] font-extrabold leading-tight" style={{ color: PIVOT_COLORS.ink }}>{p.price}</p>
                  <p className="mt-3 flex-1 text-[14px] leading-relaxed" style={{ color: PIVOT_COLORS.slate }}>{p.for}</p>
                  <a href={mailto} className="mt-6 inline-block rounded-xl px-5 py-3 text-center text-[14px] font-semibold transition" style={featured ? { backgroundColor: PIVOT_COLORS.teal, color: "#fff" } : { border: `1px solid ${PIVOT_COLORS.teal}`, color: PIVOT_COLORS.tealDark }}>
                    {d.pricing.cta}
                  </a>
                </div>
              );
            })}
          </div>
          <p className="mt-6 text-[13px]" style={{ color: PIVOT_COLORS.slate }}>{d.pricing.note}</p>
        </Section>
      </div>

      {/* ── For clinics + compact patients line ───────────────────────────── */}
      <Section className="py-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-2xl border bg-white p-8" style={{ borderColor: PIVOT_COLORS.line }}>
            <h3 className="text-xl font-bold" style={{ color: PIVOT_COLORS.ink }}>{d.forClinics.title}</h3>
            <p className="mt-3 text-[14px] leading-relaxed" style={{ color: PIVOT_COLORS.slate }}>{d.forClinics.intro}</p>
            <ul className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {d.forClinics.points.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-[14px]" style={{ color: PIVOT_COLORS.ink }}>
                  <span className="mt-0.5 font-bold" style={{ color: PIVOT_COLORS.teal }}>✓</span>{p}
                </li>
              ))}
            </ul>
          </div>
          {/* Patients are not the buyer — kept to a single compact card */}
          <div className="flex flex-col justify-center rounded-2xl p-8" style={{ backgroundColor: PIVOT_COLORS.tealDeep }}>
            <p className="text-[15px] font-semibold leading-relaxed text-white">{d.patientsLine}</p>
          </div>
        </div>
      </Section>

      {/* ── Demo preview ──────────────────────────────────────────────────── */}
      <Section className="pb-16">
        <div className="rounded-3xl border p-8 sm:p-10" style={{ borderColor: PIVOT_COLORS.line, backgroundColor: PIVOT_COLORS.surface }}>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight" style={{ color: PIVOT_COLORS.ink }}>{d.demo.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed" style={{ color: PIVOT_COLORS.slate }}>{d.demo.intro}</p>
              <Link href={L("/demo")} className="mt-6 inline-block rounded-xl px-6 py-3 text-[14px] font-semibold text-white" style={{ backgroundColor: PIVOT_COLORS.teal }}>{d.cta.viewDemo}</Link>
            </div>
            <DashboardMockup locale={locale} />
          </div>
        </div>
      </Section>

      {/* ── Compact safety box (visible, not dominant) ────────────────────── */}
      <Section className="pb-16">
        <div className="rounded-2xl border p-6" style={{ borderColor: PIVOT_COLORS.line, backgroundColor: PIVOT_COLORS.bg }}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl">
              <h3 className="text-[15px] font-bold" style={{ color: PIVOT_COLORS.ink }}>{d.safety.title}</h3>
              <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: PIVOT_COLORS.slate }}>{d.safety.body}</p>
            </div>
            <Link href={L("/safety-notes")} className="shrink-0 text-[13px] font-semibold underline" style={{ color: PIVOT_COLORS.tealDark }}>{d.nav.safety} →</Link>
          </div>
        </div>
      </Section>
    </PivotShell>
  );
}
