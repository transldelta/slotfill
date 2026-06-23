"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

interface MobileMenuLabels {
  menuAria: string;
  providerTitle: string;
  pricing: string;
  requestAccess: string;
  login: string;
  patientTitle: string;
  patientCta: string;
}

/**
 * Mobiles Header-Menü mit kontrolliertem open-State.
 *
 * Behebt das <details>-Problem (blieb beim Scrollen offen, schloss nicht nach
 * Klick): Das Menü schließt bei Link-Klick, beim Scrollen und bei Klick außerhalb.
 * Keine neuen Packages, keine großen Animationen. Dropdown wird nur bei open
 * gerendert → keine Hydration-Diskrepanz (Server rendert geschlossen).
 */
export function MobileMenu({ locale, labels }: { locale: string; labels: MobileMenuLabels }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    // Schließen beim Scrollen, bei Klick außerhalb und mit Escape.
    window.addEventListener("scroll", close, { passive: true });
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close);
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const itemClass =
    "block rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800";

  return (
    <div ref={ref} className="relative sm:hidden">
      <button
        type="button"
        aria-label={labels.menuAria}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center rounded-md px-2 py-1.5 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open && (
        <div
          className="absolute right-0 z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-xl border bg-white p-3 shadow-xl dark:bg-slate-900"
          style={{ borderColor: "var(--color-border)" }}
        >
          <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {labels.providerTitle}
          </p>
          <a href="#pricing" className={itemClass} onClick={() => setOpen(false)}>
            {labels.pricing}
          </a>
          <Link href={`/${locale}/kontakt`} className={itemClass} onClick={() => setOpen(false)}>
            {labels.requestAccess}
          </Link>
          <Link href="/auth/login" className={itemClass} onClick={() => setOpen(false)}>
            {labels.login}
          </Link>
          <div className="my-2 border-t" style={{ borderColor: "var(--color-border)" }} />
          <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {labels.patientTitle}
          </p>
          <Link
            href={`/${locale}/termin-buchen`}
            className="block rounded-md px-2 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
            onClick={() => setOpen(false)}
          >
            {labels.patientCta}
          </Link>
        </div>
      )}
    </div>
  );
}
