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
  return { title: `${d.safety.title} – ${d.brand}`, description: d.safety.intro, alternates: { canonical: `/${locale}/safety-notes` }, robots: { index: true, follow: true } };
}

export default async function SafetyNotesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const d = getPivot(locale);
  return (
    <PivotShell locale={locale} currentPath="/safety-notes">
      <section className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: PIVOT_COLORS.navy }}>{d.safety.title}</h1>
        <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "rgba(26,36,51,0.74)" }}>{d.safety.intro}</p>
        <ul className="mt-8 space-y-3">
          {d.safety.points.map((p) => (
            <li key={p} className="flex items-start gap-3 rounded-xl border px-5 py-4 text-[14.5px] leading-relaxed" style={{ borderColor: "rgba(194,161,74,0.35)", backgroundColor: "#fff", color: PIVOT_COLORS.ink }}>
              <span className="mt-0.5 font-bold" style={{ color: PIVOT_COLORS.gold }}>!</span>
              {p}
            </li>
          ))}
        </ul>
      </section>
    </PivotShell>
  );
}
