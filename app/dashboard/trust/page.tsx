import { ShieldCheck } from "lucide-react";
import { getTranslations } from "@/lib/i18n";
import { messagingStatus } from "@/lib/messaging";

export const dynamic = "force-dynamic";

export default async function TrustPage() {
  const t = await getTranslations();
  const messaging = messagingStatus();
  const noProvider = messaging.provider === "none";

  const card =
    "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t("trust.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("trust.subtitle")}
        </p>
      </div>

      {/* Datenschutz-Hinweise */}
      <section className={card}>
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-300" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {t("trust.privacy")}
          </h2>
        </div>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
          <li>{t("trust.privacy1")}</li>
          <li>{t("trust.privacy2")}</li>
          <li>{t("trust.privacy3")}</li>
          <li>{t("trust.privacy4")}</li>
        </ul>
      </section>

      {/* Messaging-Status */}
      <section className={card}>
        <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">
          {t("trust.messagingStatus")}
        </h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500 dark:text-slate-400">{t("trust.mode")}</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">
              {noProvider ? t("trust.noRealMessages") : messaging.provider}
            </dd>
          </div>
          {messaging.dryRun && (
            <p className="rounded-lg bg-purple-100 px-3 py-1 text-xs text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
              {t("trust.testModeActive")}
            </p>
          )}
        </dl>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          {t("trust.twilioHint")}
        </p>
      </section>

      {/* Patienten-Einwilligung */}
      <section className={card}>
        <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">
          {t("trust.consent")}
        </h2>
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
          {t("trust.consentText")}
        </p>
        <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("trust.statusExplain")}
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
          <li>{t("trust.explainPrepared")}</li>
          <li>{t("trust.explainNoConsent")}</li>
          <li>{t("trust.explainInvalidPhone")}</li>
          <li>{t("trust.explainNoProvider")}</li>
          <li>{t("trust.explainDryRun")}</li>
        </ul>
      </section>

      {/* Datenkontrolle */}
      <section className={card}>
        <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">
          {t("trust.dataControl")}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {t("trust.dataControlText")}
        </p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {t("trust.dataControlSupport")}
        </p>
      </section>

      <p className="text-xs text-slate-400 dark:text-slate-500">
        {t("trust.noDsgvoPromise")}
      </p>
    </div>
  );
}
