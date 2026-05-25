"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "@/lib/i18n";

type Status = {
  provider: "none" | "twilio_sms" | "twilio_whatsapp";
  dryRun: boolean;
  smsConfigured: boolean;
  whatsappConfigured: boolean;
  adminTestPhone: boolean;
};

export default function MessagingSetupPage() {
  const t = useTranslations();
  const [status, setStatus] = useState<Status | null>(null);
  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);

  const check = useCallback(async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/admin/messaging-setup/check", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok || data?.code !== "MESSAGING_STATUS") {
        toast.error(t("admin.messagingSetup.error"));
        return;
      }
      setStatus(data);
    } catch {
      toast.error(t("admin.messagingSetup.error"));
    } finally {
      setChecking(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  async function sendTest() {
    setSending(true);
    try {
      const res = await fetch("/api/admin/messaging-setup/send-test", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (data?.code === "NO_TEST_PHONE") {
        toast(t("admin.messagingSetup.noTestPhone"));
        return;
      }
      if (data?.code === "TEST_MESSAGE_RESULT") {
        toast.success(t("admin.messagingSetup.testResult", { status: data.status }));
        return;
      }
      toast.error(t("admin.messagingSetup.error"));
    } catch {
      toast.error(t("admin.messagingSetup.error"));
    } finally {
      setSending(false);
    }
  }

  function YesNo({ value }: { value: boolean }) {
    return value ? (
      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
        <CheckCircle2 className="h-4 w-4" /> {t("admin.messagingSetup.yes")}
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
        <XCircle className="h-4 w-4" /> {t("admin.messagingSetup.no")}
      </span>
    );
  }

  const providerLabel = status
    ? status.provider === "twilio_sms"
      ? t("admin.messagingSetup.providerSms")
      : status.provider === "twilio_whatsapp"
        ? t("admin.messagingSetup.providerWhatsApp")
        : t("admin.messagingSetup.providerNone")
    : "";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t("admin.messagingSetup.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("admin.messagingSetup.subtitle")}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={check}
          disabled={checking || sending}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {checking ? t("admin.messagingSetup.checking") : t("admin.messagingSetup.recheck")}
        </button>
        <button
          onClick={sendTest}
          disabled={checking || sending}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {sending ? t("admin.messagingSetup.sending") : t("admin.messagingSetup.sendTest")}
        </button>
      </div>

      {status && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500 dark:text-slate-400">{t("admin.messagingSetup.provider")}</dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100">{providerLabel}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500 dark:text-slate-400">{t("admin.messagingSetup.dryRun")}</dt>
              <dd><YesNo value={status.dryRun} /></dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500 dark:text-slate-400">{t("admin.messagingSetup.smsConfigured")}</dt>
              <dd><YesNo value={status.smsConfigured} /></dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500 dark:text-slate-400">{t("admin.messagingSetup.whatsappConfigured")}</dt>
              <dd><YesNo value={status.whatsappConfigured} /></dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
