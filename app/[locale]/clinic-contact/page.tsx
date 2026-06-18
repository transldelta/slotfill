import type { Metadata } from "next";
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
  return { title: `${d.contact.title} – ${d.brand}`, description: d.contact.intro, alternates: { canonical: `/${locale}/clinic-contact` } };
}

export default async function ClinicContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const d = getPivot(locale);
  return (
    <PivotShell locale={locale} currentPath="/clinic-contact">
      <section className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: PIVOT_COLORS.navy }}>{d.contact.title}</h1>
        <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "rgba(26,36,51,0.74)" }}>{d.contact.intro}</p>

        {/* No patient form — clinic enquiry only, via the visitor's own email client */}
        <div className="mt-8 rounded-2xl border bg-white p-7" style={{ borderColor: "rgba(11,31,58,0.10)" }}>
          <p className="text-[13.5px] font-semibold uppercase tracking-wider" style={{ color: PIVOT_COLORS.green }}>For clinics</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="mt-2 inline-block rounded-xl px-6 py-3 text-[15px] font-semibold" style={{ backgroundColor: PIVOT_COLORS.gold, color: PIVOT_COLORS.navy }}>
            {d.cta.contact}
          </a>
          <ul className="mt-6 space-y-2 text-[13.5px]" style={{ color: "rgba(26,36,51,0.78)" }}>
            {d.contact.points.map((p) => (
              <li key={p} className="flex items-start gap-2"><span style={{ color: PIVOT_COLORS.gold }}>·</span>{p}</li>
            ))}
          </ul>
        </div>

        <div className="mt-6 rounded-2xl border px-6 py-5" style={{ borderColor: "rgba(194,161,74,0.4)", backgroundColor: PIVOT_COLORS.creamSoft }}>
          <p className="text-[13px] leading-relaxed" style={{ color: "rgba(26,36,51,0.8)" }}>{d.contact.note}</p>
        </div>
      </section>
    </PivotShell>
  );
}
