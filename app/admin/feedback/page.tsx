"use client";

import { useCallback, useEffect, useState } from "react";
import { Star, CheckCircle, EyeOff, Archive, Globe } from "lucide-react";
import toast from "react-hot-toast";
import { getRatingColor } from "@/lib/feedback";

type FeedbackEntry = {
  id: string;
  rating: number;
  feedback_text: string | null;
  customer_name: string | null;
  visibility: "private" | "public";
  status: string;
  consent_to_publish: boolean;
  reviewed_by_admin: boolean;
  created_at: string;
};

const FILTER_OPTIONS = [
  { value: "all", label: "Alle" },
  { value: "low", label: "1–3 Sterne" },
  { value: "high", label: "4–5 Sterne" },
  { value: "new", label: "Neu" },
  { value: "reviewed", label: "Geprüft" },
  { value: "public", label: "Öffentlich" },
  { value: "private", label: "Privat" },
];

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<FeedbackEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/feedback?filter=${filter}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setItems(data.feedback ?? []);
      setTotal(data.total ?? 0);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function doAction(id: string, action: string) {
    setActionLoading(id + action);
    const res = await fetch("/api/admin/feedback", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    const data = await res.json();
    setActionLoading(null);
    if (!res.ok) {
      toast.error(data.message ?? data.code ?? "Fehler");
      return;
    }
    toast.success("Aktualisiert");
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Feedback & Bewertungen
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {total} Einträge · Veröffentlichung erfordert manuelle Freigabe
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
          Keine Einträge gefunden.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border p-5"
              style={{
                borderColor: item.rating <= 2 ? "#fca5a5" : item.rating === 3 ? "#fcd34d" : "var(--color-border)",
                backgroundColor: "var(--color-surface)",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Sterne */}
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-4 w-4 ${getRatingColor(item.rating)}`}
                          fill={s <= item.rating ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(item.created_at).toLocaleDateString("de-DE")}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.visibility === "public"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                    }`}>
                      {item.visibility === "public" ? "Öffentlich" : "Privat"}
                    </span>
                    {item.status === "new" && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        Neu
                      </span>
                    )}
                  </div>

                  {/* Text */}
                  {item.feedback_text && (
                    <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 line-clamp-3">
                      &ldquo;{item.feedback_text}&rdquo;
                    </p>
                  )}
                  {item.customer_name && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      — {item.customer_name}
                    </p>
                  )}
                  {item.rating <= 3 && (
                    <p className="mt-2 rounded-md bg-amber-50 px-3 py-1.5 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                      ⚠️ 1–3 Sterne · Improvement-Ticket wurde automatisch erstellt · Nicht veröffentlichbar
                    </p>
                  )}
                </div>

                {/* Aktionen */}
                <div className="flex shrink-0 flex-col gap-2">
                  <button
                    onClick={() => doAction(item.id, "mark_reviewed")}
                    disabled={actionLoading === item.id + "mark_reviewed"}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                  >
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    Geprüft
                  </button>

                  {item.rating >= 4 && item.consent_to_publish && item.visibility !== "public" && (
                    <button
                      onClick={() => doAction(item.id, "publish")}
                      disabled={actionLoading === item.id + "publish"}
                      className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      Veröffentlichen
                    </button>
                  )}

                  <button
                    onClick={() => doAction(item.id, "set_private")}
                    disabled={actionLoading === item.id + "set_private"}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                  >
                    <EyeOff className="h-3.5 w-3.5 text-slate-400" />
                    Privat
                  </button>

                  <button
                    onClick={() => doAction(item.id, "archive")}
                    disabled={actionLoading === item.id + "archive"}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                  >
                    <Archive className="h-3.5 w-3.5" />
                    Archivieren
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-400 dark:text-slate-600">
        Hinweis: Feedback mit 1–3 Sternen kann nicht veröffentlicht werden. Veröffentlichung erfordert
        rating ≥ 4, Einwilligung des Patienten und manuelle Admin-Freigabe.
        Keine automatische Google-Review-Erstellung.
      </p>
    </div>
  );
}
