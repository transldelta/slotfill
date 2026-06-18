import type { Metadata } from "next";
import { PRODUCT_LOCALES, getPivot, PIVOT_COLORS } from "@/lib/pivot-content";
import { PivotShell } from "@/components/pivot/PivotShell";
import { CONTACT_EMAIL } from "@/lib/brand";

export function generateStaticParams() {
  return PRODUCT_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const d = getPivot(locale);
  return { title: `${d.cta.requestAccess} — ${d.brand}`, description: d.pricing.note, alternates: { canonical: `/${locale}/clinic-contact` } };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const d = getPivot(locale);
  return (
    <PivotShell locale={locale}>
      <section className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: PIVOT_COLORS.ink }}>{d.cta.requestAccess}</h1>
        <p className="mt-4 text-[15px] leading-relaxed" style={{ color: PIVOT_COLORS.slate }}>{d.pricing.note}</p>

        {/* No patient form — clinic enquiry only, via the visitor's own email client */}
        <div className="mt-8 rounded-2xl border bg-white p-7" style={{ borderColor: PIVOT_COLORS.line }}>
          <p className="text-[12.5px] font-semibold uppercase tracking-wider" style={{ color: PIVOT_COLORS.tealDark }}>{d.nav.forClinics}</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="mt-2 inline-block rounded-xl px-6 py-3 text-[15px] font-semibold text-white" style={{ backgroundColor: PIVOT_COLORS.teal }}>{d.cta.contact}</a>
          <ul className="mt-6 space-y-2 text-[13px]" style={{ color: PIVOT_COLORS.slate }}>
            {d.demo.notes.map((n) => (<li key={n} className="flex items-start gap-2"><span style={{ color: PIVOT_COLORS.teal }}>·</span>{n}</li>))}
          </ul>
        </div>
      </section>
    </PivotShell>
  );
}
