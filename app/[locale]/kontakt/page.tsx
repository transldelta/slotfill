"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { submitContact } from "@/app/kontakt/actions";
import type { Locale } from "@/i18n/routing";

export default function LocaleContactPage() {
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
    // CONTACT_SENT und CONTACT_STORED gelten beide als Erfolg.
    toast.success(t("success"));
    setDone(true);
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <div className="mb-4 flex justify-end">
        <LanguageSwitcher currentLocale={locale as Locale} currentPath="/kontakt" />
      </div>
      <Link
        href={`/${locale}`}
        className="text-sm text-blue-600 hover:underline dark:text-blue-400"
      >
        {tNav("brand")}
      </Link>
      <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
        {t("title")}
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        {t("subtitle")}
      </p>

      {done ? (
        <p className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-5 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">
          {t("success")}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {t("nameLabel")}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {t("emailLabel")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="message" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {t("messageLabel")}
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? t("sending") : t("send")}
          </button>
        </form>
      )}
    </main>
  );
}
