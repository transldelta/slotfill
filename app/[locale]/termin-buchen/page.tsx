"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarClock, CheckCircle2 } from "lucide-react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { SlotFillLogo } from "@/components/ui/SlotFillLogo";
import { submitBookingRequest } from "@/app/termin-buchen/actions";

export default function TerminBuchenPage() {
  const params = useParams();
  const locale = (params.locale as string) ?? "de";

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const privacyAccepted = fd.get("privacy_accepted") === "true";
    if (!privacyAccepted) {
      setLoading(false);
      setError("Bitte akzeptieren Sie den Datenschutz- und Buchungshinweis.");
      return;
    }

    const result = await submitBookingRequest(fd);
    setLoading(false);

    if (result.code === "BOOKING_SAVED") {
      setDone(true);
    } else if (result.code === "PRIVACY_NOT_ACCEPTED") {
      setError("Datenschutz- und Buchungshinweis muss akzeptiert werden.");
    } else if (result.code === "VALIDATION_ERROR") {
      setError(result.message);
    } else {
      toast.error("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    }
  }

  // ── Erfolgs-Anzeige ──────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
        <header className="border-b px-4 py-3" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
          <SlotFillLogo href={`/${locale}`} size={30} />
        </header>
        <main className="mx-auto max-w-lg flex-1 px-4 py-16 text-center">
          <CheckCircle2
            className="mx-auto h-16 w-16"
            style={{ color: "var(--color-accent)" }}
          />
          <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
            Anfrage übermittelt!
          </h1>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Ihre Anfrage wurde übermittelt. Die Praxis bestätigt den Termin manuell.
            Sie erhalten eine Rückmeldung sobald Ihre Anfrage geprüft wurde.
          </p>
          <div
            className="mt-6 rounded-xl border p-4 text-sm text-left"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
          >
            <p className="font-medium text-slate-700 dark:text-slate-300">
              Wichtiger Hinweis:
            </p>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Ihre Anfrage ist noch keine verbindliche Terminbestätigung.
              Die Praxis prüft Verfügbarkeit und Eignung und meldet sich bei Ihnen.
            </p>
          </div>
          <Link
            href={`/${locale}`}
            className="mt-8 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            ← Zur Startseite
          </Link>
        </main>
      </div>
    );
  }

  // ── Formular ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
      <header className="border-b px-4 py-3" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
        <SlotFillLogo href={`/${locale}`} size={30} />
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-12">
        <Link
          href={`/${locale}`}
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Zurück
        </Link>

        <div className="mt-4 flex items-center gap-3">
          <CalendarClock
            className="h-8 w-8 shrink-0"
            style={{ color: "var(--color-primary)" }}
          />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Termin anfragen
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ihre Anfrage wird manuell durch die Praxis geprüft.
            </p>
          </div>
        </div>

        {/* Wichtiger Hinweis-Banner */}
        <div
          className="mt-6 rounded-xl border p-4 text-sm"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
        >
          <p className="font-medium text-slate-700 dark:text-slate-300">
            🗓 Wie funktioniert es?
          </p>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            1. Füllen Sie das Formular aus und senden Sie Ihre Anfrage ab.
            <br />
            2. Die Praxis prüft die Anfrage und bestätigt den Termin manuell.
            <br />
            3. Sie erhalten eine Rückmeldung per E-Mail.
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Diese Anfrage ist noch keine verbindliche Terminbestätigung.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* Name */}
          <div>
            <label
              htmlFor="patient_name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Ihr Name <span className="text-red-500">*</span>
            </label>
            <input
              id="patient_name"
              name="patient_name"
              type="text"
              required
              maxLength={100}
              placeholder="Vorname Nachname"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)",
              }}
            />
          </div>

          {/* E-Mail */}
          <div>
            <label
              htmlFor="patient_email"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              E-Mail <span className="text-red-500">*</span>
            </label>
            <input
              id="patient_email"
              name="patient_email"
              type="email"
              required
              placeholder="ihre@email.de"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)",
              }}
            />
          </div>

          {/* Telefon */}
          <div>
            <label
              htmlFor="patient_phone"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Telefon (optional)
            </label>
            <input
              id="patient_phone"
              name="patient_phone"
              type="tel"
              maxLength={30}
              placeholder="+49 000 000 0000"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)",
              }}
            />
          </div>

          {/* Gewünschter Zeitraum */}
          <div>
            <label
              htmlFor="preferred_time"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Gewünschter Zeitraum <span className="text-red-500">*</span>
            </label>
            <input
              id="preferred_time"
              name="preferred_time"
              type="text"
              required
              maxLength={200}
              placeholder="z. B. Mo–Fr morgens, oder: KW 25 nachmittags"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)",
              }}
            />
          </div>

          {/* Anliegen */}
          <div>
            <label
              htmlFor="note"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Anliegen / Notiz (optional)
            </label>
            <textarea
              id="note"
              name="note"
              rows={3}
              maxLength={1000}
              placeholder="Kurze Beschreibung des Anliegens"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)",
              }}
            />
          </div>

          {/* Datenschutz / Buchungshinweis (Pflicht) */}
          <div className="flex items-start gap-3 rounded-xl border p-4" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
            <input
              id="privacy_accepted"
              name="privacy_accepted"
              type="checkbox"
              value="true"
              required
              className="mt-0.5 h-4 w-4 rounded"
            />
            <label
              htmlFor="privacy_accepted"
              className="text-sm text-slate-700 dark:text-slate-300"
            >
              Ich habe den{" "}
              <Link
                href={`/${locale}/datenschutz`}
                className="underline hover:no-underline"
                target="_blank"
                rel="noopener"
              >
                Datenschutzhinweis
              </Link>{" "}
              gelesen und bin damit einverstanden, dass meine Daten zur
              Bearbeitung der Terminanfrage verarbeitet werden.
              Meine Anfrage ist noch keine verbindliche Terminbestätigung.{" "}
              <span className="text-red-500">*</span>
            </label>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-brand w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Wird gesendet…" : "Anfrage absenden"}
          </button>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Keine automatische Bestätigung. Die Praxis prüft Ihre Anfrage manuell
            und meldet sich bei Ihnen.
          </p>
        </form>
      </main>
    </div>
  );
}
