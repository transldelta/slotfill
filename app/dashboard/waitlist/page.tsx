"use client";

import { useCallback, useEffect, useState } from "react";
import { ListOrdered } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "@/lib/i18n";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { LoadingSkeleton } from "@/components/loading-skeleton";

type WaitlistEntry = {
  patientId: string;
  name: string;
  phone: string | null;
  since: string;
};

export default function WaitlistPage() {
  const t = useTranslations();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/waitlist", { cache: "no-store" });
      if (!res.ok) throw new Error("request failed");
      const data = await res.json();
      setEntries(data.entries ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRemove(entry: WaitlistEntry) {
    const res = await fetch("/api/waitlist/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patient_id: entry.patientId }),
    });
    if (!res.ok) {
      toast.error(t("common.error"));
      return;
    }
    toast.success(t("waitlist.removedFromWaitlist"));
    setEntries((prev) => prev.filter((e) => e.patientId !== entry.patientId));
  }

  async function confirmClearWaitlist() {
    setConfirmClear(false);
    const res = await fetch("/api/waitlist", { method: "DELETE" });
    if (!res.ok) {
      toast.error(t("common.error"));
      return;
    }
    setEntries([]);
  }

  function formatSince(iso: string) {
    return new Date(iso).toLocaleDateString("de-DE");
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t("waitlist.title")}
          </h1>
          <span className="inline-flex min-w-[1.75rem] items-center justify-center rounded-full bg-blue-100 px-2 py-0.5 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            {entries.length}
          </span>
        </div>
        <button
          onClick={() => setConfirmClear(true)}
          disabled={entries.length === 0}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {t("waitlist.clearWaitlist")}
        </button>
      </div>

      {loading && <LoadingSkeleton variant="table" count={3} />}

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

      {!loading && !error && entries.length === 0 && (
        <EmptyState
          icon={ListOrdered}
          title={t("emptyState.noWaitlist")}
          description={t("dashboard.welcomeIntro")}
          actionLabel={t("patients.title")}
          actionHref="/dashboard/patients"
        />
      )}

      {!loading && !error && entries.length > 0 && (
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
                  {t("waitlist.since")}
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-200">
                  {t("patients.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr
                  key={e.patientId}
                  className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3 text-slate-900 dark:text-slate-100">
                    {e.name}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    {e.phone}
                  </td>
                  <td className="hidden px-4 py-3 text-slate-500 dark:text-slate-400 sm:table-cell">
                    {formatSince(e.since)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleRemove(e)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        {t("waitlist.removeFromWaitlist")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={confirmClear}
        message={t("waitlist.clearConfirm")}
        confirmLabel={t("waitlist.clearWaitlist")}
        cancelLabel={t("common.cancel")}
        onConfirm={confirmClearWaitlist}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
}
