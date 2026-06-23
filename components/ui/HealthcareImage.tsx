import type { ReactNode } from "react";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { SLOTFILL_IMAGES, slotfillImageSrc, type SlotfillImageKey } from "@/lib/slotfill-images";

type Tone = "blue" | "teal" | "mixed";

const TONE_BG: Record<Tone, string> = {
  blue: "linear-gradient(150deg, #eff6ff 0%, #dbeafe 55%, #e0f2fe 100%)",
  teal: "linear-gradient(150deg, #ecfeff 0%, #cffafe 50%, #d1fae5 100%)",
  mixed: "linear-gradient(150deg, #eff6ff 0%, #dbeafe 45%, #ccfbf1 100%)",
};

const TONE_BG_DARK: Record<Tone, string> = {
  blue: "linear-gradient(150deg, #0f1729 0%, #16213a 60%, #122031 100%)",
  teal: "linear-gradient(150deg, #0f1729 0%, #122a2a 60%, #11202f 100%)",
  mixed: "linear-gradient(150deg, #0f1729 0%, #16213a 50%, #112a2a 100%)",
};

export interface HealthcareImageProps {
  imageKey: SlotfillImageKey;
  /** Beschreibender Alt-Text (auch Platzhalter-Beschriftung). */
  alt: string;
  /** Lucide-Icon als ruhiges Wasserzeichen im Platzhalter. */
  icon: LucideIcon;
  /** Kurze Bildunterschrift im Chip unten links. */
  caption?: string;
  /** Wrapper-Klassen: steuern Größe / Seitenverhältnis (z. B. "aspect-[4/5]"). */
  className?: string;
  tone?: Tone;
  rounded?: string;
  /** Hero-Bild eager laden. */
  priority?: boolean;
  /** next/image sizes-Hinweis für responsive Auslieferung. */
  sizes?: string;
  /** object-position für den object-cover-Crop (hält Gesichter sichtbar, z. B. "50% 25%"). */
  objectPosition?: string;
  /** Über dem Bild liegende Elemente (z. B. schwebende Chips). */
  children?: ReactNode;
}

/**
 * Editorial-Bildfläche für echte Healthcare-Fotos.
 *
 * Solange das Foto in lib/slotfill-images.ts nicht aktiviert ist, wird eine
 * markenkonforme Platzhalterfläche gerendert (kein Bild-Request, keine 404).
 * Sobald `enabled: true` + Datei vorhanden ist, erscheint automatisch das Foto.
 */
export function HealthcareImage({
  imageKey,
  alt,
  icon: Icon,
  caption,
  className = "",
  tone = "mixed",
  rounded = "rounded-3xl",
  priority = false,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  objectPosition = "center",
  children,
}: HealthcareImageProps) {
  const meta = SLOTFILL_IMAGES[imageKey];
  const showPhoto = meta.enabled;

  return (
    <div
      className={`relative isolate overflow-hidden ${rounded} ${className}`}
      style={{ border: "1px solid var(--color-border)" }}
    >
      {showPhoto ? (
        <Image
          src={slotfillImageSrc(imageKey)}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="-z-10 object-cover"
          style={{ objectPosition }}
        />
      ) : (
        <>
          {/* Tonale Grundfläche (Light + Dark) */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 dark:hidden"
            style={{ background: TONE_BG[tone] }}
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 hidden dark:block"
            style={{ background: TONE_BG_DARK[tone] }}
          />
          {/* Weiche Lichtkreise für Tiefe */}
          <div
            aria-hidden
            className="absolute -right-10 -top-12 h-48 w-48 rounded-full opacity-40 blur-2xl"
            style={{ background: "var(--gradient-brand)" }}
          />
          <div
            aria-hidden
            className="absolute -bottom-16 -left-10 h-44 w-44 rounded-full opacity-25 blur-2xl"
            style={{ background: "var(--color-accent)" }}
          />
          {/* Ruhiges Icon-Wasserzeichen */}
          <div aria-hidden className="absolute inset-0 -z-0 flex items-center justify-center">
            <Icon
              className="h-1/3 w-1/3 max-h-32 max-w-32 text-slate-400/40 dark:text-slate-500/30"
              strokeWidth={1}
            />
          </div>
          {/* Bildunterschrift-Chip */}
          <div className="absolute bottom-3 left-3 z-10">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium shadow-sm backdrop-blur-sm"
              style={{
                backgroundColor: "color-mix(in srgb, var(--color-surface) 80%, transparent)",
                color: "var(--color-muted)",
                border: "1px solid var(--color-border)",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-accent)" }} />
              {caption ?? alt}
            </span>
          </div>
        </>
      )}
      {children}
    </div>
  );
}
