"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Search } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "@/lib/i18n";
import { LoadingSkeleton } from "@/components/loading-skeleton";

type Practice = {
  id: string;
  name: string;
  email: string | null;
  created_at: string;
  banned: boolean;
  is_admin: boolean;
  status: string | null;
  planName: string | null;
};

export default function AdminPracticesPage() {
  const t = useTranslations();
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/practices", { cache: "no-store" });
      if (!res.ok) throw new Error("request failed");
      const data = await res.json();
      setPractices(data.practices ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleBan(p: Practice) {
    const res = await fetch(`/api/admin/practices/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ banned: !p.banned }),
    });
    if (!res.ok) {
      toast.error(t("common.error"));
      return;
    }
    setPractices((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, banned: !p.banned } : x)),
    );
  }

  const filtered = practices.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.email ?? "").toLowerCase().includes(q)
    );
  });

  function statusBadge(p: Practice) {
    if (p.banned) {
      return { label: t("admin.statusBanned"), cls: "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200" };
    }
    switch (p.status) {
      case "active":
        return { label: t("admin.statusActive"), cls: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" };
      case "trial":
        return { label: t("admin.statusTrial"), cls: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" };
      case "cancelled":
        return { label: t("admin.statusCancelled"), cls: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" };
      default:
        return { label: "—", cls: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" };
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">
        {t("admin.practices")}
      </h1>

      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("admin.search")}
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      {loading && <LoadingSkeleton variant="table" />}

      {!loading && error && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="mb-4 text-slate-500 dark:text-slate-400">{t("common.error")}</p>
          <button
            onClick={load}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {t("admin.retry")}
          </button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <p className="py-8 text-center text-slate-500 dark:text-slate-400">
          {t("admin.noPractices")}
        </p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{t("admin.practiceName")}</th>
                <th className="hidden px-4 py-3 font-medium text-slate-700 dark:text-slate-200 sm:table-cell">{t("admin.practiceEmail")}</th>
                <th className="hidden px-4 py-3 font-medium text-slate-700 dark:text-slate-200 md:table-cell">{t("admin.planName")}</th>
                <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{t("admin.practiceStatus")}</th>
                <th className="hidden px-4 py-3 font-medium text-slate-700 dark:text-slate-200 lg:table-cell">{t("admin.practiceCreated")}</th>
                <th className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-200">{t("patients.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const badge = statusBadge(p);
                return (
                  <tr
                    key={p.id}
                    className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3 text-slate-900 dark:text-slate-100">{p.name}</td>
                    <td className="hidden px-4 py-3 text-slate-700 dark:text-slate-300 sm:table-cell">{p.email}</td>
                    <td className="hidden px-4 py-3 text-slate-700 dark:text-slate-300 md:table-cell">{p.planName ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-500 dark:text-slate-400 lg:table-cell">
                      {format(new Date(p.created_at), "dd.MM.yyyy")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <button
                          onClick={() => toggleBan(p)}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          {p.banned ? t("admin.unbanPractice") : t("admin.banPractice")}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
