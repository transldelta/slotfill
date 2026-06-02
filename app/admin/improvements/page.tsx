"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Loader2, XCircle, PlayCircle, ClipboardList } from "lucide-react";
import toast from "react-hot-toast";
import {
  getSeverityLabel,
  getSeverityColor,
  getCategoryLabel,
  isCriticalSeverity,
} from "@/lib/improvement-analysis";

type TicketEntry = {
  id: string;
  category: string;
  severity: string;
  summary: string;
  suggested_action: string;
  status: string;
  assigned_role: string;
  recurring_issue_key: string | null;
  is_recurring: boolean;
  reviewed_by: string | null;
  created_at: string;
  feedback_reviews?: {
    rating: number;
    feedback_text: string | null;
    customer_name: string | null;
    created_at: string;
  } | null;
};

const STATUS_LABELS: Record<string, string> = {
  new: "Neu",
  reviewed: "Geprüft",
  action_planned: "Maßnahme geplant",
  in_progress: "In Bearbeitung",
  resolved: "Erledigt",
  rejected: "Abgelehnt",
};

const FILTER_OPTIONS = [
  { value: "all", label: "Alle" },
  { value: "urgent", label: "Dringend" },
  { value: "high", label: "Hoch + Dringend" },
  { value: "new", label: "Neu" },
  { value: "recurring", label: "Wiederkehrend" },
  { value: "unresolved", label: "Offen" },
];

export default function AdminImprovementsPage() {
  const [items, setItems] = useState<TicketEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("unresolved");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/improvements?filter=${filter}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setItems(data.tickets ?? []);
      setTotal(data.total ?? 0);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function doAction(id: string, action: string, extra?: Record<string, string>) {
    setActionLoading(id + action);
    const res = await fetch("/api/admin/improvements", {
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
    toast.success("Aktualisiert");
    setRejectId(null);
    setRejectReason("");
    load();
  }

  const criticalItems = items.filter((it) => isCriticalSeverity(it.severity as "low" | "medium" | "high" | "urgent"));
  const normalItems = items.filter((it) => !isCriticalSeverity(it.severity as "low" | "medium" | "high" | "urgent"));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Verbesserungs-Tickets
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {total} Tickets · Automatisch erstellt bei 1–3 Sternen
          </p>
        </div>
      </div>

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
          Keine Tickets gefunden. 🎉
        </div>
      ) : (
        <>
          {/* Kritische Tickets oben */}
          {criticalItems.length > 0 && (
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" />
                Kritisch / Dringend ({criticalItems.length}) · CEO-Prüfung empfohlen
              </h2>
              {criticalItems.map((item) => <TicketCard key={item.id} item={item} doAction={doAction} actionLoading={actionLoading} rejectId={rejectId} setRejectId={setRejectId} rejectReason={rejectReason} setRejectReason={setRejectReason} />)}
            </div>
          )}

          {/* Normale Tickets */}
          {normalItems.length > 0 && (
            <div className="space-y-3">
              {criticalItems.length > 0 && (
                <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Weitere Tickets ({normalItems.length})
                </h2>
              )}
              {normalItems.map((item) => <TicketCard key={item.id} item={item} doAction={doAction} actionLoading={actionLoading} rejectId={rejectId} setRejectId={setRejectId} rejectReason={rejectReason} setRejectReason={setRejectReason} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TicketCard({
  item,
  doAction,
  actionLoading,
  rejectId,
  setRejectId,
  rejectReason,
  setRejectReason,
}: {
  item: TicketEntry;
  doAction: (id: string, action: string, extra?: Record<string, string>) => Promise<void>;
  actionLoading: string | null;
  rejectId: string | null;
  setRejectId: (id: string | null) => void;
  rejectReason: string;
  setRejectReason: (r: string) => void;
}) {
  const isCritical = isCriticalSeverity(item.severity as "low" | "medium" | "high" | "urgent");

  return (
    <div
      className="rounded-xl border p-5"
      style={{
        borderColor: isCritical ? "#ef4444" : "var(--color-border)",
        backgroundColor: "var(--color-surface)",
      }}
    >
      <div className="flex flex-wrap items-start gap-3">
        {/* Severity-Badge */}
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
          item.severity === "urgent"
            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            : item.severity === "high"
              ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
              : item.severity === "medium"
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
        }`}>
          {getSeverityLabel(item.severity as "low" | "medium" | "high" | "urgent")}
        </span>

        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          {getCategoryLabel(item.category as Parameters<typeof getCategoryLabel>[0])}
        </span>

        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
          item.status === "resolved"
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : item.status === "rejected"
              ? "bg-slate-100 text-slate-500"
              : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
        }`}>
          {STATUS_LABELS[item.status] ?? item.status}
        </span>

        {item.is_recurring && (
          <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
            🔁 Wiederkehrend
          </span>
        )}

        <span className="ml-auto text-xs text-slate-400">
          {new Date(item.created_at).toLocaleDateString("de-DE")}
        </span>
      </div>

      {/* Warnung bei kritisch */}
      {isCritical && (
        <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-400">
          <strong>CEO-Prüfung empfohlen</strong> – Schweregrad: {getSeverityLabel(item.severity as "low" | "medium" | "high" | "urgent")}
        </div>
      )}

      {/* Wiederkehrendes Problem */}
      {item.is_recurring && (
        <div className="mt-2 rounded-lg bg-purple-50 px-3 py-2 text-xs text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
          ⚠️ Mehrere Nutzer melden dieses Problem.
        </div>
      )}

      {/* Summary */}
      <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{item.summary}</p>

      {/* Suggested Action */}
      <div className="mt-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800 dark:border-blue-900/30 dark:bg-blue-900/10 dark:text-blue-300">
        <strong>Empfohlene Maßnahme:</strong> {item.suggested_action}
      </div>

      {/* Original-Feedback */}
      {item.feedback_reviews?.feedback_text && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic">
          Feedback: &ldquo;{item.feedback_reviews.feedback_text.slice(0, 200)}
          {item.feedback_reviews.feedback_text.length > 200 ? "…" : ""}&rdquo;
        </p>
      )}

      {/* Assigned Role */}
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Zugewiesen: <strong>{item.assigned_role}</strong>
      </p>

      {/* Aktionen */}
      {item.status !== "resolved" && item.status !== "rejected" && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => doAction(item.id, "mark_reviewed")}
            disabled={!!actionLoading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
          >
            <CheckCircle className="h-3.5 w-3.5 text-green-500" /> Geprüft
          </button>
          <button
            onClick={() => doAction(item.id, "plan_action")}
            disabled={!!actionLoading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
          >
            <ClipboardList className="h-3.5 w-3.5 text-blue-500" /> Maßnahme planen
          </button>
          <button
            onClick={() => doAction(item.id, "start_progress")}
            disabled={!!actionLoading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
          >
            <PlayCircle className="h-3.5 w-3.5 text-amber-500" /> In Bearbeitung
          </button>
          <button
            onClick={() => doAction(item.id, "resolve")}
            disabled={!!actionLoading}
            className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700"
          >
            <CheckCircle className="h-3.5 w-3.5" /> Erledigt
          </button>
          <button
            onClick={() => setRejectId(item.id)}
            disabled={!!actionLoading}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/10"
          >
            <XCircle className="h-3.5 w-3.5" /> Ablehnen
          </button>
        </div>
      )}

      {/* Ablehnen-Dialog */}
      {rejectId === item.id && (
        <div className="mt-3 space-y-2">
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Begründung (optional)"
            rows={2}
            maxLength={500}
            className="w-full rounded-lg border px-3 py-2 text-xs focus:outline-none"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
          />
          <div className="flex gap-2">
            <button
              onClick={() => doAction(item.id, "reject", rejectReason ? { rejection_reason: rejectReason } : {})}
              disabled={!!actionLoading}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700"
            >
              {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Bestätigen"}
            </button>
            <button
              onClick={() => { setRejectId(null); setRejectReason(""); }}
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
}
