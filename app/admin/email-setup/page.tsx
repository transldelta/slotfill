"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "@/lib/i18n";

type DomainRecord = {
  record?: string;
  name?: string;
  type?: string;
  value?: string;
  ttl?: string;
  status?: string;
  priority?: number;
};

type CheckResult = {
  hasApiKey: boolean;
  hasFromEmail: boolean;
  fromEmail: string;
  domain: string;
  isTestDomain: boolean;
  domainStatus: "verified" | "not_verified" | "not_found" | "unknown";
  records: DomainRecord[];
};

export default function EmailSetupPage() {
  const t = useTranslations();
  const [result, setResult] = useState<CheckResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);

  const check = useCallback(async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/admin/email-setup/check", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok || data?.code !== "EMAIL_SETUP_CHECKED") {
        toast.error(t("admin.emailSetup.checkError"));
        return;
      }
      setResult(data);
    } catch {
      toast.error(t("admin.emailSetup.checkError"));
    } finally {
      setChecking(false);
    }
    // t ist bei festem Locale stabil; bewusst nicht in die Deps, damit der
    // Mount-Effekt nicht in einer Endlosschleife läuft.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  async function sendTest() {
    setSending(true);
    try {
      const res = await fetch("/api/admin/email-setup/send-test", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (data?.code === "TEST_EMAIL_SENT") {
        toast.success(t("admin.emailSetup.testSent", { recipient: data.recipient }));
      } else {
        toast.error(
          t("admin.emailSetup.testFailed", { diagnosis: data?.diagnosis ?? "—" }),
        );
      }
    } catch {
      toast.error(t("admin.emailSetup.checkError"));
    } finally {
      setSending(false);
    }
  }

  function StatusLine() {
    if (!result) return null;
    const map = {
      verified: { icon: CheckCircle2, color: "text-green-600 dark:text-green-400", text: t("admin.emailSetup.statusVerified") },
      not_verified: { icon: XCircle, color: "text-red-600 dark:text-red-400", text: t("admin.emailSetup.statusNotVerified") },
      not_found: { icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400", text: t("admin.emailSetup.statusNotFound") },
      unknown: { icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400", text: t("admin.emailSetup.statusUnknown") },
    } as const;
    const s = map[result.domainStatus];
    const Icon = s.icon;
    return (
      <div className={`flex items-start gap-2 ${s.color}`}>
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-sm">{s.text}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t("admin.emailSetup.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("admin.emailSetup.subtitle")}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={check}
          disabled={checking || sending}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {checking ? t("admin.emailSetup.checking") : t("admin.emailSetup.recheck")}
        </button>
        <button
          onClick={sendTest}
          disabled={checking || sending}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {sending ? t("admin.emailSetup.sending") : t("admin.emailSetup.sendTest")}
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400">{t("admin.emailSetup.apiKey")}</dt>
                <dd className={result.hasApiKey ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                  {result.hasApiKey ? t("admin.emailSetup.present") : t("admin.emailSetup.missing")}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400">{t("admin.emailSetup.fromEmail")}</dt>
                <dd className="break-all font-medium text-slate-900 dark:text-slate-100">{result.fromEmail}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400">{t("admin.emailSetup.domain")}</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-100">{result.domain || "—"}</dd>
              </div>
            </dl>

            {result.isTestDomain && (
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300">
                {t("admin.emailSetup.testDomainWarning")}
              </p>
            )}

            {!result.isTestDomain && (
              <div className="mt-4">
                <StatusLine />
              </div>
            )}
          </div>

          {result.records.length > 0 && (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-200 px-4 py-3 font-medium text-slate-900 dark:border-slate-800 dark:text-slate-100">
                {t("admin.emailSetup.dnsTitle")}
              </div>
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60">
                  <tr>
                    <th className="px-4 py-2 font-medium text-slate-700 dark:text-slate-200">{t("admin.emailSetup.dnsType")}</th>
                    <th className="px-4 py-2 font-medium text-slate-700 dark:text-slate-200">{t("admin.emailSetup.dnsName")}</th>
                    <th className="px-4 py-2 font-medium text-slate-700 dark:text-slate-200">{t("admin.emailSetup.dnsValue")}</th>
                    <th className="px-4 py-2 font-medium text-slate-700 dark:text-slate-200">{t("admin.emailSetup.dnsStatus")}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.records.map((r, i) => (
                    <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{r.type ?? "—"}</td>
                      <td className="break-all px-4 py-2 font-mono text-xs text-slate-700 dark:text-slate-300">{r.name ?? "—"}</td>
                      <td className="break-all px-4 py-2 font-mono text-xs text-slate-700 dark:text-slate-300">{r.value ?? "—"}</td>
                      <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{r.status ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
