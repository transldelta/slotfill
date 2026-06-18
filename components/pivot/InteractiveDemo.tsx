"use client";

import { useState } from "react";
import { getPivot, MOCK_ROWS, DEMO_WALKINS, PIVOT_COLORS } from "@/lib/pivot-content";

/**
 * Interactive, client-only clinic board demo.
 * State lives purely in React (useState) and disappears on reload — no storage,
 * no localStorage, no API, no DB. Only anonymized sample tokens are used
 * (Appointment #, Walk-in #, Queue #, Room N, Doctor A, status labels, times).
 * No patient names, no diagnosis, no contact data, no payments.
 */

type DemoState = "completed" | "inProgress" | "waiting" | "available";
type Row = { id: string; time: string; room: string; kind: string; state: DemoState };
type Tab = "today" | "walkins" | "slots" | "rooms";

const SEED: Row[] = MOCK_ROWS.map((r) => ({ ...r }));
const ROOMS = ["Room 1 · Doctor A", "Room 2 · Doctor B", "Room 3 · General visit"];

export function InteractiveDemo({ locale, compact = false }: { locale: string; compact?: boolean }) {
  const d = getPivot(locale);
  const m = d.mockup;
  const t = d.demo.tabs;
  const a = d.demo.actions;

  const [rows, setRows] = useState<Row[]>(SEED);
  const [tab, setTab] = useState<Tab>("today");
  const [walkInIdx, setWalkInIdx] = useState(0);

  const stateLabel: Record<DemoState, { label: string; color: string; bg: string }> = {
    completed: { label: m.completed, color: PIVOT_COLORS.tealDark, bg: PIVOT_COLORS.tealTint },
    inProgress: { label: m.inProgress, color: "#9A6B00", bg: "#FEF3C7" },
    waiting: { label: m.waiting, color: "#475569", bg: "#E2E8F0" },
    available: { label: m.available, color: "#0369A1", bg: "#E0F2FE" },
  };

  const addWalkIn = () => {
    if (walkInIdx >= DEMO_WALKINS.length) return;
    setRows((r) => [...r, { ...DEMO_WALKINS[walkInIdx] }]);
    setWalkInIdx((i) => i + 1);
    setTab("walkins");
  };
  const markCompleted = () => {
    setRows((r) => {
      const i = r.findIndex((x) => x.state !== "completed");
      if (i === -1) return r;
      const next = r.slice();
      next[i] = { ...next[i], state: "completed" };
      return next;
    });
  };
  const showOpenSlots = () => setTab("slots");
  const reset = () => {
    setRows(SEED.map((r) => ({ ...r })));
    setWalkInIdx(0);
    setTab("today");
  };

  const visibleRows =
    tab === "today" ? rows
    : tab === "walkins" ? rows.filter((r) => r.id.startsWith("Walk-in") || r.state === "waiting")
    : tab === "slots" ? rows.filter((r) => r.state === "available")
    : rows;

  const counts = {
    appointments: rows.filter((r) => r.id.startsWith("Appointment")).length,
    walkins: rows.filter((r) => r.id.startsWith("Walk-in") || r.state === "waiting").length,
    slots: rows.filter((r) => r.state === "available").length,
    rooms: ROOMS.length,
  };

  const tabs: { key: Tab; label: string; n: number }[] = [
    { key: "today", label: t.todayBoard, n: rows.length },
    { key: "walkins", label: t.walkInQueue, n: counts.walkins },
    { key: "slots", label: t.openSlots, n: counts.slots },
    { key: "rooms", label: t.rooms, n: counts.rooms },
  ];

  return (
    <div className="overflow-hidden rounded-3xl border bg-white shadow-2xl shadow-teal-900/15" style={{ borderColor: PIVOT_COLORS.line }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4" style={{ background: `linear-gradient(120deg, ${PIVOT_COLORS.tealDeep}, ${PIVOT_COLORS.tealDark})` }}>
        <div>
          <p className="text-[14px] font-bold text-white">{m.todayBoard}</p>
          <p className="text-[11px]" style={{ color: PIVOT_COLORS.tealSoft }}>{d.demo.safeNote}</p>
        </div>
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIVOT_COLORS.tealSoft }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.45)" }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.25)" }} />
        </div>
      </div>

      <div className="p-5">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2" role="tablist" aria-label={m.todayBoard}>
          {tabs.map((tb) => {
            const active = tab === tb.key;
            return (
              <button
                key={tb.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(tb.key)}
                className="rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition"
                style={active ? { backgroundColor: PIVOT_COLORS.teal, color: "#fff" } : { backgroundColor: PIVOT_COLORS.bg, color: PIVOT_COLORS.slate }}
              >
                {tb.label} <span className="opacity-70">· {tb.n}</span>
              </button>
            );
          })}
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-4 gap-3">
          {[
            { k: m.appointments, v: counts.appointments },
            { k: m.walkInQueue, v: counts.walkins },
            { k: m.availableSlots, v: counts.slots },
            { k: m.rooms, v: counts.rooms },
          ].map((s) => (
            <div key={s.k} className="rounded-xl border px-3 py-3" style={{ borderColor: PIVOT_COLORS.line, backgroundColor: PIVOT_COLORS.bg }}>
              <p className="text-[24px] font-extrabold leading-none tabular-nums" style={{ color: PIVOT_COLORS.teal }}>{s.v}</p>
              <p className="mt-1.5 text-[11px] leading-tight" style={{ color: PIVOT_COLORS.slate }}>{s.k}</p>
            </div>
          ))}
        </div>

        {/* Board body */}
        <div className="mt-4 rounded-2xl border" style={{ borderColor: PIVOT_COLORS.line }}>
          <div className="border-b px-4 py-2.5 text-[11.5px] font-semibold uppercase tracking-wide" style={{ borderColor: PIVOT_COLORS.line, color: PIVOT_COLORS.slate }}>
            {tabs.find((x) => x.key === tab)?.label}
          </div>

          {tab === "rooms" ? (
            <div className="space-y-2 p-3">
              {ROOMS.map((x) => (
                <div key={x} className="flex items-center justify-between rounded-lg px-3 py-2.5 text-[12.5px]" style={{ backgroundColor: PIVOT_COLORS.bg, color: PIVOT_COLORS.ink }}>
                  <span>{x}</span>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: PIVOT_COLORS.teal }} aria-hidden />
                </div>
              ))}
            </div>
          ) : visibleRows.length === 0 ? (
            <p className="px-4 py-6 text-center text-[12.5px]" style={{ color: PIVOT_COLORS.slate }}>—</p>
          ) : (
            <ul>
              {visibleRows.map((r, i) => {
                const st = stateLabel[r.state];
                const shown = tab === "slots" ? "Slot open" : r.id;
                return (
                  <li key={`${r.id}-${i}`} className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0" style={{ borderColor: PIVOT_COLORS.line }}>
                    <span className="w-12 text-[13px] font-bold tabular-nums" style={{ color: PIVOT_COLORS.tealDark }}>{r.time}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-semibold" style={{ color: PIVOT_COLORS.ink }}>{shown}</p>
                      <p className="text-[11.5px]" style={{ color: PIVOT_COLORS.slate }}>{r.room} · {r.kind}</p>
                    </div>
                    <span className="rounded-lg px-2.5 py-1 text-[10.5px] font-semibold" style={{ color: st.color, backgroundColor: st.bg }}>{st.label}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={addWalkIn} disabled={walkInIdx >= DEMO_WALKINS.length} className="rounded-lg px-3.5 py-2 text-[12.5px] font-semibold text-white transition disabled:opacity-40" style={{ backgroundColor: PIVOT_COLORS.teal }}>
            + {a.addWalkIn}
          </button>
          <button type="button" onClick={markCompleted} className="rounded-lg border px-3.5 py-2 text-[12.5px] font-semibold transition" style={{ borderColor: PIVOT_COLORS.teal, color: PIVOT_COLORS.tealDark }}>
            ✓ {a.markCompleted}
          </button>
          <button type="button" onClick={showOpenSlots} className="rounded-lg border px-3.5 py-2 text-[12.5px] font-semibold transition" style={{ borderColor: PIVOT_COLORS.line, color: PIVOT_COLORS.ink }}>
            {a.showOpenSlots}
          </button>
          <button type="button" onClick={reset} className="rounded-lg px-3.5 py-2 text-[12.5px] font-semibold transition" style={{ backgroundColor: PIVOT_COLORS.bg, color: PIVOT_COLORS.slate }}>
            {a.reset}
          </button>
        </div>

        {!compact && (
          <p className="mt-4 text-[12px] leading-relaxed" style={{ color: PIVOT_COLORS.slate }}>{d.demo.safeNote}</p>
        )}
      </div>
    </div>
  );
}
