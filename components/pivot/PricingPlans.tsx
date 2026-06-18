"use client";

import { useState } from "react";
import { getPivot, PIVOT_COLORS } from "@/lib/pivot-content";

/**
 * Money logic: monthly plan cards. Each plan button is a real action — it
 * selects the plan and shows a visible "Pilot request: <plan>" confirmation
 * plus a mailto link pre-filled with that plan. No payment, no checkout, no
 * storage — the selection lives only in local React state.
 */
export function PricingPlans({ locale, email }: { locale: string; email: string }) {
  const d = getPivot(locale);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {d.money.plans.map((p, i) => {
          const featured = i === 1;
          const active = selected === p.name;
          return (
            <div
              key={p.name}
              className="flex flex-col rounded-2xl border p-7"
              style={{
                borderColor: featured || active ? PIVOT_COLORS.teal : PIVOT_COLORS.line,
                borderWidth: featured || active ? 2 : 1,
                backgroundColor: featured ? PIVOT_COLORS.bg : PIVOT_COLORS.surface,
              }}
            >
              <p className="text-[13px] font-bold uppercase tracking-[0.12em]" style={{ color: PIVOT_COLORS.tealDark }}>{p.name}</p>
              <p className="mt-3 text-[22px] font-extrabold leading-tight" style={{ color: PIVOT_COLORS.ink }}>{p.price}</p>
              <p className="mt-3 flex-1 text-[14px] leading-relaxed" style={{ color: PIVOT_COLORS.slate }}>{p.for}</p>
              <button
                type="button"
                onClick={() => setSelected(p.name)}
                className="mt-6 rounded-xl px-5 py-3 text-[14px] font-semibold transition"
                style={featured ? { backgroundColor: PIVOT_COLORS.teal, color: "#fff" } : { border: `1px solid ${PIVOT_COLORS.teal}`, color: PIVOT_COLORS.tealDark }}
              >
                {d.money.cta}
              </button>
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="mt-5 flex flex-col gap-2 rounded-xl border px-5 py-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: PIVOT_COLORS.teal, backgroundColor: PIVOT_COLORS.tealTint }}>
          <p className="text-[14px] font-semibold" style={{ color: PIVOT_COLORS.tealDeep }}>
            {d.access.pilotRequest} {selected}
          </p>
          <a
            href={`mailto:${email}?subject=${encodeURIComponent(`ClinicSlotHub pilot access — ${selected}`)}`}
            className="inline-block rounded-lg px-4 py-2 text-[13px] font-semibold text-white"
            style={{ backgroundColor: PIVOT_COLORS.teal }}
          >
            {d.cta.requestAccess}
          </a>
        </div>
      )}

      <p className="mt-6 text-[13px]" style={{ color: PIVOT_COLORS.slate }}>{d.money.note}</p>
    </div>
  );
}
