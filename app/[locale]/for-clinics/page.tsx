import type { Metadata } from "next";
import Link from "next/link";
import { PRODUCT_LOCALES, getPivot, PIVOT_COLORS } from "@/lib/pivot-content";
import { PivotShell } from "@/components/pivot/PivotShell";
import { CONTACT_EMAIL } from "@/lib/brand";

export function generateStaticParams() {
  return PRODUCT_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const d = getPivot(locale);
  return { title: `${d.nav.forClinics} — ${d.brand}`, description: d.forClinics.intro, alternates: { canonical: `/${locale}/for-clinics` } };
}

export default async function ForClinicsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const d = getPivot(locale);
  return (
    <PivotShell locale={locale}>
      <section className="mx-auto max-w-3xl px-4 py-16">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: PIVOT_COLORS.tealDark }}>{d.tagline}</span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: PIVOT_COLORS.ink }}>{d.forClinics.title}</h1>
        <p className="mt-4 text-[15px] leading-relaxed" style={{ color: PIVOT_COLORS.slate }}>{d.forClinics.intro}</p>
        <ul className="mt-8 space-y-3">
          {d.forClinics.points.map((p) => (
            <li key={p} className="flex items-start gap-3 rounded-xl border bg-white px-4 py-3.5 text-[14px]" style={{ borderColor: PIVOT_COLORS.line, color: PIVOT_COLORS.ink }}>
              <span className="mt-0.5 font-bold" style={{ color: PIVOT_COLORS.teal }}>✓</span>{p}
            </li>
          ))}
        </ul>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <a href={`mailto:${CONTACT_EMAIL}`} className="rounded-xl px-6 py-3 text-center text-[14px] font-semibold text-white" style={{ backgroundColor: PIVOT_COLORS.teal }}>{d.cta.requestAccess}</a>
          <Link href={`/${locale}/demo`} className="rounded-xl border bg-white px-6 py-3 text-center text-[14px] font-semibold" style={{ borderColor: PIVOT_COLORS.line, color: PIVOT_COLORS.ink }}>{d.cta.viewDemo}</Link>
        </div>
        <p className="mt-8 text-[12.5px] leading-relaxed" style={{ color: PIVOT_COLORS.slate }}>{d.safety.body}</p>
      </section>
    </PivotShell>
  );
}
