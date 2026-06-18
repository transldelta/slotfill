import { getPivot, MOCK_ROWS, PIVOT_COLORS } from "@/lib/pivot-content";

/**
 * Anonymized clinic-scheduling dashboard mockup (static, no data, no PII).
 * Uses only generic tokens: Appointment #, Walk-in #, Room N, status labels.
 * No patient names, no diagnosis, no contact data, no payments.
 */
export function DashboardMockup({ locale }: { locale: string }) {
  const d = getPivot(locale);
  const m = d.mockup;
  const stateLabel: Record<string, { label: string; color: string; bg: string }> = {
    completed: { label: m.completed, color: PIVOT_COLORS.tealDark, bg: PIVOT_COLORS.tealTint },
    inProgress: { label: m.inProgress, color: "#9A6B00", bg: "#FEF3C7" },
    waiting: { label: m.waiting, color: "#475569", bg: "#E2E8F0" },
    available: { label: m.available, color: "#0369A1", bg: "#E0F2FE" },
  };

  return (
    <div className="rounded-2xl border bg-white p-3 shadow-2xl shadow-teal-900/10 sm:p-4" style={{ borderColor: PIVOT_COLORS.line }}>
      {/* Top bar */}
      <div className="mb-3 flex items-center justify-between rounded-xl px-3 py-2" style={{ backgroundColor: PIVOT_COLORS.tealDeep }}>
        <span className="text-[12.5px] font-semibold text-white">{m.todayBoard}</span>
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIVOT_COLORS.tealSoft }} aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.35)" }} aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} aria-hidden />
        </div>
      </div>

      {/* Stats */}
      <div className="mb-3 grid grid-cols-4 gap-2">
        {[
          { k: m.appointments, v: "24" },
          { k: m.walkInQueue, v: "7" },
          { k: m.availableSlots, v: "12" },
          { k: m.rooms, v: "3" },
        ].map((s) => (
          <div key={s.k} className="rounded-lg border px-2.5 py-2" style={{ borderColor: PIVOT_COLORS.line, backgroundColor: PIVOT_COLORS.bg }}>
            <p className="text-[16px] font-bold leading-none" style={{ color: PIVOT_COLORS.teal }}>{s.v}</p>
            <p className="mt-1 text-[9.5px] leading-tight" style={{ color: PIVOT_COLORS.slate }}>{s.k}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.6fr_1fr]">
        {/* Appointments list */}
        <div className="rounded-xl border" style={{ borderColor: PIVOT_COLORS.line }}>
          <div className="border-b px-3 py-2 text-[11px] font-semibold uppercase tracking-wide" style={{ borderColor: PIVOT_COLORS.line, color: PIVOT_COLORS.slate }}>
            {m.appointments} · {m.walkInQueue}
          </div>
          <ul>
            {MOCK_ROWS.map((r) => {
              const st = stateLabel[r.state];
              return (
                <li key={r.id} className="flex items-center gap-3 border-b px-3 py-2.5 last:border-b-0" style={{ borderColor: PIVOT_COLORS.line }}>
                  <span className="w-10 text-[11.5px] font-semibold tabular-nums" style={{ color: PIVOT_COLORS.ink }}>{r.time}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium" style={{ color: PIVOT_COLORS.ink }}>{r.id}</p>
                    <p className="text-[10.5px]" style={{ color: PIVOT_COLORS.slate }}>{r.room} · {r.kind}</p>
                  </div>
                  <span className="rounded-md px-2 py-0.5 text-[9.5px] font-semibold" style={{ color: st.color, backgroundColor: st.bg }}>{st.label}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Rooms / services + quick actions */}
        <div className="space-y-3">
          <div className="rounded-xl border p-3" style={{ borderColor: PIVOT_COLORS.line }}>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: PIVOT_COLORS.slate }}>{m.rooms} · {m.services}</p>
            <div className="space-y-1.5">
              {["Room 1 · Doctor A", "Room 2 · Doctor B", "Room 3 · General visit"].map((x) => (
                <div key={x} className="flex items-center justify-between rounded-md px-2 py-1.5 text-[11px]" style={{ backgroundColor: PIVOT_COLORS.bg, color: PIVOT_COLORS.ink }}>
                  <span>{x}</span>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: PIVOT_COLORS.teal }} aria-hidden />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl p-3" style={{ backgroundColor: PIVOT_COLORS.tealTint }}>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: PIVOT_COLORS.tealDark }}>{m.quickActions}</p>
            <div className="flex flex-wrap gap-1.5">
              {[m.appointments, m.walkInQueue, m.availableSlots].map((q) => (
                <span key={q} className="rounded-md bg-white px-2 py-1 text-[10.5px] font-medium" style={{ color: PIVOT_COLORS.tealDark }}>+ {q}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
