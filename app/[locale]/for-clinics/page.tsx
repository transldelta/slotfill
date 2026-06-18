import type { Metadata } from "next";
import Link from "next/link";
import { locales } from "@/i18n/routing";
import { getPivot, PIVOT_COLORS } from "@/lib/pivot-content";
import { PivotShell } from "@/components/pivot/PivotShell";
import { CONTACT_EMAIL } from "@/lib/brand";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const d = getPivot(locale);
  return { title: `${d.forClinics.title} – ${d.brand}`, description: d.forClinics.intro, alternates: { canonical: `/${locale}/for-clinics` } };
}

export default async function ForClinicsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const d = getPivot(locale);
  return (
    <PivotShell locale={locale} currentPath="/for-clinics">
      <section className="mx-auto max-w-3xl px-4 py-16">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: PIVOT_COLORS.green }}>{d.hero.eyebrow}</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: PIVOT_COLORS.navy }}>{d.forClinics.title}</h1>
        <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "rgba(26,36,51,0.74)" }}>{d.forClinics.intro}</p>

        <ul className="mt-8 space-y-3">
          {d.forClinics.points.map((p) => (
            <li key={p} className="flex items-start gap-3 rounded-xl border bg-white px-4 py-3.5 text-[14px]" style={{ borderColor: "rgba(11,31,58,0.10)", color: PIVOT_COLORS.ink }}>
              <span className="mt-0.5 font-bold" style={{ color: PIVOT_COLORS.green }}>✓</span>
              {p}
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-2xl border px-6 py-5" style={{ borderColor: "rgba(194,161,74,0.4)", backgroundColor: PIVOT_COLORS.creamSoft }}>
          <ul className="space-y-1.5 text-[13.5px]" style={{ color: "rgba(26,36,51,0.8)" }}>
            {d.forClinics.notList.map((n) => (
              <li key={n} className="flex items-start gap-2"><span style={{ color: PIVOT_COLORS.gold }}>—</span>{n}</li>
            ))}
          </ul>
        </div>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link href={`/${locale}/clinic-contact`} className="rounded-xl px-6 py-3 text-center text-[14px] font-semibold" style={{ backgroundColor: PIVOT_COLORS.gold, color: PIVOT_COLORS.navy }}>
            {d.cta.requestReview}
          </Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="rounded-xl border px-6 py-3 text-center text-[14px] font-semibold" style={{ borderColor: "rgba(11,31,58,0.2)", color: PIVOT_COLORS.navy }}>
            {d.cta.contact}
          </a>
        </div>
      </section>
    </PivotShell>
  );
}
