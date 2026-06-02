"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CalendarClock, CheckCircle2, Calendar } from "lucide-react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { SlotFillLogo } from "@/components/ui/SlotFillLogo";
import { submitBookingRequest } from "@/app/termin-buchen/actions";

type BookingSlot = { time: string; available: boolean };

export default function TerminBuchenPage() {
  const params = useParams();
  const locale = (params.locale as string) ?? "de";

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [autoConfirmed, setAutoConfirmed] = useState(false);
  const [confirmedDate, setConfirmedDate] = useState<string | null>(null);
  const [confirmedTime, setConfirmedTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Slot-Auswahl State (optional – nur wenn practice_id verfügbar)
  const [tenantId] = useState<string | null>(null); // könnte per URL-Parameter kommen
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<BookingSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [useSlotSelection, setUseSlotSelection] = useState(false);

  // Heute als Minimum-Datum
  const today = new Date().toISOString().slice(0, 10);

  // Slots laden, wenn Datum gewählt und practice_id bekannt
  useEffect(() => {
    if (!tenantId || !selectedDate || !useSlotSelection) {
      setAvailableSlots([]);
      setSelectedTime("");
      return;
    }

    setSlotsLoading(true);
    fetch(`/api/booking-slots?practice_id=${tenantId}&date=${selectedDate}`)
      .then((r) => r.json())
      .then((d) => {
        setAvailableSlots(d.slots ?? []);
        setSelectedTime("");
      })
      .catch(() => setAvailableSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [tenantId, selectedDate, useSlotSelection]);

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

    // Slot-Felder hinzufügen wenn ausgewählt
    if (useSlotSelection && selectedDate) fd.set("requested_date", selectedDate);
    if (useSlotSelection && selectedTime) fd.set("requested_time", selectedTime);
    if (tenantId) fd.set("tenant_id", tenantId);

    const result = await submitBookingRequest(fd);
    setLoading(false);

    if (
      result.code === "BOOKING_SAVED" ||
      result.code === "BOOKING_SAVED_AUTO_CONFIRMED"
    ) {
      if (result.code === "BOOKING_SAVED_AUTO_CONFIRMED") {
        setAutoConfirmed(true);
        setConfirmedDate(result.confirmedDate);
        setConfirmedTime(result.confirmedTime);
      }
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
          <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {autoConfirmed ? "Termin bestätigt!" : "Anfrage übermittelt!"}
          </h1>

          {autoConfirmed && confirmedDate && confirmedTime ? (
            <>
              <p className="mt-3 text-slate-600 dark:text-slate-400">
                Ihr Termin wurde automatisch bestätigt. Sie erhalten eine
                Bestätigungs-E-Mail.
              </p>
              <div
                className="mt-6 rounded-xl border p-4 text-sm text-left"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                }}
              >
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  Ihr bestätigter Termin:
                </p>
                <p className="mt-1 text-lg font-bold text-green-700 dark:text-green-400">
                  {new Date(confirmedDate + "T" + confirmedTime).toLocaleDateString(
                    "de-DE",
                    { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" },
                  )}{" "}
                  um {confirmedTime} Uhr
                </p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Hinweis: Diese Bestätigung ersetzt keine ärztliche Beratung.
                  Die Praxis kontaktiert Sie bei Bedarf.
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="mt-3 text-slate-600 dark:text-slate-400">
                Ihre Anfrage wurde übermittelt. Die Praxis bestätigt den Termin
                manuell. Sie erhalten eine Rückmeldung sobald Ihre Anfrage
                geprüft wurde.
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
              {tenantId
                ? "Wählen Sie optional einen Wunsch-Termin."
                : "Ihre Anfrage wird manuell durch die Praxis geprüft."}
            </p>
          </div>
        </div>

        {/* Info-Banner */}
        <div
          className="mt-6 rounded-xl border p-4 text-sm"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-surface)",
          }}
        >
          <p className="font-medium text-slate-700 dark:text-slate-300">
            🗓 Wie funktioniert es?
          </p>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            1. Füllen Sie das Formular aus und senden Sie Ihre Anfrage ab.
            <br />
            2. Die Praxis prüft die Anfrage und bestätigt den Termin.
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

          {/* Gewünschter Zeitraum (immer Pflicht als Text) */}
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

          {/* Optionale Slot-Auswahl (nur wenn practice_id und Verfügbarkeit gepflegt) */}
          {tenantId && (
            <div
              className="rounded-xl border p-4"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Calendar
                  className="h-4 w-4"
                  style={{ color: "var(--color-primary)" }}
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Konkreten Wunsch-Termin wählen (optional)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setUseSlotSelection(!useSlotSelection);
                    setSelectedDate("");
                    setSelectedTime("");
                    setAvailableSlots([]);
                  }}
                  className="ml-auto text-xs text-blue-600 hover:underline dark:text-blue-400"
                >
                  {useSlotSelection ? "Ausblenden" : "Anzeigen"}
                </button>
              </div>

              {useSlotSelection && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                      Datum
                    </label>
                    <input
                      type="date"
                      min={today}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
                      style={{
                        borderColor: "var(--color-border)",
                        backgroundColor: "var(--color-surface)",
                        color: "var(--color-text)",
                      }}
                    />
                  </div>

                  {selectedDate && (
                    <div>
                      <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                        Uhrzeit{" "}
                        {slotsLoading && (
                          <span className="text-slate-400">(wird geladen…)</span>
                        )}
                      </label>
                      {availableSlots.length === 0 && !slotsLoading ? (
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          Keine freien Slots für dieses Datum. Die Praxis prüft
                          Ihre Anfrage manuell.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {availableSlots
                            .filter((s) => s.available)
                            .map((s) => (
                              <button
                                key={s.time}
                                type="button"
                                onClick={() => setSelectedTime(s.time)}
                                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                                  selectedTime === s.time
                                    ? "border-blue-600 bg-blue-600 text-white"
                                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                }`}
                              >
                                {s.time}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedDate && selectedTime && (
                    <p className="text-xs text-green-700 dark:text-green-400">
                      Gewählter Wunsch-Termin:{" "}
                      <strong>
                        {new Date(
                          selectedDate + "T" + selectedTime,
                        ).toLocaleDateString("de-DE", {
                          weekday: "long",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}{" "}
                        um {selectedTime} Uhr
                      </strong>
                      <br />
                      <span className="text-slate-500">
                        Noch keine verbindliche Bestätigung.
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

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
            disabled={loading}
            className="btn-brand w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Wird gesendet…" : "Anfrage absenden"}
          </button>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            {tenantId && useSlotSelection && selectedDate && selectedTime
              ? "Bei freiem Slot wird Ihre Anfrage automatisch bestätigt."
              : "Keine automatische Bestätigung. Die Praxis prüft Ihre Anfrage manuell."}
          </p>
        </form>
      </main>
    </div>
  );
}
