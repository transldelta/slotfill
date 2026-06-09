import Image from "next/image";
import Link from "next/link";

interface SlotFillLogoProps {
  /** Href the logo links to. Pass null to render without a link. */
  href?: string | null;
  /** Height in px (width scales proportionally). Default: 36. */
  size?: number;
  /** Show the "Clentra" wordmark next to the logo icon. Default: true. */
  showWordmark?: boolean;
  className?: string;
}

/**
 * Brand logo for use in headers, footers, and email templates.
 *
 * Renders the SVG icon from /brand/slotfill-logo.svg with an optional
 * wordmark. Wraps in a <Link> when `href` is provided (default "/").
 *
 * The SVG icon is served as a static asset — no inline SVG so that it
 * can be cached and updated independently.
 */
export function SlotFillLogo({
  href = "/",
  size = 36,
  showWordmark = true,
  className = "",
}: SlotFillLogoProps) {
  const inner = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Image
        src="/brand/clentra-logo.svg"
        alt="Clentra Logo"
        width={size}
        height={size}
        priority
        className="shrink-0"
      />
      {showWordmark && (
        <span
          className="text-lg font-bold tracking-tight"
          style={{
            background: "var(--gradient-brand)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Clentra
        </span>
      )}
    </span>
  );

  if (href === null) return inner;

  return (
    <Link href={href} aria-label="Clentra – zur Startseite">
      {inner}
    </Link>
  );
}
