"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useTranslations } from "@/lib/i18n";
import { createAppointment } from "../actions";

type PatientOption = { id: string; name: string };

export default function NewAppointmentPage() {
  const t = useTranslations();
  const router = useRouter();
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/patients", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { patients: [] }))
      .then((data) => setPatients(data.patients ?? []))
      .catch(() => setPatients([]));
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (!formData.get("patient_id") || !formData.get("scheduled_time")) {
      toast.error(t("errors.requiredField"));
      return;
    }

    setLoading(true);
    const result = await createAppointment(formData);
    setLoading(false);

    if (result.error) {
      toast.error(t("appointments.createError"));
      return;
    }
    toast.success(t("appointments.created"));
    router.push("/dashboard/appointments");
    router.refresh();
  }

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-2xl font-bold">{t("appointments.newAppointment")}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="patient_id" className="text-sm font-medium">
            {t("appointments.patientLabel")}
          </label>
          <select
            id="patient_id"
            name="patient_id"
            required
            defaultValue=""
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="" disabled>
              —
            </option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="scheduled_time" className="text-sm font-medium">
            {t("appointments.dateLabel")}
          </label>
          <input
            id="scheduled_time"
            name="scheduled_time"
            type="datetime-local"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? t("common.loading") : t("common.save")}
          </button>
          <Link
            href="/dashboard/appointments"
            className="rounded-lg border border-border px-4 py-2 text-sm transition hover:bg-secondary"
          >
            {t("common.cancel")}
          </Link>
        </div>
      </form>
    </div>
  );
}
