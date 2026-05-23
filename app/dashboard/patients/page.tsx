"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useTranslations } from "@/lib/i18n";
import { ConfirmDialog } from "@/components/confirm-dialog";

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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{t("patients.title")}</h1>
        <Link
          href="/dashboard/patients/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          {t("patients.newPatient")}
        </Link>
      </div>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t("patients.search")}
        className="mb-4 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      />

      {loading && <SkeletonRows />}

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

      {!loading && !error && patients.length === 0 && (
        <div className="rounded-lg border border-border p-8 text-center">
          <p className="mb-4 text-muted-foreground">{t("patients.noPatients")}</p>
          <Link
            href="/dashboard/patients/new"
            className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            {t("patients.newPatient")}
          </Link>
        </div>
      )}

      {!loading && !error && patients.length > 0 && filtered.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">
          {t("common.noResults")}
        </p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-border bg-secondary/30">
              <tr>
                <th className="px-4 py-3 font-medium">{t("patients.nameLabel")}</th>
                <th className="px-4 py-3 font-medium">{t("patients.phoneLabel")}</th>
                <th className="px-4 py-3 font-medium">{t("patients.notesLabel")}</th>
                <th className="px-4 py-3 text-right font-medium">
                  {t("patients.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border transition last:border-0 hover:bg-secondary/20"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span>{p.name}</span>
                      {p.onWaitlist && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                          {t("waitlist.onWaitlist")}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">{p.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.notes}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleToggleWaitlist(p)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs transition hover:bg-secondary"
                      >
                        {p.onWaitlist
                          ? t("waitlist.removeFromWaitlist")
                          : t("waitlist.addToWaitlist")}
                      </button>
                      <button
                        onClick={() => setToDelete(p)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs text-red-600 transition hover:bg-red-50"
                      >
                        {t("patients.delete")}
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

function SkeletonRows() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-12 w-full animate-pulse rounded bg-gray-200"
        />
      ))}
    </div>
  );
}
