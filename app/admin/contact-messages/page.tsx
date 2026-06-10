"use client";

import { useEffect, useState } from "react";
import { Mail, Trash2, Send } from "lucide-react";
import toast from "react-hot-toast";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  locale: string | null;
  status: string | null;
  is_test: boolean;
  created_at: string;
};

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [testEmailSending, setTestEmailSending] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/contact-messages");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages ?? []);
      } else {
        toast.error("Laden fehlgeschlagen.");
      }
    } catch {
      toast.error("Netzwerkfehler.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function deleteMessage(id: string) {
    const res = await fetch(`/api/admin/contact-messages/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("Nachricht gelöscht.");
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } else {
      toast.error("Löschen fehlgeschlagen.");
    }
  }

  async function sendTestEmail() {
    setTestEmailSending(true);
    try {
      const res = await fetch("/api/admin/test-email", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        toast.success(`Test-E-Mail gesendet an ${data.to}`);
      } else {
        toast.error(`E-Mail fehlgeschlagen: ${data.error ?? "Unbekannter Fehler"}`);
      }
    } catch {
      toast.error("Netzwerkfehler beim Test-E-Mail-Versand.");
    } finally {
      setTestEmailSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Mail className="h-6 w-6 text-slate-500" />
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Kontakt-Nachrichten
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Eingehende Anfragen über das Kontaktformular
            </p>
          </div>
        </div>
        <button
          onClick={sendTestEmail}
          disabled={testEmailSending}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          title="Test-E-Mail an Admin senden"
        >
          <Send className="h-4 w-4" />
          {testEmailSending ? "Wird gesendet…" : "Test admin email"}
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Wird geladen…</p>
      ) : messages.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500">Noch keine Kontaktnachrichten vorhanden.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-xl border px-5 py-4 ${
                msg.is_test
                  ? "border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10"
                  : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {msg.name}
                    </span>
                    {msg.is_test && (
                      <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-400">
                        TEST
                      </span>
                    )}
                    {msg.locale && (
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                        {msg.locale}
                      </span>
                    )}
                  </div>
                  <a
                    href={`mailto:${msg.email}`}
                    className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {msg.email}
                  </a>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-400">
                    {msg.message}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-600">
                    {new Date(msg.created_at).toLocaleString("de-DE")}
                    {msg.status && ` · Status: ${msg.status}`}
                  </p>
                </div>
                <button
                  onClick={() => deleteMessage(msg.id)}
                  className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                  title="Nachricht löschen"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
