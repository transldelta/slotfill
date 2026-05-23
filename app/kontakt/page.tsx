"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useTranslations } from "@/lib/i18n";
import { submitContact } from "./actions";

export default function ContactPage() {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const result = await submitContact(new FormData(event.currentTarget));
    setLoading(false);

    if (result.code === "CONTACT_ERROR") {
      toast.error(t("contact.error"));
      return;
    }
    // CONTACT_SENT und CONTACT_STORED gelten beide als Erfolg.
    toast.success(t("contact.success"));
    setDone(true);
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <Link
        href="/"
        className="text-sm text-blue-600 hover:underline dark:text-blue-400"
      >
        {t("nav.brand")}
      </Link>
      <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
        {t("contact.title")}
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        {t("contact.subtitle")}
      </p>

      {done ? (
        <p className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-5 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">
          {t("contact.success")}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {t("contact.nameLabel")}
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
              {t("contact.emailLabel")}
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
              {t("contact.messageLabel")}
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
            {loading ? t("contact.sending") : t("contact.send")}
          </button>
        </form>
      )}
    </main>
  );
}
