"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Stethoscope, Info } from "lucide-react";
import { signIn } from "../actions";
import { SlotFillLogo } from "@/components/ui/SlotFillLogo";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const result = await signIn(formData);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 px-4 py-12 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-900">
      {/* Decorative background rings — pure CSS, no images */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full opacity-[0.09] blur-3xl dark:opacity-[0.06]"
        style={{ background: "var(--gradient-brand)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 right-0 h-80 w-80 rounded-full opacity-[0.06] blur-2xl dark:opacity-[0.04]"
        style={{ background: "var(--gradient-brand)" }}
      />

      {/* Logo */}
      <div className="relative mb-8">
        <SlotFillLogo href="/de" size={38} />
      </div>

      {/* Patient notice */}
      <div className="relative mb-5 flex items-start gap-2.5 rounded-xl border border-blue-200/70 bg-blue-50/80 px-4 py-3 text-sm text-blue-800 backdrop-blur-sm dark:border-blue-900/50 dark:bg-blue-950/50 dark:text-blue-300 w-full max-w-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
        <span>
          <strong>Patienten:</strong> Kein Login nötig.{" "}
          <Link
            href="/de/termin-buchen"
            className="font-medium underline underline-offset-2 hover:no-underline"
          >
            Direkt Termin anfragen →
          </Link>
        </span>
      </div>

      {/* Login card */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl ring-1 ring-slate-900/5 dark:border-slate-700/60 dark:bg-slate-900 dark:ring-white/5">
        {/* Card header */}
        <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white px-6 pt-6 pb-5 dark:border-slate-800 dark:from-slate-800/40 dark:to-transparent">
          <div className="mb-2 flex items-center gap-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600">
              <Stethoscope className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Praxis-Login
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Anmelden
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Für Praxis-Accounts und Team-Zugänge
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              E-Mail-Adresse
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="praxis@beispiel.de"
              className="input-brand"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Passwort
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                Vergessen?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="input-brand"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-brand w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Wird geladen …" : "Anmelden"}
          </button>
        </form>

        {/* Card footer */}
        <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/20">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Noch kein Praxis-Konto?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              Kostenlos registrieren
            </Link>
          </p>
        </div>
      </div>

      {/* Footer caption */}
      <p className="relative mt-8 text-center text-xs text-slate-400 max-w-xs leading-relaxed dark:text-slate-500">
        ClinicSlotHub · Terminmanagement für Arztpraxen und Kliniken in ausgewählten internationalen Märkten
      </p>
    </main>
  );
}
