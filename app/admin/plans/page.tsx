"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "@/lib/i18n";
import { LoadingSkeleton } from "@/components/loading-skeleton";

type Plan = {
  id: string;
  plan_key: string;
  name: string;
  price_monthly: number;
  max_patients: number;
  max_notifications_per_month: number;
  feature_keys: string[];
};

const euro = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

export default function AdminPlansPage() {
  const t = useTranslations();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/plans", { cache: "no-store" });
      if (!res.ok) throw new Error("request failed");
      const data = await res.json();
      setPlans(data.plans ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const form = new FormData(event.currentTarget);
    const updates = {
      price_monthly: Number(form.get("price_monthly")),
      max_patients: Number(form.get("max_patients")),
      max_notifications_per_month: Number(form.get("max_notifications_per_month")),
      feature_keys: String(form.get("feature_keys"))
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    setSaving(true);
    const res = await fetch("/api/admin/plans", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: editing.id, updates }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error(t("common.error"));
      return;
    }
    const data = await res.json();
    setPlans((prev) => prev.map((p) => (p.id === editing.id ? data.plan : p)));
    setEditing(null);
  }

  if (loading) return <LoadingSkeleton variant="card" count={3} />;

  if (error) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="mb-4 text-slate-500 dark:text-slate-400">{t("common.error")}</p>
        <button
          onClick={load}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {t("admin.retry")}
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">
        {t("admin.plans")}
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {plan.name}
              </h2>
              <button
                onClick={() => setEditing(plan)}
                className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-400 dark:hover:bg-slate-800"
                aria-label={t("admin.editPlan")}
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-100">
              {euro.format(plan.price_monthly)}
            </p>
            <ul className="mt-4 flex-1 space-y-1 text-sm text-slate-600 dark:text-slate-300">
              <li>
                {t("admin.maxPatients")}: {plan.max_patients}
              </li>
              <li>
                {t("admin.maxNotifications")}: {plan.max_notifications_per_month}
              </li>
            </ul>
          </div>
        ))}
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setEditing(null)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={save}
            className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
          >
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t("admin.editPlan")} – {editing.name}
            </h2>

            <Field label={t("admin.planPrice")} name="price_monthly" defaultValue={editing.price_monthly} />
            <Field label={t("admin.maxPatients")} name="max_patients" defaultValue={editing.max_patients} />
            <Field label={t("admin.maxNotifications")} name="max_notifications_per_month" defaultValue={editing.max_notifications_per_month} />

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {t("admin.featureKeys")}
              </label>
              <textarea
                name="feature_keys"
                rows={4}
                defaultValue={(editing.feature_keys ?? []).join("\n")}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? t("common.loading") : t("admin.savePlan")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: number;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </label>
      <input
        type="number"
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />
    </div>
  );
}
