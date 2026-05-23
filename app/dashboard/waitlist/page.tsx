"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useTranslations } from "@/lib/i18n";
import { ConfirmDialog } from "@/components/confirm-dialog";

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
        <h1 className="text-2xl font-bold">{t("waitlist.title")}</h1>
        {entries.length > 0 && (
          <button
            onClick={() => setConfirmClear(true)}
            className="rounded-lg border border-border px-4 py-2 text-sm transition hover:bg-secondary"
          >
            {t("waitlist.clearWaitlist")}
          </button>
        )}
      </div>

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 w-full animate-pulse rounded bg-gray-200" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-border p-8 text-center">
          <p className="mb-4 text-muted-foreground">{t("common.error")}</p>
          <button
            onClick={load}
            className="rounded-lg border border-border px-4 py-2 text-sm transition hover:bg-secondary"
          >
            {t("common.retry")}
          </button>
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="rounded-lg border border-border p-8 text-center">
          <p className="mb-4 text-muted-foreground">{t("waitlist.noWaitlist")}</p>
          <Link
            href="/dashboard/patients"
            className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            {t("patients.title")}
          </Link>
        </div>
      )}

      {!loading && !error && entries.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-border bg-secondary/30">
              <tr>
                <th className="px-4 py-3 font-medium">{t("patients.nameLabel")}</th>
                <th className="px-4 py-3 font-medium">{t("patients.phoneLabel")}</th>
                <th className="px-4 py-3 font-medium">{t("waitlist.since")}</th>
                <th className="px-4 py-3 text-right font-medium">
                  {t("patients.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr
                  key={e.patientId}
                  className="border-b border-border transition last:border-0 hover:bg-secondary/20"
                >
                  <td className="px-4 py-3">{e.name}</td>
                  <td className="px-4 py-3">{e.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatSince(e.since)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleRemove(e)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs transition hover:bg-secondary"
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
