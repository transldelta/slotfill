import Link from "next/link";
import Image from "next/image";
import { PUBLIC_BRAND_NAME } from "@/lib/brand";

interface SlotFillLogoProps {
  /** Href the logo links to. Pass null to render without a link. */
  href?: string | null;
  /** Rendered height in px (width scales proportionally). Default: 36. */
  size?: number;
  /** Show the full logo (icon + wordmark). false → icon only. Default: true. */
  showWordmark?: boolean;
  /** Below the `sm` breakpoint show only the icon (icon-only on mobile). */
  hideWordmarkOnMobile?: boolean;
  /** Eager-load (header/LCP). Default: false. */
  priority?: boolean;
  className?: string;
}

/**
 * Öffentliches ClinicSlotHub-Markenlogo.
 *
 * ● Lokale Assets (kein Hotlink): public/brand/clinicslothub-logo.png (Icon +
 *   Wordmark „ClinicSlotHub") und public/brand/clinicslothub-icon.png (nur Icon).
 * ● Öffentliche Wordmark = PUBLIC_BRAND_NAME aus lib/brand.ts ("ClinicSlotHub").
 * ● Desktop: volles Logo. Mobile (mit hideWordmarkOnMobile): nur Icon.
 * ● Weißer Logo-Hintergrund ist gerundet, damit er in Light- und Dark-Header
 *   sauber wirkt.
 */
const LOGO_SRC = "/brand/clinicslothub-logo.png"; // 1024 × 256 (4:1)
const ICON_SRC = "/brand/clinicslothub-icon.png"; // 512 × 512 (1:1)
const LOGO_RATIO = 1024 / 256;

export function SlotFillLogo({
  href = "/",
  size = 36,
  showWordmark = true,
  hideWordmarkOnMobile = false,
  priority = false,
  className = "",
}: SlotFillLogoProps) {
  const h = Math.round(size);
  const logoW = Math.round(h * LOGO_RATIO);
  const alt = PUBLIC_BRAND_NAME; // "ClinicSlotHub"

  const iconImg = (
    <Image src={ICON_SRC} alt={alt} width={h} height={h} priority={priority} className="rounded-md" />
  );

  const fullImg = (
    <Image src={LOGO_SRC} alt={alt} width={logoW} height={h} priority={priority} className="rounded-md" />
  );

  let visual;
  if (!showWordmark) {
    visual = iconImg;
  } else if (hideWordmarkOnMobile) {
    // Mobile: nur Icon · ab sm: volles Logo.
    visual = (
      <>
        <span className="inline-flex sm:hidden">{iconImg}</span>
        <span className="hidden sm:inline-flex">{fullImg}</span>
      </>
    );
  } else {
    visual = fullImg;
  }

  const inner = <span className={`inline-flex items-center select-none ${className}`}>{visual}</span>;

  if (href === null) return inner;

  return (
    <Link href={href} aria-label={`${PUBLIC_BRAND_NAME} – zur Startseite`}>
      {inner}
    </Link>
  );
}
