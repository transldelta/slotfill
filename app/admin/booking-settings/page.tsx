"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CalendarOff,
  ChevronDown,
  Clock,
  PlusCircle,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

type PracticeSettings = {
  id: string;
  name: string;
  auto_confirm_bookings: boolean;
  booking_slot_minutes: number;
  booking_buffer_minutes: number;
};

type PracticeOption = {
  id: string;
  name: string;
  email: string | null;
  status: string | null;
};

type AvailabilityRule = {
  id: string;
  practice_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  slot_minutes: number;
  buffer_minutes: number;
  is_active: boolean;
};

type BlockedTime = {
  id: string;
  practice_id: string;
  blocked_date: string;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
};

const WEEKDAY_LABELS: Record<number, string> = {
  1: "Montag",
  2: "Dienstag",
  3: "Mittwoch",
  4: "Donnerstag",
  5: "Freitag",
  6: "Samstag",
  7: "Sonntag",
};

const SLOT_OPTIONS = [15, 20, 30, 45, 60];

export default function BookingSettingsPage() {
  const [practices, setPractices] = useState<PracticeOption[]>([]);
  const [selectedPracticeId, setSelectedPracticeId] = useState<string | null>(
    null,
  );

  const [settings, setSettings] = useState<PracticeSettings | null>(null);
  const [noPractice, setNoPractice] = useState(false);
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [blocked, setBlocked] = useState<BlockedTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newRule, setNewRule] = useState({
    weekday: 1,
    start_time: "08:00",
    end_time: "18:00",
    slot_minutes: 30,
    buffer_minutes: 0,
    is_active: true,
  });

  const [newBlocked, setNewBlocked] = useState({
    blocked_date: "",
    start_time: "",
    end_time: "",
    reason: "",
  });

  // ── Alle Praxen laden (für Selector) ──────────────────────────────────────
  const loadPractices = useCallback(async () => {
    const res = await fetch(
      "/api/admin/booking-settings?resource=practices_list",
    );
    if (!res.ok) return;
    const d = await res.json();
    const list: PracticeOption[] = d.practices ?? [];
    setPractices(list);
    // Wenn noch keine Auswahl: aktive Praxis bevorzugen, sonst erste
    if (!selectedPracticeId && list.length > 0) {
      const active = list.find((p) => p.status === "active");
      setSelectedPracticeId((active ?? list[0]).id);
    }
  }, [selectedPracticeId]);

  // ── Einstellungen einer konkreten Praxis laden ─────────────────────────────
  const loadSettings = useCallback(
    async (practiceId: string) => {
      setLoading(true);
      setNoPractice(false);
      setSettings(null);
      setRules([]);
      setBlocked([]);

      const pid = `practice_id=${encodeURIComponent(practiceId)}`;

      const settRes = await fetch(
        `/api/admin/booking-settings?resource=settings&${pid}`,
      );

      if (settRes.status === 404) {
        setNoPractice(true);
        setLoading(false);
        return;
      }
      if (!settRes.ok) {
        // DB-Fehler oder unerwarteter Fehler – "keine Praxis" anzeigen
        setNoPractice(true);
        setLoading(false);
        return;
      }

      const d = await settRes.json();
      setSettings(d.settings ?? null);

      const [rulesRes, blockedRes] = await Promise.all([
        fetch(
          `/api/admin/booking-settings?resource=availability_rules&${pid}`,
        ),
        fetch(`/api/admin/booking-settings?resource=blocked_times&${pid}`),
      ]);

      if (rulesRes.ok) {
        const r = await rulesRes.json();
        setRules(r.rules ?? []);
      }
      if (blockedRes.ok) {
        const b = await blockedRes.json();
        setBlocked(b.blocked ?? []);
      }

      setLoading(false);
    },
    [],
  );

  // ── Initialer Load ─────────────────────────────────────────────────────────
  useEffect(() => {
    loadPractices();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Neu laden wenn selectedPracticeId sich ändert ─────────────────────────
  useEffect(() => {
    if (selectedPracticeId) {
      loadSettings(selectedPracticeId);
    }
  }, [selectedPracticeId, loadSettings]);

  // ── Hilfsfunktionen ────────────────────────────────────────────────────────

  function practiceIdParam(): string {
    return selectedPracticeId
      ? `practice_id=${encodeURIComponent(selectedPracticeId)}`
      : "";
  }

  async function saveSettings(patch: Partial<PracticeSettings>) {
    if (!settings) return;
    setSaving(true);
    const res = await fetch("/api/admin/booking-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_settings",
        practice_id: selectedPracticeId,
        ...patch,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSettings({ ...settings, ...patch });
      toast.success("Einstellungen gespeichert");
    } else {
      toast.error("Fehler beim Speichern");
    }
  }

  async function addRule() {
    const res = await fetch("/api/admin/booking-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upsert_rule",
        practice_id: selectedPracticeId,
        ...newRule,
      }),
    });
    if (res.ok) {
      toast.success("Regel hinzugefügt");
      if (selectedPracticeId) loadSettings(selectedPracticeId);
    } else {
      const d = await res.json();
      toast.error(d.message ?? "Fehler");
    }
  }

  async function deleteRule(id: string) {
    const res = await fetch("/api/admin/booking-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "delete_rule",
        rule_id: id,
        practice_id: selectedPracticeId,
      }),
    });
    if (res.ok) {
      toast.success("Regel gelöscht");
      if (selectedPracticeId) loadSettings(selectedPracticeId);
    } else {
      toast.error("Fehler beim Löschen");
    }
  }

  async function addBlocked() {
    if (!newBlocked.blocked_date) {
      toast.error("Datum ist erforderlich");
      return;
    }
    const res = await fetch("/api/admin/booking-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add_blocked",
        practice_id: selectedPracticeId,
        ...newBlocked,
      }),
    });
    if (res.ok) {
      toast.success("Gesperrte Zeit hinzugefügt");
      setNewBlocked({
        blocked_date: "",
        start_time: "",
        end_time: "",
        reason: "",
      });
      if (selectedPracticeId) loadSettings(selectedPracticeId);
    } else {
      toast.error("Fehler beim Speichern");
    }
  }

  async function deleteBlocked(id: string) {
    const res = await fetch("/api/admin/booking-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "delete_blocked",
        blocked_id: id,
        practice_id: selectedPracticeId,
      }),
    });
    if (res.ok) {
      toast.success("Sperre entfernt");
      if (selectedPracticeId) loadSettings(selectedPracticeId);
    } else {
      toast.error("Fehler beim Löschen");
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const pageHeader = (
    <div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
        Buchungseinstellungen
      </h1>
      <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
        Öffnungszeiten, Slot-Länge und automatische Bestätigung
      </p>
    </div>
  );

  // Praxis-Auswahlschalter (zeigt nur wenn >1 Praxis vorhanden)
  const practiceSelector =
    practices.length > 1 ? (
      <div
        className="flex items-center gap-2 rounded-xl border p-4"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-surface)",
        }}
      >
        <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
        <label
          htmlFor="practice-select"
          className="text-sm font-medium text-slate-700 dark:text-slate-300 shrink-0"
        >
          Praxis:
        </label>
        <div className="relative flex-1">
          <select
            id="practice-select"
            data-testid="practice-selector"
            value={selectedPracticeId ?? ""}
            onChange={(e) => setSelectedPracticeId(e.target.value)}
            className="w-full appearance-none rounded-lg border pl-3 pr-8 py-1.5 text-sm"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text)",
            }}
          >
            {practices.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.status === "active" ? " ✓" : ""}
                {p.email ? ` – ${p.email}` : ""}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        </div>
      </div>
    ) : null;

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        {pageHeader}
        {practiceSelector}
        <div className="py-12 text-center text-sm text-slate-500">Lädt…</div>
      </div>
    );
  }

  // ── Keine Praxis gefunden ─────────────────────────────────────────────────
  if (noPractice || !settings) {
    return (
      <div className="space-y-6 max-w-2xl">
        {pageHeader}
        {practiceSelector}
        <div
          data-testid="no-practice-message"
          className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/30 dark:bg-amber-900/10"
        >
          <Building2 className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-200">
              Keine Praxis gefunden
            </p>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
              Bitte zuerst Testpraxis / Practice-Zuordnung einrichten, bevor
              Buchungseinstellungen konfiguriert werden können.
            </p>
            <a
              href="/admin/practices"
              className="mt-3 inline-block rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
            >
              Praxen verwalten →
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Hauptansicht ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 max-w-2xl">
      {pageHeader}

      {/* Praxis-Auswahlschalter (nur wenn >1 Praxis) */}
      {practiceSelector}

      {/* Allgemeine Einstellungen */}
      <section
        className="rounded-xl border p-5 space-y-5"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-surface)",
        }}
      >
        <h2 className="font-semibold text-slate-800 dark:text-slate-200">
          Allgemein
          {settings.name && (
            <span className="ml-2 text-sm font-normal text-slate-400">
              – {settings.name}
            </span>
          )}
        </h2>

        {/* Slot-Länge */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Standard Slot-Länge (Minuten)
          </label>
          <div className="flex flex-wrap gap-2">
            {SLOT_OPTIONS.map((m) => (
              <button
                key={m}
                onClick={() => saveSettings({ booking_slot_minutes: m })}
                disabled={saving}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                  settings.booking_slot_minutes === m
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {m} min
              </button>
            ))}
          </div>
        </div>

        {/* Pufferzeit */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Pufferzeit zwischen Terminen (Minuten)
          </label>
          <input
            type="number"
            min={0}
            max={60}
            defaultValue={settings.booking_buffer_minutes}
            onBlur={(e) =>
              saveSettings({
                booking_buffer_minutes: parseInt(e.target.value, 10) || 0,
              })
            }
            className="w-28 rounded-lg border px-3 py-1.5 text-sm"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text)",
            }}
          />
        </div>

        {/* Auto-Confirm Toggle */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Automatische Bestätigung
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Bestätigt Anfragen automatisch wenn ein freier Slot verfügbar
                ist.
              </p>
            </div>
            <button
              onClick={() =>
                saveSettings({
                  auto_confirm_bookings: !settings.auto_confirm_bookings,
                })
              }
              disabled={saving}
              aria-label={
                settings.auto_confirm_bookings
                  ? "Auto-Confirm deaktivieren"
                  : "Auto-Confirm aktivieren"
              }
              className={`relative h-6 w-11 rounded-full transition-colors ${
                settings.auto_confirm_bookings
                  ? "bg-green-600"
                  : "bg-slate-300 dark:bg-slate-600"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  settings.auto_confirm_bookings
                    ? "translate-x-5"
                    : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {settings.auto_confirm_bookings && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                <strong>Wichtig:</strong> Automatische Bestätigung ist nur
                sinnvoll, wenn die Öffnungszeiten vollständig gepflegt sind.
                Bei lückenhafter Konfiguration bleiben Anfragen auf
                &bdquo;Ausstehend&ldquo;.
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Öffnungszeiten */}
      <section
        className="rounded-xl border p-5 space-y-4"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-surface)",
        }}
      >
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-500" />
          <h2 className="font-semibold text-slate-800 dark:text-slate-200">
            Öffnungszeiten
          </h2>
        </div>

        {rules.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Noch keine Öffnungszeiten gepflegt. Ohne Regeln ist kein
            Auto-Confirm möglich.
          </p>
        ) : (
          <div className="space-y-2">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${
                  rule.is_active
                    ? "border-green-200 bg-green-50 dark:border-green-900/20 dark:bg-green-900/10"
                    : "border-slate-200 bg-slate-50 opacity-50 dark:border-slate-700 dark:bg-slate-800"
                }`}
              >
                <div>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {WEEKDAY_LABELS[rule.weekday]}
                  </span>
                  <span className="ml-2 text-slate-500">
                    {rule.start_time.slice(0, 5)} – {rule.end_time.slice(0, 5)}
                  </span>
                  <span className="ml-2 text-xs text-slate-400">
                    {rule.slot_minutes} min
                    {rule.buffer_minutes > 0 &&
                      ` + ${rule.buffer_minutes} min Puffer`}
                  </span>
                </div>
                <button
                  onClick={() => deleteRule(rule.id)}
                  className="text-red-400 hover:text-red-600"
                  title="Regel löschen"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div
          className="rounded-lg border border-dashed p-4 space-y-3"
          style={{ borderColor: "var(--color-border)" }}
        >
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Neue Öffnungszeit hinzufügen
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Wochentag
              </label>
              <select
                value={newRule.weekday}
                onChange={(e) =>
                  setNewRule({
                    ...newRule,
                    weekday: parseInt(e.target.value, 10),
                  })
                }
                className="w-full rounded-lg border px-2 py-1.5 text-sm"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)",
                }}
              >
                {Object.entries(WEEKDAY_LABELS).map(([d, label]) => (
                  <option key={d} value={d}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Von</label>
              <input
                type="time"
                value={newRule.start_time}
                onChange={(e) =>
                  setNewRule({ ...newRule, start_time: e.target.value })
                }
                className="w-full rounded-lg border px-2 py-1.5 text-sm"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)",
                }}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Bis</label>
              <input
                type="time"
                value={newRule.end_time}
                onChange={(e) =>
                  setNewRule({ ...newRule, end_time: e.target.value })
                }
                className="w-full rounded-lg border px-2 py-1.5 text-sm"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)",
                }}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Slot (min)
              </label>
              <select
                value={newRule.slot_minutes}
                onChange={(e) =>
                  setNewRule({
                    ...newRule,
                    slot_minutes: parseInt(e.target.value, 10),
                  })
                }
                className="w-full rounded-lg border px-2 py-1.5 text-sm"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)",
                }}
              >
                {SLOT_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Puffer (min)
              </label>
              <input
                type="number"
                min={0}
                max={60}
                value={newRule.buffer_minutes}
                onChange={(e) =>
                  setNewRule({
                    ...newRule,
                    buffer_minutes: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full rounded-lg border px-2 py-1.5 text-sm"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)",
                }}
              />
            </div>
          </div>
          <button
            onClick={addRule}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700"
          >
            <PlusCircle className="h-3.5 w-3.5" /> Hinzufügen
          </button>
        </div>
      </section>

      {/* Gesperrte Zeiten */}
      <section
        className="rounded-xl border p-5 space-y-4"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-surface)",
        }}
      >
        <div className="flex items-center gap-2">
          <CalendarOff className="h-4 w-4 text-slate-500" />
          <h2 className="font-semibold text-slate-800 dark:text-slate-200">
            Gesperrte Zeiten
          </h2>
          <span className="text-xs text-slate-400">
            (Urlaub, Feiertage, Pausen)
          </span>
        </div>

        {blocked.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Keine zukünftigen gesperrten Zeiten.
          </p>
        ) : (
          <div className="space-y-2">
            {blocked.map((bt) => (
              <div
                key={bt.id}
                className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm dark:border-red-900/20 dark:bg-red-900/10"
              >
                <div>
                  <span className="font-medium text-red-800 dark:text-red-300">
                    {new Date(
                      bt.blocked_date + "T00:00:00",
                    ).toLocaleDateString("de-DE", {
                      weekday: "short",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                  {bt.start_time ? (
                    <span className="ml-2 text-red-600 dark:text-red-400">
                      {bt.start_time.slice(0, 5)}
                      {bt.end_time && ` – ${bt.end_time.slice(0, 5)}`}
                    </span>
                  ) : (
                    <span className="ml-2 text-xs text-red-400">
                      Ganzer Tag
                    </span>
                  )}
                  {bt.reason && (
                    <span className="ml-2 text-xs text-slate-500">
                      {bt.reason}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => deleteBlocked(bt.id)}
                  className="text-red-400 hover:text-red-600"
                  title="Sperre entfernen"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div
          className="rounded-lg border border-dashed p-4 space-y-3"
          style={{ borderColor: "var(--color-border)" }}
        >
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Neue gesperrte Zeit hinzufügen
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs text-slate-500 mb-1">
                Datum <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={newBlocked.blocked_date}
                onChange={(e) =>
                  setNewBlocked({
                    ...newBlocked,
                    blocked_date: e.target.value,
                  })
                }
                className="w-full rounded-lg border px-2 py-1.5 text-sm"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)",
                }}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">
                Von (leer = ganzer Tag)
              </label>
              <input
                type="time"
                value={newBlocked.start_time}
                onChange={(e) =>
                  setNewBlocked({ ...newBlocked, start_time: e.target.value })
                }
                className="w-full rounded-lg border px-2 py-1.5 text-sm"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)",
                }}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Bis</label>
              <input
                type="time"
                value={newBlocked.end_time}
                onChange={(e) =>
                  setNewBlocked({ ...newBlocked, end_time: e.target.value })
                }
                className="w-full rounded-lg border px-2 py-1.5 text-sm"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)",
                }}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-500 mb-1">
                Grund (optional)
              </label>
              <input
                type="text"
                maxLength={200}
                placeholder="z. B. Urlaub, Feiertag, Teamschulung"
                value={newBlocked.reason}
                onChange={(e) =>
                  setNewBlocked({ ...newBlocked, reason: e.target.value })
                }
                className="w-full rounded-lg border px-2 py-1.5 text-sm"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)",
                }}
              />
            </div>
          </div>
          <button
            onClick={addBlocked}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700"
          >
            <PlusCircle className="h-3.5 w-3.5" /> Sperre hinzufügen
          </button>
        </div>
      </section>
    </div>
  );
}
