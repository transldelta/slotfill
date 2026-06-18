import Link from "next/link";
import { getPivot, PIVOT_COLORS } from "@/lib/pivot-content";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Locale } from "@/i18n/routing";

/**
 * Shared premium shell (header + footer) for the Visibility-Engine pivot pages.
 * Server component. No external services, no patient data.
 */
export function PivotShell({
  locale,
  currentPath,
  children,
}: {
  locale: string;
  currentPath: string;
  children: React.ReactNode;
}) {
  const d = getPivot(locale);
  const L = (p: string) => `/${locale}${p}`;
  const nav = [
    { href: L("/for-clinics"), label: d.nav.forClinics },
    { href: L("/treatments"), label: d.nav.treatments },
    { href: L("/destinations"), label: d.nav.destinations },
    { href: L("/safety-notes"), label: d.nav.safety },
    { href: L("/clinic-contact"), label: d.nav.contact },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: PIVOT_COLORS.creamSoft, color: PIVOT_COLORS.ink }}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b" style={{ backgroundColor: PIVOT_COLORS.navy, borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5">
          <Link href={L("")} className="flex items-baseline gap-2" aria-label={d.brand}>
            <span className="text-base font-bold tracking-tight" style={{ color: PIVOT_COLORS.cream }}>{d.brand}</span>
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.18em] sm:inline" style={{ color: PIVOT_COLORS.goldSoft }}>
              {d.tagline}
            </span>
          </Link>
          <nav className="flex items-center gap-1 text-[13px]">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="hidden rounded-md px-2.5 py-1.5 font-medium transition hover:bg-white/10 sm:inline" style={{ color: "rgba(247,242,231,0.86)" }}>
                {n.label}
              </Link>
            ))}
            <Link
              href={L("/for-clinics")}
              className="ml-1 rounded-lg px-3.5 py-2 text-[12.5px] font-semibold transition"
              style={{ backgroundColor: PIVOT_COLORS.gold, color: PIVOT_COLORS.navy }}
            >
              {d.cta.requestReview}
            </Link>
            <span className="ml-1"><LanguageSwitcher currentLocale={locale as Locale} currentPath={currentPath} /></span>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      {/* Footer */}
      <footer className="mt-20 border-t" style={{ backgroundColor: PIVOT_COLORS.navy, borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
            <div className="max-w-sm">
              <p className="text-base font-bold" style={{ color: PIVOT_COLORS.cream }}>{d.brand}</p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color: PIVOT_COLORS.goldSoft }}>{d.tagline}</p>
              <p className="mt-4 text-[12.5px] leading-relaxed" style={{ color: "rgba(247,242,231,0.7)" }}>{d.footerNote}</p>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-[13px]">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="transition hover:underline" style={{ color: "rgba(247,242,231,0.82)" }}>
                  {n.label}
                </Link>
              ))}
              <Link href={L("/impressum")} className="transition hover:underline" style={{ color: "rgba(247,242,231,0.82)" }}>Impressum</Link>
              <Link href={L("/datenschutz")} className="transition hover:underline" style={{ color: "rgba(247,242,231,0.82)" }}>Datenschutz</Link>
              <Link href={L("/agb")} className="transition hover:underline" style={{ color: "rgba(247,242,231,0.82)" }}>AGB</Link>
            </div>
          </div>
          <p className="mt-10 border-t pt-6 text-[11px]" style={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(247,242,231,0.55)" }}>
            © {new Date().getFullYear()} {d.brand}. {d.rights}
          </p>
        </div>
      </footer>
    </div>
  );
}
