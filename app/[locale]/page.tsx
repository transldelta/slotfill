import type { Metadata } from "next";
import Link from "next/link";
import { PRODUCT_LOCALES, getPivot, PIVOT_COLORS } from "@/lib/pivot-content";
import { PivotShell } from "@/components/pivot/PivotShell";
import { InteractiveDemo } from "@/components/pivot/InteractiveDemo";
import { PricingPlans } from "@/components/pivot/PricingPlans";
import { RequestAccess } from "@/components/pivot/RequestAccess";
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
  const mailto = `mailto:${CONTACT_EMAIL}?subject=ClinicSlotHub%20pilot%20access`;

  return (
    <PivotShell locale={locale}>
      {/* ── 1. Hero + large interactive board ─────────────────────────────── */}
      <div style={{ background: `linear-gradient(180deg, ${PIVOT_COLORS.tealTint}66, ${PIVOT_COLORS.bg})` }}>
        <Section className="grid grid-cols-1 items-center gap-12 py-14 lg:grid-cols-[1fr_1.2fr] lg:py-20">
          <div>
            {/* Product name reduced to a small label above the plain promise */}
            <span className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ borderColor: PIVOT_COLORS.line, color: PIVOT_COLORS.tealDark }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: PIVOT_COLORS.teal }} /> {d.tagline}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.07] tracking-tight sm:text-5xl" style={{ color: PIVOT_COLORS.ink }}>
              {d.hero.h1}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed" style={{ color: PIVOT_COLORS.ink }}>{d.hero.subline}</p>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed" style={{ color: PIVOT_COLORS.slate }}>{d.hero.supporting}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#demo" className="rounded-xl px-7 py-3.5 text-center text-[15px] font-semibold text-white transition" style={{ backgroundColor: PIVOT_COLORS.teal }}>
                {d.cta.viewDemo}
              </a>
              <a href={mailto} className="rounded-xl border bg-white px-7 py-3.5 text-center text-[15px] font-semibold transition" style={{ borderColor: PIVOT_COLORS.line, color: PIVOT_COLORS.ink }}>
                {d.cta.requestAccess}
              </a>
            </div>
            <p className="mt-6 text-[13px]" style={{ color: PIVOT_COLORS.slate }}>{d.hero.trust}</p>
          </div>
          <InteractiveDemo locale={locale} compact />
        </Section>
      </div>

      {/* ── 2. Problem → Solution ─────────────────────────────────────────── */}
      <Section className="py-16">
        <h2 className="max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: PIVOT_COLORS.ink }}>{d.problem.title}</h2>
        <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {d.problem.pains.map((p) => (
            <div key={p} className="rounded-2xl border bg-white p-5 text-[14px] font-medium" style={{ borderColor: PIVOT_COLORS.line, color: PIVOT_COLORS.ink }}>
              <span className="text-[18px]" style={{ color: PIVOT_COLORS.teal }} aria-hidden>•</span>
              <p className="mt-2 leading-snug">{p}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl p-7" style={{ backgroundColor: PIVOT_COLORS.tealDeep }}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: PIVOT_COLORS.tealSoft }}>{d.problem.solutionTitle}</p>
          <p className="mt-2 text-[18px] font-semibold leading-relaxed text-white">{d.problem.solution}</p>
          <p className="mt-3 text-[13px]" style={{ color: "rgba(255,255,255,0.7)" }}>{d.patientsLine}</p>
        </div>
      </Section>

      {/* ── 3. Interactive demo preview ───────────────────────────────────── */}
      <div id="demo" className="scroll-mt-20" style={{ backgroundColor: PIVOT_COLORS.surface }}>
        <Section className="py-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: PIVOT_COLORS.ink }}>{d.demo.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed" style={{ color: PIVOT_COLORS.slate }}>{d.demo.intro}</p>
              <ul className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {d.demo.why.map((w) => (
                  <li key={w} className="flex items-start gap-2 text-[14px]" style={{ color: PIVOT_COLORS.ink }}>
                    <span className="mt-0.5 font-bold" style={{ color: PIVOT_COLORS.teal }}>✓</span>{w}
                  </li>
                ))}
              </ul>
              <Link href={L("/demo")} className="mt-7 inline-block rounded-xl px-6 py-3 text-[14px] font-semibold text-white" style={{ backgroundColor: PIVOT_COLORS.teal }}>{d.cta.viewDemo}</Link>
            </div>
            <InteractiveDemo locale={locale} />
          </div>
        </Section>
      </div>

      {/* ── 4. How ClinicSlotHub makes money ──────────────────────────────── */}
      <Section id="pricing" className="scroll-mt-20 py-16">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: PIVOT_COLORS.ink }}>{d.money.title}</h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed" style={{ color: PIVOT_COLORS.slate }}>{d.money.intro}</p>
        <div className="mt-8">
          <PricingPlans locale={locale} email={CONTACT_EMAIL} />
        </div>
      </Section>

      {/* ── 5. Request access + compact safety ────────────────────────────── */}
      <Section className="pb-20">
        <RequestAccess locale={locale} email={CONTACT_EMAIL} />
        <div className="mt-5 rounded-2xl border p-6" style={{ borderColor: PIVOT_COLORS.line, backgroundColor: PIVOT_COLORS.bg }}>
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
