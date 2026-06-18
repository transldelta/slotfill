import type { Metadata } from "next";
import { PRODUCT_LOCALES, getPivot, PIVOT_COLORS } from "@/lib/pivot-content";
import { PivotShell } from "@/components/pivot/PivotShell";
import { InteractiveDemo } from "@/components/pivot/InteractiveDemo";
import { RequestAccess } from "@/components/pivot/RequestAccess";
import { CONTACT_EMAIL } from "@/lib/brand";

export function generateStaticParams() {
  return PRODUCT_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const d = getPivot(locale);
  return { title: `${d.demo.title} — ${d.brand}`, description: d.demo.intro, alternates: { canonical: `/${locale}/demo` } };
}

export default async function DemoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const d = getPivot(locale);
  return (
    <PivotShell locale={locale}>
      <section className="mx-auto max-w-5xl px-4 py-14">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: PIVOT_COLORS.ink }}>{d.demo.title}</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed" style={{ color: PIVOT_COLORS.slate }}>{d.demo.intro}</p>
        <p className="mt-2 text-[13px] font-medium" style={{ color: PIVOT_COLORS.tealDark }}>{d.demo.safeNote}</p>

        <div className="mt-8">
          <InteractiveDemo locale={locale} />
        </div>

        {/* Why it matters */}
        <div className="mt-12">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl" style={{ color: PIVOT_COLORS.ink }}>{d.demo.whyTitle}</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {d.demo.why.map((w) => (
              <div key={w} className="rounded-xl border bg-white p-4 text-[14px]" style={{ borderColor: PIVOT_COLORS.line, color: PIVOT_COLORS.ink }}>
                <span className="font-bold" style={{ color: PIVOT_COLORS.teal }}>✓</span>
                <p className="mt-2 leading-relaxed">{w}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Safety bullets (compact) */}
        <ul className="mt-8 flex flex-wrap gap-2">
          {d.demo.notes.map((n) => (
            <li key={n} className="rounded-lg border px-3 py-1.5 text-[12.5px]" style={{ borderColor: PIVOT_COLORS.line, backgroundColor: PIVOT_COLORS.bg, color: PIVOT_COLORS.slate }}>{n}</li>
          ))}
        </ul>

        <div className="mt-10">
          <RequestAccess locale={locale} email={CONTACT_EMAIL} />
        </div>
      </section>
    </PivotShell>
  );
}
