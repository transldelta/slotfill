import type { Metadata } from "next";
import Link from "next/link";
import { locales } from "@/i18n/routing";
import { getPivot, PIVOT_COLORS } from "@/lib/pivot-content";
import { PivotShell } from "@/components/pivot/PivotShell";
import { CANONICAL_URL } from "@/lib/brand";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const d = getPivot(locale);
  return {
    title: `${d.brand} – ${d.tagline}`,
    description: d.hero.subline,
    metadataBase: new URL(CANONICAL_URL),
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])) as Record<string, string>,
    },
    openGraph: { title: `${d.brand} – ${d.tagline}`, description: d.hero.subline, url: `${CANONICAL_URL}/${locale}`, siteName: d.brand, type: "website", locale },
  };
}

export default async function PivotHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const d = getPivot(locale);
  const L = (p: string) => `/${locale}${p}`;

  return (
    <PivotShell locale={locale} currentPath="/">
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ backgroundColor: PIVOT_COLORS.navy }}>
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${PIVOT_COLORS.gold}, transparent)` }} aria-hidden />
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:py-28">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: PIVOT_COLORS.goldSoft }}>{d.hero.eyebrow}</p>
          <h1 className="mx-auto max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl" style={{ color: PIVOT_COLORS.cream }}>
            {d.hero.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed sm:text-lg" style={{ color: "rgba(247,242,231,0.78)" }}>
            {d.hero.subline}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={L("/for-clinics")} className="w-full rounded-xl px-7 py-3.5 text-[15px] font-semibold transition hover:opacity-95 sm:w-auto" style={{ backgroundColor: PIVOT_COLORS.gold, color: PIVOT_COLORS.navy }}>
              {d.cta.requestReview}
            </Link>
            <Link href={L("/treatments")} className="w-full rounded-xl border px-7 py-3.5 text-[15px] font-semibold transition hover:bg-white/5 sm:w-auto" style={{ borderColor: "rgba(247,242,231,0.25)", color: PIVOT_COLORS.cream }}>
              {d.cta.viewTreatments}
            </Link>
          </div>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px]" style={{ color: "rgba(247,242,231,0.66)" }}>
            {d.hero.trust.map((t) => (
              <span key={t} className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: PIVOT_COLORS.goldSoft }} />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Treatment areas */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: PIVOT_COLORS.navy }}>{d.treatmentsTitle}</h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed" style={{ color: "rgba(26,36,51,0.7)" }}>{d.treatmentsIntro}</p>
        <div className="mt-8 flex flex-wrap gap-2.5">
          {d.treatments.map((t) => (
            <span key={t} className="rounded-full border bg-white px-4 py-2 text-[13.5px] font-medium" style={{ borderColor: "rgba(11,31,58,0.12)", color: PIVOT_COLORS.ink }}>
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* Generic example clinic cards (clearly not real) */}
      <section className="mx-auto max-w-6xl px-4 pb-4">
        <p className="mb-4 text-[12px] italic" style={{ color: "rgba(26,36,51,0.55)" }}>{d.demoNote}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {d.demoCards.map((c) => (
            <div key={c.name} className="rounded-2xl border bg-white p-5" style={{ borderColor: "rgba(11,31,58,0.10)" }}>
              <div className="mb-3 h-24 rounded-xl" style={{ background: `linear-gradient(135deg, ${PIVOT_COLORS.cream}, #ECE3CE)` }} aria-hidden />
              <p className="text-[14px] font-semibold" style={{ color: PIVOT_COLORS.navy }}>{c.name}</p>
              <p className="mt-0.5 text-[12.5px]" style={{ color: "rgba(26,36,51,0.62)" }}>{c.category} · {c.region}</p>
              <span className="mt-3 inline-block rounded-md px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider" style={{ backgroundColor: "rgba(47,111,94,0.12)", color: PIVOT_COLORS.green }}>
                Example
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Direct contact concept + For clinics teaser */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl p-8" style={{ backgroundColor: PIVOT_COLORS.navy }}>
            <h3 className="text-xl font-bold" style={{ color: PIVOT_COLORS.cream }}>{d.cta.contact}</h3>
            <p className="mt-3 text-[14px] leading-relaxed" style={{ color: "rgba(247,242,231,0.74)" }}>{d.contact.note}</p>
            <Link href={L("/safety-notes")} className="mt-5 inline-block text-[13.5px] font-semibold underline" style={{ color: PIVOT_COLORS.goldSoft }}>
              {d.safety.title} →
            </Link>
          </div>
          <div className="rounded-2xl border bg-white p-8" style={{ borderColor: "rgba(11,31,58,0.10)" }}>
            <h3 className="text-xl font-bold" style={{ color: PIVOT_COLORS.navy }}>{d.forClinics.title}</h3>
            <p className="mt-3 text-[14px] leading-relaxed" style={{ color: "rgba(26,36,51,0.72)" }}>{d.forClinics.intro}</p>
            <Link href={L("/for-clinics")} className="mt-5 inline-block rounded-lg px-5 py-2.5 text-[13.5px] font-semibold" style={{ backgroundColor: PIVOT_COLORS.green, color: "#fff" }}>
              {d.cta.forClinics}
            </Link>
          </div>
        </div>
      </section>

      {/* Safety strip */}
      <section className="mx-auto max-w-6xl px-4 pb-8">
        <div className="rounded-2xl border px-6 py-5" style={{ borderColor: "rgba(194,161,74,0.4)", backgroundColor: PIVOT_COLORS.creamSoft }}>
          <p className="text-[13px] leading-relaxed" style={{ color: "rgba(26,36,51,0.8)" }}>
            <strong style={{ color: PIVOT_COLORS.navy }}>{d.safety.title}:</strong> {d.safety.points[0]} {d.safety.points[3]}
          </p>
        </div>
      </section>
    </PivotShell>
  );
}
