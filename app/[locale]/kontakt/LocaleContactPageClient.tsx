"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { CheckCircle2, MessageSquare } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { submitContact } from "@/app/kontakt/actions";
import type { Locale } from "@/i18n/routing";

export default function LocaleContactPageClient() {
  const t = useTranslations("contact");
  const tNav = useTranslations("nav");
  const params = useParams();
  const locale = (params.locale as string) ?? "de";
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const result = await submitContact(new FormData(event.currentTarget));
    setLoading(false);

    if (result.code === "CONTACT_ERROR") {
      toast.error(t("error"));
      return;
    }
    toast.success(t("success"));
    setDone(true);
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-14">
      {/* Language switcher */}
      <div className="mb-6 flex justify-end">
        <LanguageSwitcher currentLocale={locale as Locale} currentPath="/kontakt" />
      </div>

      {/* Breadcrumb */}
      <Link
        href={`/${locale}`}
        className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
      >
        ← {tNav("brand")}
      </Link>

      {/* Header */}
      <div className="mt-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {t("title")}
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* B2B context note */}
      <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/80 px-5 py-4 dark:border-blue-900/40 dark:bg-blue-900/10">
        <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
          Diese Kontaktseite richtet sich an Praxen und Kliniken.
        </p>
        <p className="mt-1 text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
          Fragen zur Einrichtung, zu Datenschutz, Preisen oder einer individuellen Demo?
          Wir antworten persönlich. Kein automatischer Versand, kein Vertriebsdruck.
        </p>
      </div>

      {/* Success state */}
      {done ? (
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/50 dark:bg-emerald-900/10">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm text-emerald-800 dark:text-emerald-300">
            {t("success")}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <input type="hidden" name="locale" value={locale} />

          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t("nameLabel")}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="input-brand"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t("emailLabel")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="input-brand"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="message" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t("messageLabel")}
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              className="input-brand resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-brand disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? t("sending") : t("send")}
          </button>
        </form>
      )}

      {/* What happens after submit */}
      <div className="mt-10 surface-card px-5 py-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t("whatHappensTitle")}
        </h2>
        <div className="mt-4 space-y-3 text-sm">
          {[t("whatHappens1"), t("whatHappens2"), t("whatHappens3")].map(
            (step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step}
                </span>
              </div>
            ),
          )}
        </div>
      </div>
    </main>
  );
}
