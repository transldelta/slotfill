"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock, CheckCircle2, Info } from "lucide-react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { SlotFillLogo } from "@/components/ui/SlotFillLogo";
import { submitBookingRequest } from "@/app/termin-buchen/actions";
import { getMarketScope } from "@/lib/market-scope";

// ─── Typen ─────────────────────────────────────────────────────────────────

interface BookingSlot {
  date: string;  // "YYYY-MM-DD"
  time: string;  // "HH:MM"
  label: string; // "Mo. 15.01.2024 · 10:00 Uhr"
}

// Dieser Wert markiert die Platzhalter-Option – er darf nie abgesendet werden
const PLACEHOLDER_SLOT = "__placeholder__";

// ─── Seite ─────────────────────────────────────────────────────────────────

export default function TerminBuchenPage() {
  const params = useParams();
  const locale = (params.locale as string) ?? "de";

  // Form-State
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [autoConfirmed, setAutoConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Slot-Lade-State
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [hasRules, setHasRules] = useState(false);
  const [slotsMessage, setSlotsMessage] = useState<string | null>(null);
  const [practiceId, setPracticeId] = useState<string | null>(null);

  // Ausgewählter Slot
  const [selectedSlotKey, setSelectedSlotKey] = useState(PLACEHOLDER_SLOT);

  // Slots + practice_id beim Mount laden
  useEffect(() => {
    async function loadSlots() {
      setSlotsLoading(true);
      try {
        const res = await fetch("/api/booking-slots");
        if (res.ok) {
          const data = await res.json();
          setSlots(data.slots ?? []);
          setHasRules(data.has_rules ?? false);
          setSlotsMessage(data.message ?? null);
          // practice_id für Auto-Confirm-Zuordnung speichern
          if (data.practice_id) setPracticeId(data.practice_id as string);
        }
      } catch {
        // Netzwerkfehler: Text-Eingabe als Fallback
      } finally {
        setSlotsLoading(false);
      }
    }
    loadSlots();
  }, []);

  // Aktuell gewählter Slot (null wenn Platzhalter oder kein Slot)
  const selectedSlot: BookingSlot | null =
    selectedSlotKey === PLACEHOLDER_SLOT
      ? null
      : (slots.find((s) => `${s.date}T${s.time}` === selectedSlotKey) ?? null);

  // Zeige Slot-Selector wenn Regeln existieren und Slots vorhanden sind
  const showSlotSelector = hasRules && slots.length > 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);

    // Slot-Validierung (Client-seitig)
    if (showSlotSelector) {
      if (!selectedSlot) {
        setError("Bitte wählen Sie einen freien Zeitslot aus.");
        return;
      }
    }

    // preferred_time darf kein Platzhalter sein
    const pt = (fd.get("preferred_time") as string | null)?.trim() ?? "";
    if (!pt || pt.toLowerCase().includes("einen freien slot auswählen")) {
      setError(
        "Bitte wählen Sie einen Zeitslot aus oder geben Sie einen Wunschzeitraum an.",
      );
      return;
    }

    const privacyAccepted = fd.get("privacy_accepted") === "true";
    if (!privacyAccepted) {
      setError("Bitte akzeptieren Sie den Datenschutz- und Buchungshinweis.");
      return;
    }

    setLoading(true);
    const result = await submitBookingRequest(fd);
    setLoading(false);

    if (result.code === "BOOKING_SAVED") {
      setAutoConfirmed(result.autoConfirmed);
      setDone(true);
    } else if (result.code === "PRIVACY_NOT_ACCEPTED") {
      setError("Datenschutz- und Buchungshinweis muss akzeptiert werden.");
    } else if (result.code === "VALIDATION_ERROR") {
      setError(result.message ?? "Ungültige Eingabe.");
    } else {
      toast.error("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    }
  }

  // ── Erfolgs-Anzeige ──────────────────────────────────────────────────
  if (done) {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <header
          className="border-b px-4 py-3"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-surface)",
          }}
        >
          <SlotFillLogo href={`/${locale}`} size={30} />
        </header>
        <main className="mx-auto max-w-lg flex-1 px-4 py-16 text-center">
          <CheckCircle2
            className="mx-auto h-16 w-16"
            style={{ color: "var(--color-accent)" }}
          />

          {autoConfirmed ? (
            /* Auto-Confirm Erfolg */
            <>
              <h1
                className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100"
                data-testid="auto-confirm-success-heading"
              >
                Termin bestätigt!
              </h1>
              <p className="mt-3 text-slate-600 dark:text-slate-400">
                Ihr Termin wurde automatisch bestätigt. Sie erhalten eine
                Bestätigung per E-Mail.
              </p>
              <div
                className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-left dark:border-green-900/30 dark:bg-green-900/10"
              >
                <p className="font-medium text-green-800 dark:text-green-300">
                  ✅ Automatisch bestätigt
                </p>
                <p className="mt-1 text-green-700 dark:text-green-400">
                  Die Praxis hat für diesen Zeitraum automatische Bestätigungen
                  aktiviert. Bitte prüfen Sie Ihr E-Mail-Postfach.
                </p>
              </div>
            </>
          ) : (
            /* Manuelle Prüfung */
            <>
              <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
                Anfrage übermittelt!
              </h1>
              <p
                className="mt-3 text-slate-600 dark:text-slate-400"
                data-testid="manual-confirm-message"
              >
                Ihre Anfrage wurde übermittelt und wird manuell geprüft. Sie
                erhalten eine Rückmeldung sobald Ihre Anfrage bearbeitet wurde.
              </p>
              <div
                className="mt-6 rounded-xl border p-4 text-sm text-left"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                }}
              >
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  Wichtiger Hinweis:
                </p>
                <p className="mt-1 text-slate-600 dark:text-slate-400">
                  Ihre Anfrage ist noch keine verbindliche Terminbestätigung.
                  Die Praxis prüft Verfügbarkeit und Eignung und meldet sich
                  bei Ihnen.
                </p>
              </div>
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

  // ── Formular ─────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <header
        className="border-b px-4 py-3"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-surface)",
        }}
      >
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
              Füllen Sie das Formular aus – die Praxis meldet sich per E-Mail.
            </p>
          </div>
        </div>

        {/* Market-Scope-Hinweis (ausgewählte Märkte) */}
        <p className="mt-4 rounded-lg border px-4 py-2.5 text-xs text-slate-600 dark:text-slate-400" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface-2)" }}>
          {getMarketScope(locale).bookingNotice}
        </p>

        {/* Hinweis-Banner */}
        <div
          className="mt-6 rounded-xl border p-4 text-sm"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-surface)",
          }}
        >
          <p className="font-medium text-slate-700 dark:text-slate-300">
            Wie funktioniert es?
          </p>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            1. Füllen Sie das Formular aus und senden Sie Ihre Anfrage ab.
            <br />
            2. Die Anfrage wird anhand der aktuellen Praxiseinstellungen geprüft. Ist ein freier Slot verfügbar und hat die Praxis automatische Bestätigung aktiviert, erhalten Sie sofort eine Bestätigung per E-Mail. Andernfalls bearbeitet die Praxis Ihre Anfrage manuell.
            <br />
            3. Sie erhalten eine Rückmeldung per E-Mail.
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Diese Anfrage ist noch keine verbindliche Terminbestätigung.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* Praxis-ID – wird für Auto-Confirm-Zuordnung benötigt */}
          {practiceId && (
            <input type="hidden" name="tenant_id" value={practiceId} />
          )}

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

          {/* ── Zeitfenster-Auswahl (oder Freitext-Fallback) ─────────────── */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {showSlotSelector ? (
                <>
                  Zeitfenster auswählen <span className="text-red-500">*</span>
                </>
              ) : (
                <>
                  Gewünschter Zeitraum <span className="text-red-500">*</span>
                </>
              )}
            </label>

            {slotsLoading ? (
              /* Lade-Indikator */
              <div className="mt-1 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-slate-400"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-500" />
                Verfügbare Zeitfenster werden geladen…
              </div>
            ) : showSlotSelector ? (
              /* Slot-Selector */
              <>
                <select
                  data-testid="slot-selector"
                  value={selectedSlotKey}
                  onChange={(e) => setSelectedSlotKey(e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "var(--color-surface)",
                    color: selectedSlotKey === PLACEHOLDER_SLOT
                      ? "var(--color-text-muted, #94a3b8)"
                      : "var(--color-text)",
                  }}
                  aria-label="Zeitfenster auswählen"
                >
                  <option value={PLACEHOLDER_SLOT} disabled>
                    — Bitte einen freien Slot auswählen —
                  </option>
                  {slots.map((slot) => (
                    <option
                      key={`${slot.date}T${slot.time}`}
                      value={`${slot.date}T${slot.time}`}
                    >
                      {slot.label}
                    </option>
                  ))}
                </select>

                {/* Hidden inputs mit Slot-Daten für Server Action */}
                <input
                  type="hidden"
                  name="preferred_time"
                  value={selectedSlot?.label ?? ""}
                />
                <input
                  type="hidden"
                  name="requested_date"
                  value={selectedSlot?.date ?? ""}
                />
                <input
                  type="hidden"
                  name="requested_time"
                  value={selectedSlot?.time ?? ""}
                />
              </>
            ) : (
              /* Freitext-Fallback wenn keine Slots konfiguriert */
              <>
                {slotsMessage && (
                  <div className="mt-1 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-400">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{slotsMessage}</span>
                  </div>
                )}
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
                {/* Keine Slot-Daten → leer */}
                <input type="hidden" name="requested_date" value="" />
                <input type="hidden" name="requested_time" value="" />
              </>
            )}
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
          <div
            className="flex items-start gap-3 rounded-xl border p-4"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-surface)",
            }}
          >
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
              Bearbeitung der Terminanfrage verarbeitet werden. Meine Anfrage
              ist noch keine verbindliche Terminbestätigung.{" "}
              <span className="text-red-500">*</span>
            </label>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
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
