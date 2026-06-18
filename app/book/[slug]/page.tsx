"use client";

/**
 * /book/[slug] – Öffentliche Terminanfrage-Seite einer konkreten Praxis
 *
 * Diese Seite ist ohne Login zugänglich (für Patienten).
 * Sie lädt die Praxis per Slug, zeigt den Praxisnamen, und lässt
 * den Patienten eine Terminanfrage mit tenant_id der richtigen Praxis senden.
 *
 * Sicherheitsregeln:
 * - Kein Login für Patienten nötig
 * - practice_id kommt vom Server (nie vom Patienten manipulierbar –
 *   sie wird serverseitig aus dem Slug aufgelöst)
 * - Datenschutz-Checkbox ist Pflicht (server-seitig erzwungen via RLS)
 * - Kein Dashboard-Zugriff von dieser Seite möglich
 * - Keine anderen Praxen sichtbar
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarClock, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { SlotFillLogo } from "@/components/ui/SlotFillLogo";
import { submitBookingRequest } from "@/app/termin-buchen/actions";

// ─── Typen ─────────────────────────────────────────────────────────────────

interface BookingSlot {
  date: string;   // "YYYY-MM-DD"
  time: string;   // "HH:MM"
  label: string;  // "Mo. 15.01.2024 · 10:00 Uhr"
}

interface PracticeInfo {
  id: string;
  name: string;
  slug: string;
}

const PLACEHOLDER_SLOT = "__placeholder__";

// ─── Hilfsfunktionen ───────────────────────────────────────────────────────

/** Lädt öffentliche Praxisinformationen per Slug (nur id, name, slug). */
async function fetchPractice(slug: string): Promise<PracticeInfo | null> {
  try {
    const res = await fetch(`/api/practices/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as PracticeInfo;
  } catch {
    return null;
  }
}

/** Lädt verfügbare Zeitslots für eine konkrete Praxis. */
async function fetchSlots(
  practiceId: string,
): Promise<{ slots: BookingSlot[]; has_rules: boolean; message?: string }> {
  try {
    const res = await fetch(
      `/api/booking-slots?practice_id=${encodeURIComponent(practiceId)}`,
      { cache: "no-store" },
    );
    if (!res.ok) return { slots: [], has_rules: false };
    return await res.json();
  } catch {
    return { slots: [], has_rules: false };
  }
}

// ─── Seite ─────────────────────────────────────────────────────────────────

export default function BookSlugPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";

  // Praxis-State
  const [practice, setPractice] = useState<PracticeInfo | null>(null);
  const [practiceLoading, setPracticeLoading] = useState(true);
  const [practiceNotFound, setPracticeNotFound] = useState(false);

  // Slot-State
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [hasRules, setHasRules] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsMessage, setSlotsMessage] = useState<string | null>(null);

  // Formular-State
  const [selectedSlotKey, setSelectedSlotKey] = useState(PLACEHOLDER_SLOT);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [autoConfirmed, setAutoConfirmed] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ── 1. Praxis per Slug laden ──────────────────────────────────────────
  useEffect(() => {
    if (!slug) return;
    setPracticeLoading(true);
    fetchPractice(slug).then((p) => {
      setPracticeLoading(false);
      if (!p) {
        setPracticeNotFound(true);
      } else {
        setPractice(p);
      }
    });
  }, [slug]);

  // ── 2. Slots laden sobald Praxis bekannt ─────────────────────────────
  useEffect(() => {
    if (!practice?.id) return;
    setSlotsLoading(true);
    fetchSlots(practice.id).then((data) => {
      setSlotsLoading(false);
      setSlots(data.slots ?? []);
      setHasRules(data.has_rules ?? false);
      setSlotsMessage(data.message ?? null);
    });
  }, [practice?.id]);

  const selectedSlot: BookingSlot | null =
    selectedSlotKey === PLACEHOLDER_SLOT
      ? null
      : (slots.find((s) => `${s.date}T${s.time}` === selectedSlotKey) ?? null);

  const showSlotSelector = hasRules && slots.length > 0;

  // ── Absenden ──────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const fd = new FormData(e.currentTarget);

    if (showSlotSelector && !selectedSlot) {
      setFormError("Bitte wählen Sie einen freien Zeitslot aus.");
      return;
    }

    const pt = (fd.get("preferred_time") as string | null)?.trim() ?? "";
    if (!pt || pt.toLowerCase().includes("einen freien slot auswählen")) {
      setFormError(
        "Bitte wählen Sie einen Zeitslot aus oder geben Sie einen Wunschzeitraum an.",
      );
      return;
    }

    if (fd.get("privacy_accepted") !== "true") {
      setFormError("Bitte akzeptieren Sie den Datenschutz- und Buchungshinweis.");
      return;
    }

    setLoading(true);
    const result = await submitBookingRequest(fd);
    setLoading(false);

    if (result.code === "BOOKING_SAVED") {
      setAutoConfirmed(result.autoConfirmed);
      setDone(true);
    } else if (result.code === "PRIVACY_NOT_ACCEPTED") {
      setFormError("Datenschutz- und Buchungshinweis muss akzeptiert werden.");
    } else if (result.code === "VALIDATION_ERROR") {
      setFormError(result.message ?? "Ungültige Eingabe.");
    } else {
      toast.error("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    }
  }

  // ── Ladezustand Praxis ────────────────────────────────────────────────
  if (practiceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="flex items-center gap-2 text-slate-500">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
          <span>Lade Praxisinformationen…</span>
        </div>
      </div>
    );
  }

  // ── Praxis nicht gefunden ─────────────────────────────────────────────
  if (practiceNotFound || !practice) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
        <header className="border-b px-4 py-3" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
          <SlotFillLogo href="/" size={30} />
        </header>
        <main className="mx-auto max-w-lg flex-1 px-4 py-16 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
          <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-slate-100">
            Buchungsseite nicht gefunden
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Der Link ist ungültig oder die Praxis ist nicht mehr aktiv.
            Bitte wenden Sie sich direkt an Ihre Praxis.
          </p>
          <Link href="/" className="mt-6 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400">
            ← Zur Startseite
          </Link>
        </main>
      </div>
    );
  }

  // ── Erfolg ────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
        <header className="border-b px-4 py-3" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
          <SlotFillLogo href="/" size={30} />
        </header>
        <main className="mx-auto max-w-lg flex-1 px-4 py-16 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16" style={{ color: "var(--color-accent)" }} />

          {autoConfirmed ? (
            <>
              <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100"
                data-testid="auto-confirm-success-heading">
                Termin bestätigt!
              </h1>
              <p className="mt-3 text-slate-600 dark:text-slate-400">
                Ihr Termin bei <strong>{practice.name}</strong> wurde automatisch bestätigt.
                Sie erhalten eine Bestätigung per E-Mail.
              </p>
            </>
          ) : (
            <>
              <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
                Anfrage übermittelt!
              </h1>
              <p className="mt-3 text-slate-600 dark:text-slate-400"
                data-testid="manual-confirm-message">
                Ihre Anfrage bei <strong>{practice.name}</strong> wurde übermittelt und wird
                manuell geprüft. Sie erhalten eine Rückmeldung per E-Mail.
              </p>
              <div className="mt-6 rounded-xl border p-4 text-sm text-left"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  Wichtiger Hinweis:
                </p>
                <p className="mt-1 text-slate-600 dark:text-slate-400">
                  Ihre Anfrage ist noch keine verbindliche Terminbestätigung.
                  Die Praxis prüft Verfügbarkeit und Eignung und meldet sich bei Ihnen.
                </p>
              </div>
            </>
          )}

          <Link href="/" className="mt-8 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400">
            ← Zur Startseite
          </Link>
        </main>
      </div>
    );
  }

  // ── Formular ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50/30 to-white dark:from-blue-950/10 dark:to-transparent">
      <header className="border-b px-4 py-3" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
        <SlotFillLogo href="/" size={30} />
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-12">
        {/* Practice header */}
        <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <CalendarClock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Termin anfragen
              </h1>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {practice.name}
              </p>
            </div>
          </div>

          {/* Kein-Login-Badge */}
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/20 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Kein Login nötig – Anfrage direkt senden
          </div>
        </div>

        {/* Hinweis-Banner */}
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-sm dark:border-blue-900/30 dark:bg-blue-950/10">
          <p className="font-semibold text-blue-800 dark:text-blue-200">
            Wie funktioniert es?
          </p>
          <ol className="mt-2 space-y-1 text-slate-600 dark:text-slate-400">
            <li>1. Füllen Sie das Formular aus und senden Sie Ihre Anfrage ab.</li>
            <li>2. Die Praxis prüft Ihre Anfrage und meldet sich per E-Mail.</li>
            <li>3. Erst nach Bestätigung durch die Praxis ist der Termin verbindlich.</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* tenant_id der aufgelösten Praxis – kommt aus dem Slug, nicht vom Patient */}
          <input type="hidden" name="tenant_id" value={practice.id} />

          {/* Name */}
          <div>
            <label htmlFor="patient_name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Ihr Name <span className="text-red-500">*</span>
            </label>
            <input
              id="patient_name" name="patient_name" type="text"
              required maxLength={100} placeholder="Vorname Nachname"
              className="mt-1 input-brand"
            />
          </div>

          {/* E-Mail */}
          <div>
            <label htmlFor="patient_email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              E-Mail <span className="text-red-500">*</span>
            </label>
            <input
              id="patient_email" name="patient_email" type="email"
              required placeholder="ihre@email.de"
              className="mt-1 input-brand"
            />
          </div>

          {/* Telefon */}
          <div>
            <label htmlFor="patient_phone" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Telefon (optional)
            </label>
            <input
              id="patient_phone" name="patient_phone" type="tel"
              maxLength={30} placeholder="+49 000 000 0000"
              className="mt-1 input-brand"
            />
          </div>

          {/* Zeitfenster / Slot */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              {showSlotSelector
                ? <> Zeitfenster auswählen <span className="text-red-500">*</span> </>
                : <> Gewünschter Zeitraum <span className="text-red-500">*</span> </>
              }
            </label>

            {slotsLoading ? (
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800">
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-500" />
                Verfügbare Zeitfenster werden geladen…
              </div>
            ) : showSlotSelector ? (
              <>
                <select
                  data-testid="slot-selector"
                  value={selectedSlotKey}
                  onChange={(e) => setSelectedSlotKey(e.target.value)}
                  className="mt-1 input-brand"
                  aria-label="Zeitfenster auswählen"
                >
                  <option value={PLACEHOLDER_SLOT} disabled>
                    — Bitte einen freien Slot auswählen —
                  </option>
                  {slots.map((slot) => (
                    <option key={`${slot.date}T${slot.time}`} value={`${slot.date}T${slot.time}`}>
                      {slot.label}
                    </option>
                  ))}
                </select>
                <input type="hidden" name="preferred_time" value={selectedSlot?.label ?? ""} />
                <input type="hidden" name="requested_date" value={selectedSlot?.date ?? ""} />
                <input type="hidden" name="requested_time" value={selectedSlot?.time ?? ""} />
              </>
            ) : (
              <>
                {slotsMessage && (
                  <div className="mt-1 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-400">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{slotsMessage}</span>
                  </div>
                )}
                <input
                  id="preferred_time" name="preferred_time" type="text"
                  required maxLength={200}
                  placeholder="z. B. Mo–Fr morgens, oder: KW 25 nachmittags"
                  className="mt-1 input-brand"
                />
                <input type="hidden" name="requested_date" value="" />
                <input type="hidden" name="requested_time" value="" />
              </>
            )}
          </div>

          {/* Anliegen */}
          <div>
            <label htmlFor="note" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Anliegen / Notiz (optional)
            </label>
            <textarea
              id="note" name="note" rows={3} maxLength={1000}
              placeholder="Kurze Beschreibung des Anliegens"
              className="mt-1 input-brand resize-none"
            />
          </div>

          {/* Datenschutz (Pflicht) */}
          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
            <input
              id="privacy_accepted" name="privacy_accepted"
              type="checkbox" value="true" required
              className="mt-0.5 h-4 w-4 rounded"
            />
            <label htmlFor="privacy_accepted" className="text-sm text-slate-700 dark:text-slate-300">
              Ich habe den{" "}
              <Link href="/de/datenschutz" className="underline hover:no-underline" target="_blank" rel="noopener">
                Datenschutzhinweis
              </Link>{" "}
              gelesen und bin damit einverstanden, dass meine Daten zur Bearbeitung
              der Terminanfrage verarbeitet werden. Meine Anfrage ist noch keine
              verbindliche Terminbestätigung.{" "}
              <span className="text-red-500">*</span>
            </label>
          </div>

          {formError && (
            <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
          )}

          <button
            type="submit"
            disabled={loading || slotsLoading || (showSlotSelector && !selectedSlot)}
            className="btn-brand w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Wird gesendet…" : "Anfrage absenden"}
          </button>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Sie erhalten eine Rückmeldung per E-Mail, sobald Ihre Anfrage bearbeitet wurde.
          </p>
        </form>
      </main>
    </div>
  );
}
