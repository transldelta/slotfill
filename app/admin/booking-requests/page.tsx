"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Mail,
  MailX,
  MailCheck,
  Archive,
  CalendarDays,
} from "lucide-react";
import toast from "react-hot-toast";
import { getBookingStatusLabel, getBookingStatusColor } from "@/lib/booking-requests";
import { getEmailStatusLabel, getEmailStatusColor } from "@/lib/booking-email-client";
import type { BookingStatus } from "@/lib/booking-requests";
import type { BookingEmailStatus } from "@/lib/booking-email-client";

type BookingEntry = {
  id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string | null;
  preferred_time: string;
  note: string | null;
  status: BookingStatus;
  auto_confirmed: boolean;
  confirmation_mode?: string;
  internal_note: string | null;
  requested_date?: string | null;
  requested_time?: string | null;
  confirmed_date?: string | null;
  confirmed_time?: string | null;
  email_status?: string | null;
  email_sent_at?: string | null;
  archived_at?: string | null;
  created_at: string;
};

/** Letztes E-Mail-Ergebnis pro Buchungs-ID */
type EmailResult = { status: BookingEmailStatus; code: string };

const FILTER_OPTIONS = [
  { value: "all", label: "Alle" },
  { value: "pending", label: "Ausstehend" },
  { value: "confirmed", label: "Bestätigt" },
  { value: "declined", label: "Abgelehnt" },
  { value: "cancelled", label: "Abgesagt" },
  { value: "archived", label: "Archiviert" },
];

// Heute als Minimum-Datum für Slot-Bestätigung
const today = new Date().toISOString().slice(0, 10);

export default function AdminBookingRequestsPage() {
  const [items, setItems] = useState<BookingEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [noteId, setNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [emailResults, setEmailResults] = useState<Record<string, EmailResult>>({});
  const [emailEnabled, setEmailEnabled] = useState<boolean | null>(null);

  // Slot-Bestätigung State
  const [slotConfirmId, setSlotConfirmId] = useState<string | null>(null);
  const [slotDate, setSlotDate] = useState("");
  const [slotTime, setSlotTime] = useState("");

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

    // E-Mail-Status speichern (kein Secret)
    if (data.email_status) {
      setEmailResults((prev) => ({
        ...prev,
        [id]: { status: data.email_status as BookingEmailStatus, code: data.email_code ?? "" },
      }));
      if (data.email_notifications_enabled !== undefined) {
        setEmailEnabled(data.email_notifications_enabled);
      }
    }

    toast.success(
      action === "archive" ? "Archiviert" : "Status aktualisiert",
    );
    setNoteId(null);
    setNoteText("");
    setSlotConfirmId(null);
    setSlotDate("");
    setSlotTime("");
    load();
  }

  async function doSlotConfirm(id: string) {
    if (!slotDate || !slotTime) {
      toast.error("Bitte Datum und Uhrzeit wählen.");
      return;
    }
    await doAction(id, "confirm_with_slot", {
      confirmed_date: slotDate,
      confirmed_time: slotTime,
    });
  }

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
        <a
          href="/admin/booking-settings"
          className="rounded-lg border px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          ⚙ Buchungseinstellungen
        </a>
      </div>

      {/* E-Mail-Benachrichtigungs-Status Banner */}
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
            <strong>E-Mail-Benachrichtigungen deaktiviert:</strong> Setze{" "}
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
            Benachrichtigung an Patienten. Nach Bestätigung/Ablehnung erfahre
            den E-Mail-Status im nächsten Aktionsschritt.
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
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border p-5"
              style={{
                borderColor:
                  item.status === "confirmed"
                    ? "#86efac"
                    : item.status === "declined"
                      ? "#fca5a5"
                      : item.status === "archived"
                        ? "#cbd5e1"
                        : "var(--color-border)",
                backgroundColor: "var(--color-surface)",
                opacity: item.status === "archived" ? 0.7 : 1,
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Status */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`font-semibold text-sm ${getBookingStatusColor(item.status)}`}
                    >
                      {getBookingStatusLabel(item.status)}
                    </span>
                    {item.confirmation_mode === "auto" && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                        Auto-bestätigt
                      </span>
                    )}
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
                    <p>
                      <strong>Zeitraum:</strong> {item.preferred_time}
                    </p>
                    {(item.requested_date || item.requested_time) && (
                      <p className="text-blue-600 dark:text-blue-400">
                        <strong>Wunsch-Slot:</strong>{" "}
                        {item.requested_date && (
                          <>
                            {new Date(
                              item.requested_date + "T00:00:00",
                            ).toLocaleDateString("de-DE", {
                              weekday: "short",
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                            {item.requested_time && ` um ${item.requested_time} Uhr`}
                          </>
                        )}
                      </p>
                    )}
                    {item.confirmed_date && item.confirmed_time && (
                      <p className="font-semibold text-green-700 dark:text-green-400">
                        ✓ Termin:{" "}
                        {new Date(
                          item.confirmed_date + "T00:00:00",
                        ).toLocaleDateString("de-DE", {
                          weekday: "short",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}{" "}
                        um {item.confirmed_time} Uhr
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

                  {/* E-Mail-Status Badge (nach Admin-Aktion) */}
                  {(emailResults[item.id] || item.email_status) && (
                    <div
                      className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${
                        emailResults[item.id]
                          ? getEmailStatusColor(emailResults[item.id].status)
                          : item.email_status === "sent"
                            ? "text-green-600"
                            : "text-slate-400"
                      }`}
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {emailResults[item.id]
                        ? getEmailStatusLabel(emailResults[item.id].status)
                        : item.email_status === "sent"
                          ? "E-Mail gesendet"
                          : item.email_status ?? ""}
                    </div>
                  )}

                  {/* Archiviert-Badge */}
                  {item.archived_at && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                      <Archive className="h-3 w-3" />
                      Archiviert am{" "}
                      {new Date(item.archived_at).toLocaleDateString("de-DE")}
                    </div>
                  )}
                </div>

                {/* Aktionen */}
                <div className="flex shrink-0 flex-col gap-2">
                  {item.status === "pending_confirmation" && (
                    <>
                      {/* Schnell-Bestätigung (ohne konkreten Slot) */}
                      {slotConfirmId !== item.id && (
                        <button
                          onClick={() => doAction(item.id, "confirm")}
                          disabled={!!actionLoading}
                          className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Bestätigen
                        </button>
                      )}

                      {/* Mit Termin bestätigen */}
                      {slotConfirmId !== item.id ? (
                        <button
                          onClick={() => {
                            setSlotConfirmId(item.id);
                            setSlotDate(item.requested_date ?? "");
                            setSlotTime(item.requested_time ?? "");
                          }}
                          disabled={!!actionLoading}
                          className="flex items-center gap-1.5 rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-xs text-green-700 hover:bg-green-100 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-300"
                        >
                          <CalendarDays className="h-3.5 w-3.5" /> Mit Termin
                        </button>
                      ) : (
                        /* Slot-Picker inline */
                        <div className="space-y-2 rounded-lg border border-green-300 bg-green-50 p-3 dark:border-green-900/30 dark:bg-green-900/10">
                          <p className="text-xs font-medium text-green-800 dark:text-green-300">
                            Termin wählen:
                          </p>
                          <input
                            type="date"
                            min={today}
                            value={slotDate}
                            onChange={(e) => setSlotDate(e.target.value)}
                            className="w-full rounded border px-2 py-1 text-xs"
                            style={{
                              borderColor: "var(--color-border)",
                              backgroundColor: "var(--color-surface)",
                              color: "var(--color-text)",
                            }}
                          />
                          <input
                            type="time"
                            value={slotTime}
                            onChange={(e) => setSlotTime(e.target.value)}
                            className="w-full rounded border px-2 py-1 text-xs"
                            style={{
                              borderColor: "var(--color-border)",
                              backgroundColor: "var(--color-surface)",
                              color: "var(--color-text)",
                            }}
                          />
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => doSlotConfirm(item.id)}
                              disabled={!!actionLoading || !slotDate || !slotTime}
                              className="flex-1 rounded-lg bg-green-600 px-2 py-1.5 text-xs text-white disabled:opacity-50 hover:bg-green-700"
                            >
                              Mit Termin bestätigen
                            </button>
                            <button
                              onClick={() => {
                                setSlotConfirmId(null);
                                setSlotDate("");
                                setSlotTime("");
                              }}
                              className="rounded-lg border px-2 py-1.5 text-xs"
                              style={{ borderColor: "var(--color-border)" }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => doAction(item.id, "decline")}
                        disabled={!!actionLoading}
                        className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:border-red-900/30"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Ablehnen
                      </button>
                      <button
                        onClick={() => setNoteId(item.id)}
                        disabled={!!actionLoading}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-slate-400" />{" "}
                        Notiz
                      </button>
                    </>
                  )}

                  {item.status === "confirmed" && (
                    <button
                      onClick={() => doAction(item.id, "cancel")}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50 dark:border-slate-700"
                    >
                      <Clock className="h-3.5 w-3.5" /> Absagen
                    </button>
                  )}

                  {/* Archivieren (Soft-Delete, keine E-Mail) */}
                  {item.status !== "archived" && (
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Buchungsanfrage archivieren? Keine E-Mail wird gesendet.",
                          )
                        ) {
                          doAction(item.id, "archive");
                        }
                      }}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-50 dark:border-slate-700"
                    >
                      <Archive className="h-3.5 w-3.5" /> Archivieren
                    </button>
                  )}
                </div>
              </div>

              {/* Notiz-Eingabe */}
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
          ))}
        </div>
      )}
    </div>
  );
}
