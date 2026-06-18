import type { Metadata } from "next";
import { PRODUCT_LOCALES, getPivot, PIVOT_COLORS } from "@/lib/pivot-content";
import { PivotShell } from "@/components/pivot/PivotShell";
import { DashboardMockup } from "@/components/pivot/DashboardMockup";

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
        <p className="mt-3 max-w-2xl text-[15px]" style={{ color: PIVOT_COLORS.slate }}>{d.demo.intro}</p>

        <div className="mt-8">
          <DashboardMockup locale={locale} />
        </div>

        {/* Mobile preview */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-[1fr_auto] sm:items-start">
          <div className="rounded-2xl border p-6" style={{ borderColor: PIVOT_COLORS.line, backgroundColor: PIVOT_COLORS.surface }}>
            <p className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: PIVOT_COLORS.slate }}>{d.demo.title}</p>
            <ul className="mt-3 space-y-1.5 text-[13px]" style={{ color: PIVOT_COLORS.slate }}>
              {d.demo.notes.map((n) => (<li key={n} className="flex items-start gap-2"><span style={{ color: PIVOT_COLORS.teal }}>·</span>{n}</li>))}
            </ul>
          </div>
          {/* Phone frame — anonymized patient status view */}
          <div className="mx-auto w-[230px] rounded-[2rem] border-8 p-3" style={{ borderColor: PIVOT_COLORS.ink, backgroundColor: PIVOT_COLORS.surface }}>
            <p className="text-center text-[11px] font-semibold uppercase tracking-wide" style={{ color: PIVOT_COLORS.tealDark }}>{d.mockup.mobilePreview}</p>
            <div className="mt-3 space-y-2">
              <div className="rounded-xl px-3 py-2.5 text-center" style={{ backgroundColor: PIVOT_COLORS.tealTint }}>
                <p className="text-[10px]" style={{ color: PIVOT_COLORS.slate }}>{d.mockup.walkInQueue}</p>
                <p className="text-[20px] font-bold" style={{ color: PIVOT_COLORS.tealDark }}>Queue #18</p>
              </div>
              {[
                [d.mockup.appointments, "10:30"],
                [d.mockup.rooms, "Room 2"],
                ["", d.mockup.waiting],
              ].map(([k, v], i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border px-3 py-2 text-[11.5px]" style={{ borderColor: PIVOT_COLORS.line }}>
                  <span style={{ color: PIVOT_COLORS.slate }}>{k || d.forPatients.points[3]}</span>
                  <span className="font-semibold" style={{ color: PIVOT_COLORS.ink }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PivotShell>
  );
}
