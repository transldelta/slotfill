"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CalendarCheck,
  CheckCircle,
  Clock,
  Mail,
  MailCheck,
  MailX,
  MessageSquare,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getBookingStatusLabel,
  getBookingStatusColor,
  getBookingTimeDisplay,
} from "@/lib/booking-requests";
import { getEmailStatusLabel, getEmailStatusColor } from "@/lib/booking-email-client";
import type { BookingStatus } from "@/lib/booking-requests";
import type { BookingEmailStatus } from "@/lib/booking-email-client";

// ─── Typen ─────────────────────────────────────────────────────────────────

type BookingEntry = {
  id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string | null;
  preferred_time: string;
  note: string | null;
  status: BookingStatus;
  auto_confirmed: boolean;
  internal_note: string | null;
  created_at: string;
  // Slot-Felder (aus Migration 023)
  requested_date: string | null;
  requested_time: string | null;
  confirmed_date: string | null;
  confirmed_time: string | null;
};

const FILTER_OPTIONS = [
  { value: "all", label: "Alle" },
  { value: "pending", label: "Ausstehend" },
  { value: "confirmed", label: "Bestätigt" },
  { value: "declined", label: "Abgelehnt" },
  { value: "cancelled", label: "Abgesagt" },
];

/** E-Mail-Status nach Admin-Aktion */
type EmailResult = {
  status: BookingEmailStatus;
  code: string;
};

// ─── Seite ─────────────────────────────────────────────────────────────────

export default function AdminBookingRequestsPage() {
  const [items, setItems] = useState<BookingEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Interne Notiz
  const [noteId, setNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  // "Mit Termin bestätigen" Picker
  const [confirmWithDateId, setConfirmWithDateId] = useState<string | null>(null);
  const [confirmDate, setConfirmDate] = useState("");
  const [confirmTime, setConfirmTime] = useState("");

  const [emailResults, setEmailResults] = useState<Record<string, EmailResult>>({});
  const [emailEnabled, setEmailEnabled] = useState<boolean | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/booking-requests?filter=${filter}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      setItems(data.requests ?? []);
      setTotal(data.total ?? 0);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function doAction(
    id: string,
    action: string,
    extra?: Record<string, string>,
  ) {
    setActionLoading(id + action);
    const res = await fetch("/api/admin/booking-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, ...extra }),
    });
    const data = await res.json();
    setActionLoading(null);
    if (!res.ok) {
      toast.error(data.message ?? data.code ?? "Fehler");
      return;
    }

    if (data.email_status) {
      setEmailResults((prev) => ({
        ...prev,
        [id]: {
          status: data.email_status as BookingEmailStatus,
          code: data.email_code ?? "",
        },
      }));
      if (data.email_notifications_enabled !== undefined) {
        setEmailEnabled(data.email_notifications_enabled);
      }
    }

    toast.success("Status aktualisiert");
    setNoteId(null);
    setNoteText("");
    setConfirmWithDateId(null);
    setConfirmDate("");
    setConfirmTime("");
    load();
  }

  async function handleConfirmWithDatetime(id: string) {
    if (!confirmDate || !confirmTime) {
      toast.error("Bitte Datum und Uhrzeit auswählen.");
      return;
    }
    await doAction(id, "confirm_with_datetime", {
      confirmed_date: confirmDate,
      confirmed_time: confirmTime,
    });
  }

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Buchungsanfragen
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {total} Anfragen · Keine automatische Bestätigung ohne Konfiguration
          </p>
        </div>
      </div>

      {/* E-Mail-Status Banner */}
      {emailEnabled === true ? (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-xs text-green-800 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-300">
          <MailCheck className="h-4 w-4 shrink-0" />
          <span>
            <strong>E-Mail-Benachrichtigungen aktiv:</strong> Patienten erhalten
            nach Bestätigung oder Ablehnung automatisch eine transaktionale
            E-Mail.
          </span>
        </div>
      ) : emailEnabled === false ? (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-300">
          <MailX className="h-4 w-4 shrink-0" />
          <span>
            <strong>E-Mail-Benachrichtigungen deaktiviert:</strong> Patienten
            erhalten keine automatischen E-Mails. Setze{" "}
            <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/30">
              BOOKING_EMAIL_NOTIFICATIONS_ENABLED=true
            </code>{" "}
            um E-Mails zu aktivieren.
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-300">
          <Mail className="h-4 w-4 shrink-0" />
          <span>
            <strong>Kommunikationshinweis:</strong> Keine automatische
            Benachrichtigung an Patienten. Nach Bestätigung/Ablehnung erscheint
            der E-Mail-Status im nächsten Aktionsschritt.
          </span>
        </div>
      )}

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              filter === opt.value
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-500">Lädt…</div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500 dark:border-slate-700">
          Keine Anfragen gefunden.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const timeDisplay = getBookingTimeDisplay(item);
            const hasConcreteSlot = !!(item.requested_date || item.confirmed_date);

            return (
              <div
                key={item.id}
                className="rounded-xl border p-5"
                style={{
                  borderColor:
                    item.status === "confirmed"
                      ? "#86efac"
                      : item.status === "declined"
                        ? "#fca5a5"
                        : "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {/* Status + Zeitstempel */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-semibold ${getBookingStatusColor(item.status)}`}
                      >
                        {getBookingStatusLabel(item.status)}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(item.created_at).toLocaleDateString("de-DE", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Patient-Info */}
                    <div className="mt-2 space-y-0.5 text-sm text-slate-700 dark:text-slate-300">
                      <p>
                        <strong>Name:</strong> {item.patient_name}
                      </p>
                      <p>
                        <strong>E-Mail:</strong> {item.patient_email}
                      </p>
                      {item.patient_phone && (
                        <p>
                          <strong>Telefon:</strong> {item.patient_phone}
                        </p>
                      )}

                      {/* Datum / Uhrzeit – strukturiert anzeigen */}
                      {item.confirmed_date && item.confirmed_time ? (
                        <p>
                          <strong>Bestätigter Termin:</strong>{" "}
                          <span className="font-semibold text-green-700 dark:text-green-400">
                            {timeDisplay.label}
                          </span>
                        </p>
                      ) : item.requested_date && item.requested_time ? (
                        <>
                          <p data-testid="requested-date">
                            <strong>Angefragtes Datum:</strong>{" "}
                            {new Date(
                              item.requested_date + "T00:00:00",
                            ).toLocaleDateString("de-DE", {
                              weekday: "short",
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            })}
                          </p>
                          <p data-testid="requested-time">
                            <strong>Angefragte Uhrzeit:</strong>{" "}
                            {item.requested_time} Uhr
                          </p>
                        </>
                      ) : (
                        <p>
                          <strong>Zeitraum:</strong>{" "}
                          {timeDisplay.isManual ? (
                            <span
                              data-testid="manual-time-display"
                              className="text-slate-500 dark:text-slate-400"
                            >
                              {timeDisplay.label}
                            </span>
                          ) : (
                            timeDisplay.label
                          )}
                        </p>
                      )}

                      {item.note && (
                        <p className="text-slate-600 dark:text-slate-400">
                          <strong>Anliegen:</strong> {item.note}
                        </p>
                      )}
                    </div>

                    {/* Interne Notiz */}
                    {item.internal_note && (
                      <div className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:bg-blue-900/10 dark:text-blue-300">
                        📝 Interne Notiz: {item.internal_note}
                      </div>
                    )}

                    {/* E-Mail-Status Badge */}
                    {emailResults[item.id] && (
                      <div
                        className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${getEmailStatusColor(emailResults[item.id].status)}`}
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {getEmailStatusLabel(emailResults[item.id].status)}
                      </div>
                    )}
                  </div>

                  {/* Aktions-Buttons */}
                  {item.status === "pending_confirmation" && (
                    <div className="flex shrink-0 flex-col gap-2">
                      {/* Bestätigen (mit ggf. vorhandenem Slot) */}
                      <button
                        onClick={() => doAction(item.id, "confirm")}
                        disabled={!!actionLoading}
                        className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        {hasConcreteSlot ? "Slot bestätigen" : "Bestätigen"}
                      </button>

                      {/* Mit Termin bestätigen (Datum/Uhrzeit-Picker) */}
                      <button
                        onClick={() => {
                          setConfirmWithDateId(item.id);
                          // Vorausfüllen wenn requested_date vorhanden
                          setConfirmDate(item.requested_date ?? "");
                          setConfirmTime(item.requested_time ?? "");
                          setNoteId(null);
                        }}
                        disabled={!!actionLoading}
                        className="flex items-center gap-1.5 rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-xs text-green-700 hover:bg-green-100 dark:border-green-800 dark:bg-green-900/10 dark:text-green-400 disabled:opacity-50"
                      >
                        <CalendarCheck className="h-3.5 w-3.5" />
                        Mit Termin bestätigen
                      </button>

                      <button
                        onClick={() => doAction(item.id, "decline")}
                        disabled={!!actionLoading}
                        className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:border-red-900/30 disabled:opacity-50"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Ablehnen
                      </button>

                      <button
                        onClick={() => {
                          setNoteId(item.id);
                          setConfirmWithDateId(null);
                        }}
                        disabled={!!actionLoading}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 disabled:opacity-50"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-slate-400" />{" "}
                        Notiz
                      </button>
                    </div>
                  )}

                  {item.status === "confirmed" && (
                    <button
                      onClick={() => doAction(item.id, "cancel")}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50 dark:border-slate-700 disabled:opacity-50"
                    >
                      <Clock className="h-3.5 w-3.5" /> Absagen
                    </button>
                  )}
                </div>

                {/* ── "Mit Termin bestätigen" Picker ────────────────────── */}
                {confirmWithDateId === item.id && (
                  <div
                    data-testid="confirm-datetime-picker"
                    className="mt-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-900/10"
                  >
                    <p className="mb-3 text-xs font-semibold text-green-800 dark:text-green-300">
                      📅 Termin bestätigen – Datum und Uhrzeit festlegen
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <div>
                        <label className="block text-xs text-green-700 dark:text-green-400">
                          Datum
                        </label>
                        <input
                          type="date"
                          value={confirmDate}
                          onChange={(e) => setConfirmDate(e.target.value)}
                          min={new Date().toISOString().slice(0, 10)}
                          className="mt-0.5 rounded-lg border border-green-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-green-700 dark:bg-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-green-700 dark:text-green-400">
                          Uhrzeit
                        </label>
                        <input
                          type="time"
                          value={confirmTime}
                          onChange={(e) => setConfirmTime(e.target.value)}
                          className="mt-0.5 rounded-lg border border-green-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-green-700 dark:bg-slate-900"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleConfirmWithDatetime(item.id)}
                        disabled={!confirmDate || !confirmTime || !!actionLoading}
                        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Termin bestätigen
                      </button>
                      <button
                        onClick={() => {
                          setConfirmWithDateId(null);
                          setConfirmDate("");
                          setConfirmTime("");
                        }}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50 dark:border-slate-700"
                      >
                        Abbrechen
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Notiz-Eingabe ──────────────────────────────────────── */}
                {noteId === item.id && (
                  <div className="mt-3 space-y-2">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Interne Notiz"
                      rows={2}
                      maxLength={1000}
                      className="w-full rounded-lg border px-3 py-2 text-xs focus:outline-none"
                      style={{
                        borderColor: "var(--color-border)",
                        backgroundColor: "var(--color-surface)",
                      }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          doAction(
                            item.id,
                            "add_note",
                            noteText ? { internal_note: noteText } : {},
                          )
                        }
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700"
                      >
                        Notiz speichern
                      </button>
                      <button
                        onClick={() => {
                          setNoteId(null);
                          setNoteText("");
                        }}
                        className="rounded-lg border px-3 py-1.5 text-xs"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        Abbrechen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
