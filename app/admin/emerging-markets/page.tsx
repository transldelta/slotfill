"use client";

/**
 * Admin · Emerging Markets Zero-Cost Visibility System (read-only).
 *
 * Reine Anzeige des internen Governance-Status. Keine Schreibvorgänge, keine
 * externen Aufrufe, kein Versand, keine Secrets. 0 €.
 */

import { useEffect, useMemo, useState } from "react";
import {
  Globe,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Ban,
  MapPin,
} from "lucide-react";
import {
  buildEmergingMarketsSystem,
  EMERGING_TARGET_COUNTRIES,
  BLOCKED_DEVELOPED_COUNTRIES,
  type GateStatus,
  type Subsystem,
} from "@/lib/emerging-markets-agent";

function StatusBadge({ status }: { status: GateStatus }) {
  const map = {
    green: { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300", Icon: CheckCircle2, label: "GREEN" },
    amber: { cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300", Icon: AlertTriangle, label: "AMBER" },
    red: { cls: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300", Icon: XCircle, label: "RED" },
  } as const;
  const { cls, Icon, label } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function SubsystemCard({ s }: { s: Subsystem }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{s.label}</h3>
        <StatusBadge status={s.status} />
      </div>
      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">{s.summary}</p>
      <ul className="space-y-1.5">
        {s.details.map((d) => (
          <li key={d} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
            <span className="mt-0.5 text-slate-400" aria-hidden>
              •
            </span>
            {d}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function EmergingMarketsAdminPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const sys = useMemo(() => buildEmergingMarketsSystem(), []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        style={{ borderTopWidth: 3, borderTopColor: "#0ea5e9" }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300">
            <Globe className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Emerging Markets Zero-Cost Visibility System
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Intern · read-only · 0 € · keine externe Aktivierung · keine API · keine echten Patientendaten
            </p>
          </div>
          <StatusBadge status={sys.ceoTower.status} />
        </div>
      </div>

      {/* CEO Tower + Dauerkontrolle */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <ShieldCheck className="h-4 w-4 text-sky-500" /> {sys.ceoTower.label}
            </span>
            <StatusBadge status={sys.ceoTower.status} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{sys.ceoTower.summary}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> {sys.continuousControl.label}
            </span>
            <StatusBadge status={sys.continuousControl.status} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{sys.continuousControl.summary}</p>
          <p className="mt-2 text-[11px] text-slate-400">
            Guardrail-Verstöße: {sys.guardrail.violations.length}
          </p>
        </div>
      </div>

      {/* Subsysteme */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Ämter · Gates · Offices
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {sys.subsystems.map((s) => (
            <SubsystemCard key={s.id} s={s} />
          ))}
        </div>
      </div>

      {/* Länder-Übersicht */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            <MapPin className="h-4 w-4" /> Aktive Emerging Markets ({EMERGING_TARGET_COUNTRIES.length})
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {EMERGING_TARGET_COUNTRIES.map((c) => (
              <span
                key={c.code}
                className="rounded-md border border-emerald-200 bg-white px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-slate-900 dark:text-emerald-300"
              >
                {c.code} · {c.name}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 dark:border-red-900/50 dark:bg-red-950/20">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-800 dark:text-red-300">
            <Ban className="h-4 w-4" /> Blocked Until Legal Review ({BLOCKED_DEVELOPED_COUNTRIES.length})
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {BLOCKED_DEVELOPED_COUNTRIES.map((c) => (
              <span
                key={c.code}
                className="rounded-md border border-red-200 bg-white px-2 py-0.5 text-[11px] font-medium text-red-700 dark:border-red-900/50 dark:bg-slate-900 dark:text-red-300"
              >
                {c.code}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-red-700/80 dark:text-red-300/80">
            Do Not Target. Keine aktive Bewerbung in entwickelten/hochregulierten Märkten.
          </p>
        </div>
      </div>

      <p className="text-center text-[11px] text-slate-400">
        {mounted ? `Snapshot erzeugt (clientseitig): ${new Date().toLocaleString("de-DE")}` : "Snapshot wird geladen …"}
        {" · "}Kein Versand · Keine Speicherung · 0 €
      </p>
    </div>
  );
}
