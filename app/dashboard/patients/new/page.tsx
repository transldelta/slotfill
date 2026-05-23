"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useTranslations } from "@/lib/i18n";
import { createPatient } from "../actions";

export default function NewPatientPage() {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const name = (formData.get("name") as string).trim();
    const phone = (formData.get("phone") as string).trim();
    if (!name) {
      toast.error(t("errors.requiredField"));
      return;
    }
    if (!/^\+[1-9]\d{6,14}$/.test(phone)) {
      toast.error(t("errors.phoneInvalid"));
      return;
    }

    setLoading(true);
    const result = await createPatient(formData);
    setLoading(false);

    if (result.error) {
      // Maschinenlesbaren Fehlercode auf deutschen Text aus de.json abbilden.
      const messages: Record<string, string> = {
        PRACTICE_NOT_FOUND: t("errors.practiceNotFound"),
        VALIDATION_ERROR: t("errors.validationError"),
        DATABASE_INSERT_FAILED: t("errors.databaseInsertFailed"),
      };
      toast.error(messages[result.error] ?? t("errors.unknownError"));
      return;
    }
    toast.success(t("errors.patientCreated"));
    router.push("/dashboard/patients");
    router.refresh();
  }

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-2xl font-bold">{t("patients.newPatient")}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium">
            {t("patients.nameLabel")}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="phone" className="text-sm font-medium">
            {t("patients.phoneLabel")}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            placeholder="+491701234567"
            pattern="\+[1-9][0-9]{6,14}"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="notes" className="text-sm font-medium">
            {t("patients.notesLabel")}
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? t("common.loading") : t("common.save")}
          </button>
          <Link
            href="/dashboard/patients"
            className="rounded-md border border-border px-4 py-2 text-sm transition hover:bg-secondary"
          >
            {t("common.cancel")}
          </Link>
        </div>
      </form>
    </div>
  );
}
