"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, Users } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "@/lib/i18n";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { LoadingSkeleton } from "@/components/loading-skeleton";

type Patient = {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  onWaitlist: boolean;
};

export default function PatientsPage() {
  const t = useTranslations();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState<Patient | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/patients", { cache: "no-store" });
      if (!res.ok) throw new Error("request failed");
      const data = await res.json();
      setPatients(data.patients ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function confirmDelete() {
    if (!toDelete) return;
    const patient = toDelete;
    setToDelete(null);
    const res = await fetch(`/api/patients/${patient.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error(t("common.error"));
      return;
    }
    setPatients((prev) => prev.filter((p) => p.id !== patient.id));
  }

  async function handleToggleWaitlist(patient: Patient) {
    const res = await fetch("/api/waitlist/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patient_id: patient.id }),
    });
    if (!res.ok) {
      toast.error(t("common.error"));
      return;
    }
    const { onWaitlist } = await res.json();
    toast.success(
      onWaitlist
        ? t("waitlist.addedToWaitlist")
        : t("waitlist.removedFromWaitlist"),
    );
    setPatients((prev) =>
      prev.map((p) => (p.id === patient.id ? { ...p, onWaitlist } : p)),
    );
  }

  const filtered = patients.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.phone ?? "").toLowerCase().includes(q)
    );
  });

  // Leere Platzhalter-Zeilen, damit die Tabelle bei wenigen Einträgen ruhig wirkt.
  const fillerRows = Math.max(0, 5 - filtered.length);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t("patients.title")}
        </h1>
        <a
          href="/dashboard/patients/new"
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {t("patients.newPatient")}
        </a>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("patients.search")}
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      {loading && <LoadingSkeleton variant="table" />}

      {!loading && error && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="mb-4 text-slate-500 dark:text-slate-400">
            {t("common.error")}
          </p>
          <button
            onClick={load}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {t("common.retry")}
          </button>
        </div>
      )}

      {!loading && !error && patients.length === 0 && (
        <EmptyState
          icon={Users}
          title={t("emptyState.noPatients")}
          description={t("dashboard.welcomeIntro")}
          actionLabel={t("patients.newPatient")}
          actionHref="/dashboard/patients/new"
        />
      )}

      {!loading && !error && patients.length > 0 && filtered.length === 0 && (
        <p className="py-8 text-center text-slate-500 dark:text-slate-400">
          {t("common.noResults")}
        </p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                  {t("patients.nameLabel")}
                </th>
                <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                  {t("patients.phoneLabel")}
                </th>
                <th className="hidden px-4 py-3 font-medium text-slate-700 dark:text-slate-200 sm:table-cell">
                  {t("patients.notesLabel")}
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-200">
                  {t("patients.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3 text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-2">
                      <span>{p.name}</span>
                      {p.onWaitlist && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          {t("waitlist.onWaitlist")}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    {p.phone}
                  </td>
                  <td className="hidden px-4 py-3 text-slate-500 dark:text-slate-400 sm:table-cell">
                    {p.notes}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        onClick={() => handleToggleWaitlist(p)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        {p.onWaitlist
                          ? t("waitlist.removeFromWaitlist")
                          : t("waitlist.addToWaitlist")}
                      </button>
                      <button
                        onClick={() => setToDelete(p)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-slate-700 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        {t("patients.delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {Array.from({ length: fillerRows }).map((_, i) => (
                <tr key={`filler-${i}`} className="border-b border-dashed border-slate-200 last:border-0 dark:border-slate-800">
                  <td className="px-4 py-3" colSpan={4}>
                    &nbsp;
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        message={t("patients.deleteConfirm")}
        confirmLabel={t("patients.delete")}
        cancelLabel={t("common.cancel")}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
