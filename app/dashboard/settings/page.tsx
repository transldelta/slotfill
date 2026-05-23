import { redirect } from "next/navigation";
import { Bell, Building2, Moon } from "lucide-react";
import { getCurrentPractice } from "@/lib/practice";
import { getTranslations } from "@/lib/i18n";

export default async function SettingsPage() {
  const ctx = await getCurrentPractice();
  if (!ctx) {
    redirect("/auth/login");
  }
  const t = await getTranslations();

  const { data: practice } = await ctx.admin
    .from("practices")
    .select("email")
    .eq("id", ctx.practiceId)
    .maybeSingle();
  const email = practice?.email ?? null;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        {t("settings.title")}
      </h1>

      {/* Praxisdaten */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-300" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {t("settings.practiceData")}
          </h2>
        </div>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500 dark:text-slate-400">
              {t("settings.practiceName")}
            </dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">
              {ctx.practiceName || "—"}
            </dd>
          </div>
          {email && (
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500 dark:text-slate-400">
                {t("settings.practiceEmail")}
              </dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100">
                {email}
              </dd>
            </div>
          )}
        </dl>
      </section>

      {/* Benachrichtigungen */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-2 flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-600 dark:text-blue-300" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {t("settings.notifications")}
          </h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("settings.notificationsDescription")}
        </p>
      </section>

      {/* Darstellung */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-2 flex items-center gap-2">
          <Moon className="h-5 w-5 text-blue-600 dark:text-blue-300" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {t("settings.appearance")}
          </h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("settings.appearanceDescription")}
        </p>
      </section>
    </div>
  );
}
