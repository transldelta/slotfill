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
  return { title: `${d.destinationsTitle} – ${d.brand}`, description: d.destinationsIntro, alternates: { canonical: `/${locale}/destinations` } };
}

export default async function DestinationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const d = getPivot(locale);
  return (
    <PivotShell locale={locale} currentPath="/destinations">
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: PIVOT_COLORS.navy }}>{d.destinationsTitle}</h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed" style={{ color: "rgba(26,36,51,0.74)" }}>{d.destinationsIntro}</p>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {d.destinations.map((c) => (
            <div key={c} className="rounded-xl border bg-white px-4 py-5 text-center text-[14.5px] font-semibold" style={{ borderColor: "rgba(11,31,58,0.10)", color: PIVOT_COLORS.navy }}>
              {c}
            </div>
          ))}
        </div>
        <p className="mt-8 text-[12.5px] italic" style={{ color: "rgba(26,36,51,0.55)" }}>{d.destinationsIntro}</p>
      </section>
    </PivotShell>
  );
}
