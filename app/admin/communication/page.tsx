"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Mail,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";

// ─── Typen ─────────────────────────────────────────────────────────────────────

type EmailStatus = "configured" | "test_sender" | "not_configured";
type MessagingStatus = "active" | "dry_run" | "not_configured";

type Payload = {
  code: "COMMUNICATION_STATUS_READY";
  brand: {
    name: string;
    teamName: string;
    supportEmail: string;
    contactEmail: string;
    publicUrl: string;
    personalSignatureAllowed: false;
    allowedModes: readonly string[];
  };
  email: {
    configured: boolean;
    fromEmail: string;
    isTestSender: boolean;
    status: EmailStatus;
  };
  messaging: {
    provider: string;
    dryRun: boolean;
    status: MessagingStatus;
    note: string;
  };
  rules: {
    noPersonalName: string;
    noColdOutreach: string;
    noRealMessagingWithoutConfig: string;
    allowedCommunication: string;
    impressumExemption: string;
  };
};

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

const EMAIL_STATUS_CONFIG: Record<
  EmailStatus,
  { icon: typeof CheckCircle2; color: string; label: string }
> = {
  configured: {
    icon: CheckCircle2,
    color: "text-green-600 dark:text-green-400",
    label: "Konfiguriert",
  },
  test_sender: {
    icon: AlertTriangle,
    color: "text-amber-600 dark:text-amber-400",
    label: "Test-Absender (onboarding@resend.dev)",
  },
  not_configured: {
    icon: XCircle,
    color: "text-red-600 dark:text-red-500",
    label: "Nicht konfiguriert",
  },
};

const MESSAGING_STATUS_CONFIG: Record<
  MessagingStatus,
  { icon: typeof CheckCircle2; color: string; label: string }
> = {
  active: {
    icon: CheckCircle2,
    color: "text-green-600 dark:text-green-400",
    label: "Aktiv",
  },
  dry_run: {
    icon: AlertTriangle,
    color: "text-amber-600 dark:text-amber-400",
    label: "Dry-Run (simuliert)",
  },
  not_configured: {
    icon: AlertTriangle,
    color: "text-amber-600 dark:text-amber-400",
    label: "Kein Anbieter konfiguriert",
  },
};

// ─── Seiten-Komponente ─────────────────────────────────────────────────────────

export default function CommunicationPage() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const res = await fetch("/api/admin/communication", { cache: "no-store" });
      if (!res.ok) throw new Error("failed");
      const json = await res.json();
      if (json.code !== "COMMUNICATION_STATUS_READY") throw new Error(json.code);
      setData(json as Payload);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="max-w-3xl space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
          />
        ))}
      </div>
    );
  }

  if (failed || !data) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="mb-4 text-slate-500 dark:text-slate-400">
          Kommunikationsdaten konnten nicht geladen werden.
        </p>
        <button
          onClick={load}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  const emailCfg = EMAIL_STATUS_CONFIG[data.email.status];
  const EmailIcon = emailCfg.icon;
  const messagingCfg = MESSAGING_STATUS_CONFIG[data.messaging.status];
  const MessagingIcon = messagingCfg.icon;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Markenkommunikation
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Übersicht aller Kommunikationskanäle. Kein persönlicher Name in
            automatischer Kommunikation.
          </p>
        </div>
        <button
          onClick={load}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Aktualisieren
        </button>
      </div>

      {/* Brand-Absender */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
          <User className="h-5 w-5 text-blue-500" />
          Brand-Absender
        </h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500 dark:text-slate-400">Markenname</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">
              {data.brand.name}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500 dark:text-slate-400">Absendername (Team)</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">
              {data.brand.teamName}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500 dark:text-slate-400">Kontakt-E-Mail</dt>
            <dd className="break-all font-medium text-slate-900 dark:text-slate-100">
              {data.brand.contactEmail}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500 dark:text-slate-400">Support-E-Mail</dt>
            <dd className="break-all font-medium text-slate-900 dark:text-slate-100">
              {data.brand.supportEmail}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500 dark:text-slate-400">Persönliche Signatur</dt>
            <dd className="text-red-600 dark:text-red-400">
              Verboten (PERSONAL_SIGNATURE_ALLOWED = false)
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500 dark:text-slate-400">Erlaubte Modi</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">
              {data.brand.allowedModes.join(", ")}
            </dd>
          </div>
        </dl>
      </section>

      {/* E-Mail-Konfiguration */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
          <Mail className="h-5 w-5 text-blue-500" />
          E-Mail-Konfiguration
        </h2>
        <div className={`mb-3 flex items-center gap-2 ${emailCfg.color}`}>
          <EmailIcon className="h-4 w-4 shrink-0" />
          <span className="text-sm font-medium">{emailCfg.label}</span>
        </div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500 dark:text-slate-400">RESEND_API_KEY</dt>
            <dd
              className={
                data.email.configured
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }
            >
              {data.email.configured ? "vorhanden" : "fehlt"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500 dark:text-slate-400">Absenderadresse</dt>
            <dd className="break-all font-medium text-slate-900 dark:text-slate-100">
              {data.email.fromEmail}
            </dd>
          </div>
        </dl>
        {data.email.isTestSender && (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300">
            Test-Absender aktiv. Für Produktion: eigene Domain in Resend verifizieren
            und <code className="font-mono text-xs">RESEND_FROM_EMAIL</code> setzen.
          </p>
        )}
        {!data.email.configured && (
          <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            E-Mail-Versand deaktiviert. Kontaktanfragen werden gespeichert
            (CONTACT_STORED). Kein Fake-Versand.
          </p>
        )}
      </section>

      {/* Messaging-Konfiguration */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
          <MessageSquare className="h-5 w-5 text-blue-500" />
          Nachrichten-Konfiguration (SMS / WhatsApp)
        </h2>
        <div className={`mb-3 flex items-center gap-2 ${messagingCfg.color}`}>
          <MessagingIcon className="h-4 w-4 shrink-0" />
          <span className="text-sm font-medium">{messagingCfg.label}</span>
        </div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500 dark:text-slate-400">Anbieter</dt>
            <dd className="font-medium text-slate-900 dark:text-slate-100">
              {data.messaging.provider === "none"
                ? "Kein Anbieter (none)"
                : data.messaging.provider}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500 dark:text-slate-400">Dry-Run</dt>
            <dd
              className={
                data.messaging.dryRun
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-slate-700 dark:text-slate-300"
              }
            >
              {data.messaging.dryRun ? "Ja (simuliert)" : "Nein"}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          {data.messaging.note}
        </p>
      </section>

      {/* Kommunikations-Regeln */}
      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-950/20">
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-blue-900 dark:text-blue-100">
          <ShieldCheck className="h-5 w-5 text-blue-500" />
          Kommunikations-Regeln
        </h2>
        <ul className="space-y-2 text-sm">
          {Object.values(data.rules).map((rule, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              <span className="text-blue-900 dark:text-blue-200">{rule}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Erlaubte Prozesse */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">
          Erlaubte automatische Prozesse
        </h2>
        <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          {[
            "Kontaktformular-Eingangsbestätigung (Inbound)",
            "Trial-Anmeldungs-Bestätigung (Transactional)",
            "Onboarding nach Registrierung (Transactional)",
            "Testpraxis-Ablauf-Begleitung (Transactional)",
            "Interne Admin-Hinweise (intern)",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
          Alle anderen automatischen Prozesse (Kaltakquise, Marketing-E-Mails
          ohne Einverständnis) sind verboten.
        </p>
      </section>
    </div>
  );
}
