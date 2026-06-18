import type { Metadata } from "next";
import { PRODUCT_LOCALES, getPivot, PIVOT_COLORS } from "@/lib/pivot-content";
import { PivotShell } from "@/components/pivot/PivotShell";

export function generateStaticParams() {
  return PRODUCT_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const d = getPivot(locale);
  return { title: `${d.safety.title} — ${d.brand}`, description: d.safety.body.slice(0, 150), alternates: { canonical: `/${locale}/safety-notes` }, robots: { index: true, follow: true } };
}

export default async function SafetyNotesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const d = getPivot(locale);
  return (
    <PivotShell locale={locale}>
      <section className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: PIVOT_COLORS.ink }}>{d.safety.title}</h1>
        <div className="mt-6 rounded-2xl border p-6" style={{ borderColor: PIVOT_COLORS.line, backgroundColor: PIVOT_COLORS.surface }}>
          <p className="text-[15px] leading-relaxed" style={{ color: PIVOT_COLORS.ink }}>{d.safety.body}</p>
        </div>
        <ul className="mt-6 space-y-2.5">
          {d.demo.notes.map((n) => (
            <li key={n} className="flex items-start gap-3 rounded-xl border px-4 py-3 text-[14px]" style={{ borderColor: PIVOT_COLORS.line, backgroundColor: PIVOT_COLORS.bg, color: PIVOT_COLORS.ink }}>
              <span className="mt-0.5 font-bold" style={{ color: PIVOT_COLORS.teal }}>·</span>{n}
            </li>
          ))}
        </ul>
      </section>
    </PivotShell>
  );
}
