import Link from "next/link";
import { getPivot, PIVOT_COLORS } from "@/lib/pivot-content";

/**
 * Shared premium shell (header + footer) for the Clinic Scheduling OS.
 * Server component. EN/FR/ES only. No external services, no patient data.
 * Language switcher intentionally omitted (only EN/FR/ES are public product langs).
 */
export function PivotShell({ locale, children }: { locale: string; children: React.ReactNode }) {
  const d = getPivot(locale);
  const L = (p: string) => `/${locale}${p}`;
  const nav = [
    { href: L("/for-clinics"), label: d.nav.forClinics },
    { href: L("/#pricing"), label: d.nav.pricing },
    { href: L("/demo"), label: d.nav.demo },
    { href: L("/safety-notes"), label: d.nav.safety },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: PIVOT_COLORS.bg, color: PIVOT_COLORS.ink }}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b backdrop-blur-md" style={{ backgroundColor: "rgba(255,255,255,0.85)", borderColor: PIVOT_COLORS.line }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5">
          <Link href={L("")} className="flex items-center gap-2.5" aria-label={d.brand}>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg text-[13px] font-black text-white" style={{ backgroundColor: PIVOT_COLORS.teal }}>C</span>
            <span className="text-[15px] font-bold tracking-tight" style={{ color: PIVOT_COLORS.ink }}>{d.brand}</span>
          </Link>
          <nav className="flex items-center gap-1 text-[13px]">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="hidden rounded-md px-2.5 py-1.5 font-medium transition hover:bg-teal-50 sm:inline" style={{ color: PIVOT_COLORS.slate }}>
                {n.label}
              </Link>
            ))}
            <Link href={L("/demo")} className="rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition hover:bg-teal-50" style={{ color: PIVOT_COLORS.tealDark }}>
              {d.cta.viewDemo}
            </Link>
            <Link href={L("/for-clinics")} className="ml-1 rounded-lg px-3.5 py-2 text-[12.5px] font-semibold text-white transition" style={{ backgroundColor: PIVOT_COLORS.teal }}>
              {d.cta.requestAccess}
            </Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      {/* Footer */}
      <footer className="mt-20 border-t" style={{ backgroundColor: PIVOT_COLORS.surface, borderColor: PIVOT_COLORS.line }}>
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
            <div className="max-w-sm">
              <p className="text-[15px] font-bold" style={{ color: PIVOT_COLORS.ink }}>{d.brand}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: PIVOT_COLORS.teal }}>{d.tagline}</p>
              <p className="mt-4 text-[12.5px] leading-relaxed" style={{ color: PIVOT_COLORS.slate }}>{d.footerNote}</p>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-[13px]">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="transition hover:underline" style={{ color: PIVOT_COLORS.slate }}>{n.label}</Link>
              ))}
              <Link href={L("/impressum")} className="transition hover:underline" style={{ color: PIVOT_COLORS.slate }}>Legal</Link>
              <Link href={L("/datenschutz")} className="transition hover:underline" style={{ color: PIVOT_COLORS.slate }}>Privacy</Link>
              <Link href={L("/agb")} className="transition hover:underline" style={{ color: PIVOT_COLORS.slate }}>Terms</Link>
            </div>
          </div>
          <p className="mt-10 border-t pt-6 text-[11px]" style={{ borderColor: PIVOT_COLORS.line, color: PIVOT_COLORS.slate }}>
            © {new Date().getFullYear()} {d.brand}. {d.rights}
          </p>
        </div>
      </footer>
    </div>
  );
}
