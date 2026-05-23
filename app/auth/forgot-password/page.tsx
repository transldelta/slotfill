"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { resetPassword } from "../actions";
import { useTranslations } from "@/lib/i18n";

export default function ForgotPasswordPage() {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const result = await resetPassword(new FormData(event.currentTarget));
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(result.message ?? t("auth.passwordResetSent"));
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-secondary/30 p-6 shadow-lg">
        <h1 className="mb-6 text-2xl font-bold">{t("auth.resetPassword")}</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">
              {t("auth.emailLabel")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? t("common.loading") : t("auth.resetPassword")}
          </button>
        </form>

        <div className="mt-4 text-sm">
          <Link href="/auth/login" className="text-muted-foreground hover:underline">
            {t("auth.loginTitle")}
          </Link>
        </div>
      </div>
    </main>
  );
}
