import type { Metadata } from "next";
import { locales } from "@/i18n/routing";
import { getPivot, PIVOT_COLORS } from "@/lib/pivot-content";
import { PivotShell } from "@/components/pivot/PivotShell";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const d = getPivot(locale);
  return { title: `${d.treatmentsTitle} – ${d.brand}`, description: d.treatmentsIntro, alternates: { canonical: `/${locale}/treatments` } };
}

export default async function TreatmentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const d = getPivot(locale);
  return (
    <PivotShell locale={locale} currentPath="/treatments">
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: PIVOT_COLORS.navy }}>{d.treatmentsTitle}</h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed" style={{ color: "rgba(26,36,51,0.74)" }}>{d.treatmentsIntro}</p>
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {d.treatments.map((t) => (
            <div key={t} className="flex items-center gap-3 rounded-xl border bg-white px-5 py-4 text-[15px] font-medium" style={{ borderColor: "rgba(11,31,58,0.10)", color: PIVOT_COLORS.ink }}>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIVOT_COLORS.gold }} aria-hidden />
              {t}
            </div>
          ))}
        </div>
        <p className="mt-8 text-[12.5px] italic" style={{ color: "rgba(26,36,51,0.55)" }}>
          {d.safety.points[0]} {d.safety.points[1]}
        </p>
      </section>
    </PivotShell>
  );
}
