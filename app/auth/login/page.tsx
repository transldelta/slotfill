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
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4 py-12">
      {/* Logo */}
      <div className="mb-8">
        <SlotFillLogo href="/de" size={36} />
      </div>

      {/* Patient notice */}
      <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300 w-full max-w-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          <strong>Patienten:</strong> Kein Login nötig.{" "}
          <Link
            href="/de/termin-buchen"
            className="underline underline-offset-2 hover:no-underline"
          >
            Direkt Termin anfragen →
          </Link>
        </span>
      </div>

      {/* Login card */}
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
        {/* Card header */}
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 pt-6 pb-5 dark:border-slate-800 dark:bg-slate-800/30">
          <div className="mb-1.5 flex items-center gap-1.5">
            <Stethoscope className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Praxis-Login
            </span>
          </div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
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
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
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
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Passwort
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-blue-600 hover:underline dark:text-blue-400"
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
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Wird geladen …" : "Anmelden"}
          </button>
        </form>

        {/* Card footer */}
        <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/30">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Noch kein Praxis-Konto?{" "}
            <Link
              href="/auth/register"
              className="font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Kostenlos registrieren
            </Link>
          </p>
        </div>
      </div>

      {/* Footer caption */}
      <p className="mt-8 text-xs text-slate-400 text-center max-w-xs leading-relaxed">
        ClinicSlotHub · Terminmanagement für Arztpraxen und Kliniken weltweit
      </p>
    </main>
  );
}
