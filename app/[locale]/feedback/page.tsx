"use client";

import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { SlotFillLogo } from "@/components/ui/SlotFillLogo";
import { submitFeedback } from "@/app/feedback/actions";
import { FormAntiSpamFields } from "@/components/ui/FormAntiSpamFields";

const GOOGLE_REVIEW_URL =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL ?? null
    : null;

export default function FeedbackPage() {
  const params = useParams();
  const locale = (params.locale as string) ?? "de";

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ rating: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isBadRating = rating > 0 && rating <= 3;
  const isGoodRating = rating >= 4;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Bitte wählen Sie eine Bewertung.");
      return;
    }
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    fd.set("rating", String(rating));
    // Bei schlechter Bewertung: consent_to_publish immer false
    if (isBadRating) fd.set("consent_to_publish", "false");

    const result = await submitFeedback(fd);
    setLoading(false);

    if (result.code === "FEEDBACK_SAVED") {
      setDone({ rating: result.rating });
    } else if (result.code === "CONSENT_MISSING") {
      setError("Bitte stimmen Sie der internen Verarbeitung zu.");
    } else if (result.code === "VALIDATION_ERROR") {
      setError(result.message);
    } else {
      toast.error("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    }
  }

  // ── Erfolgs-Anzeige ────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
        <header className="border-b px-4 py-3" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
          <SlotFillLogo href={`/${locale}`} size={30} />
        </header>
        <main className="mx-auto max-w-lg flex-1 px-4 py-16 text-center">
          <div className="mb-4 text-5xl">
            {done.rating <= 3 ? "🙏" : "⭐"}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Vielen Dank für Ihr Feedback!
          </h1>
          {done.rating <= 3 ? (
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              Ihr Feedback wurde intern übermittelt und wird persönlich geprüft.
              Wir nehmen Ihre Rückmeldung ernst und arbeiten kontinuierlich an Verbesserungen.
            </p>
          ) : (
            <>
              <p className="mt-3 text-slate-600 dark:text-slate-400">
                Wir freuen uns über Ihre positive Rückmeldung! Ihr Feedback wurde intern gespeichert.
              </p>
              {/* Google-Link: NUR als optionaler Button, NIEMALS automatisch */}
              {GOOGLE_REVIEW_URL && (
                <div className="mt-6 rounded-xl border p-5" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Möchten Sie uns auch auf Google bewerten?
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Komplett freiwillig – Sie entscheiden selbst.
                  </p>
                  <a
                    href={GOOGLE_REVIEW_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-brand mt-3 inline-block text-xs"
                    aria-label="Google-Bewertung abgeben (externe Seite, öffnet neues Tab)"
                  >
                    Auf Google bewerten →
                  </a>
                </div>
              )}
            </>
          )}
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

  // ── Formular ──────────────────────────────────────────────────────────
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

        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
          Ihre Meinung zählt
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Helfen Sie uns, ClinicSlotHub für Arztpraxen besser zu machen.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <FormAntiSpamFields />
          {/* Sternebewertung */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Bewertung <span className="text-red-500">*</span>
            </label>
            <div className="mt-2 flex gap-1" role="group" aria-label="Sternebewertung 1 bis 5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  aria-label={`${star} von 5 Sternen`}
                  aria-pressed={rating === star}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className="h-8 w-8"
                    fill={star <= (hovered || rating) ? "currentColor" : "none"}
                    style={{
                      color:
                        star <= (hovered || rating)
                          ? star <= 3
                            ? "#f59e0b"
                            : "#22c55e"
                          : "#cbd5e1",
                    }}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {rating === 1 && "Sehr schlecht"}
                {rating === 2 && "Schlecht"}
                {rating === 3 && "Mittelmäßig"}
                {rating === 4 && "Gut"}
                {rating === 5 && "Sehr gut"}
              </p>
            )}
          </div>

          {/* Feedback-Text */}
          <div>
            <label
              htmlFor="feedback_text"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Ihr Feedback (optional)
            </label>
            <textarea
              id="feedback_text"
              name="feedback_text"
              rows={4}
              maxLength={2000}
              placeholder="Was hat Ihnen gefallen oder nicht gefallen?"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)",
              }}
            />
          </div>

          {/* Name */}
          <div>
            <label
              htmlFor="customer_name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Ihr Name (optional)
            </label>
            <input
              id="customer_name"
              name="customer_name"
              type="text"
              maxLength={100}
              placeholder="z. B. Max M."
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
              htmlFor="customer_email"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              E-Mail (optional, für Rückfragen)
            </label>
            <input
              id="customer_email"
              name="customer_email"
              type="email"
              placeholder="ihre@email.de"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)",
              }}
            />
          </div>

          {/* Interne Einwilligung (Pflicht) */}
          <div className="flex items-start gap-3">
            <input
              id="consent_internal"
              name="consent_internal"
              type="checkbox"
              value="true"
              required
              className="mt-0.5 h-4 w-4 rounded"
            />
            <label
              htmlFor="consent_internal"
              className="text-sm text-slate-700 dark:text-slate-300"
            >
              Ich bin damit einverstanden, dass mein Feedback intern gespeichert
              und zur Verbesserung des Dienstes verwendet wird.{" "}
              <span className="text-red-500">*</span>
            </label>
          </div>

          {/* Veröffentlichungs-Einwilligung (nur bei 4–5 Sternen sinnvoll) */}
          {isGoodRating && (
            <div className="flex items-start gap-3 rounded-lg border p-4" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
              <input
                id="consent_to_publish"
                name="consent_to_publish"
                type="checkbox"
                value="true"
                className="mt-0.5 h-4 w-4 rounded"
              />
              <label
                htmlFor="consent_to_publish"
                className="text-sm text-slate-600 dark:text-slate-400"
              >
                Mein Feedback darf nach Prüfung durch das ClinicSlotHub-Team als anonymes
                Testimonial auf der Website angezeigt werden. (Freiwillig)
              </label>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || rating === 0}
            className="btn-brand w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Wird gesendet…" : "Feedback absenden"}
          </button>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Ihr Feedback wird ausschließlich intern gespeichert. Kein automatisches
            Google-Review. Weitere Informationen in unserer{" "}
            <Link
              href={`/${locale}/datenschutz`}
              className="underline hover:no-underline"
            >
              Datenschutzerklärung
            </Link>
            .
          </p>
        </form>
      </main>
    </div>
  );
}
