import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";

interface SlotFillLogoProps {
  /** Href the logo links to. Pass null to render without a link. */
  href?: string | null;
  /** Height in px (icon scales proportionally). Default: 36. */
  size?: number;
  /** Show the product name wordmark next to the icon. Default: true. */
  showWordmark?: boolean;
  className?: string;
}

/**
 * White-Label-ready brand logo.
 *
 * ● Kein externes Bild – reines inline SVG.
 * ● Produktname kommt aus lib/brand.ts (BRAND_NAME).
 * ● Für White-Label-Anpassung: nur BRAND_NAME in lib/brand.ts ändern.
 * ● Professionelles, minimalistisches B2B-SaaS-Design.
 * ● Desktop und Mobile sauber.
 *
 * Icon: Abstraktes 4-Quadranten-Raster (symbolisiert Terminplanung / Workflow)
 * mit Blau-Indigo-Verlauf – zeitlos, kein Emoji, kein Kalender-Klischee.
 */
export function SlotFillLogo({
  href = "/",
  size = 36,
  showWordmark = true,
  className = "",
}: SlotFillLogoProps) {
  const iconSize = Math.max(24, Math.round(size * 0.85));

  const inner = (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Minimalist geometric mark – inline SVG, zero external dependencies */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="pf-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        {/* Container */}
        <rect width="32" height="32" rx="7" fill="url(#pf-grad)" />
        {/* 4-tile grid: top-left */}
        <rect x="7" y="7" width="7" height="7" rx="1.5" fill="white" opacity="0.95" />
        {/* top-right */}
        <rect x="18" y="7" width="7" height="7" rx="1.5" fill="white" opacity="0.95" />
        {/* bottom-left */}
        <rect x="7" y="18" width="7" height="7" rx="1.5" fill="white" opacity="0.5" />
        {/* bottom-right – lighter, suggests flow direction */}
        <rect x="18" y="18" width="7" height="7" rx="1.5" fill="white" opacity="0.25" />
      </svg>

      {showWordmark && (
        <span
          className="font-semibold tracking-tight leading-none"
          style={{
            fontSize: `${Math.round(size * 0.52)}px`,
            background: "linear-gradient(135deg, #1e40af 0%, #4f46e5 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {BRAND_NAME}
        </span>
      )}
    </span>
  );

  if (href === null) return inner;

  return (
    <Link href={href} aria-label={BRAND_NAME}>
      {inner}
    </Link>
  );
}
