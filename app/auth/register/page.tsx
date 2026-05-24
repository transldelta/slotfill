"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { signUp } from "../actions";
import { useTranslations } from "@/lib/i18n";

export default function RegisterPage() {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const password = formData.get("password") as string;
    const passwordRepeat = formData.get("passwordRepeat") as string;
    if (password !== passwordRepeat) {
      toast.error(t("common.error"));
      return;
    }

    setLoading(true);
    const result = await signUp(formData);
    setLoading(false);

    if (result.code !== "REGISTRATION_CREATED") {
      // Maschinenlesbaren Code auf deutschen Text aus de.json abbilden.
      const messages: Record<string, string> = {
        EMAIL_TAKEN: t("auth.emailTaken"),
        WEAK_PASSWORD: t("auth.weakPassword"),
        RATE_LIMITED: t("auth.rateLimited"),
        VALIDATION_ERROR: t("errors.validationError"),
        PRACTICE_CREATE_ERROR: t("auth.practiceCreateError"),
        AUTH_SIGNUP_ERROR: t("auth.signupError"),
      };
      toast.error(messages[result.code ?? ""] ?? t("auth.signupError"));
      return;
    }
    toast.success(t("auth.registrationSuccess"));
    router.push("/auth/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-secondary/30 p-6 shadow-lg">
        <h1 className="mb-6 text-2xl font-bold">{t("auth.registerTitle")}</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium">
              {t("auth.nameLabel")}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="organization"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

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

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium">
              {t("auth.passwordLabel")}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="passwordRepeat" className="text-sm font-medium">
              {t("auth.passwordLabel")}
            </label>
            <input
              id="passwordRepeat"
              name="passwordRepeat"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? t("common.loading") : t("auth.registerButton")}
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
