"use client";

import { useState } from "react";
import { getPivot, PIVOT_COLORS } from "@/lib/pivot-content";

/**
 * Request-access CTA with a visible email fallback.
 * "Request pilot access" opens the visitor's own mail client (mailto:).
 * The email address is always shown as text, and "Copy email" uses the
 * Clipboard API when available — otherwise the address simply stays visible.
 * No storage, no API, no form submission, no patient data.
 */
export function RequestAccess({ locale, email }: { locale: string; email: string }) {
  const d = getPivot(locale);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Clipboard not available — the address stays visible below as a fallback.
    }
  };

  return (
    <div className="rounded-2xl border p-6" style={{ borderColor: PIVOT_COLORS.line, backgroundColor: PIVOT_COLORS.surface }}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <a
            href={`mailto:${email}?subject=ClinicSlotHub%20pilot%20access`}
            className="inline-block rounded-xl px-6 py-3 text-[15px] font-semibold text-white transition"
            style={{ backgroundColor: PIVOT_COLORS.teal }}
          >
            {d.cta.requestAccess}
          </a>
          <p className="mt-3 text-[13px]" style={{ color: PIVOT_COLORS.slate }}>
            {d.access.emailIntro}{" "}
            <a href={`mailto:${email}`} className="font-semibold underline" style={{ color: PIVOT_COLORS.tealDark }}>{email}</a>
          </p>
        </div>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-lg border px-4 py-2.5 text-[13px] font-semibold transition"
          style={{ borderColor: PIVOT_COLORS.teal, color: PIVOT_COLORS.tealDark }}
        >
          {copied ? `✓ ${d.access.copied}` : d.access.copyEmail}
        </button>
      </div>
    </div>
  );
}
