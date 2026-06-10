"use client";

/**
 * /admin/ceo-launch – CEO Delegated Launch Operations
 *
 * Internes Dashboard. Nur für Admin-Zugänge.
 * KEIN Auto-Versand. Alle Aktionen erfordern Betreiber-Freigabe.
 * Keine Secrets in der Anzeige. Nur Read + Copy.
 */

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Copy,
  ExternalLink,
  Globe,
  Inbox,
  RefreshCw,
  Rocket,
  Shield,
  XCircle,
  Zap,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Typen ────────────────────────────────────────────────────────────────────

type DeptStatus = "ready" | "needs_review" | "blocked";
type Priority = "high" | "medium" | "low";
type CheckStatus = "ok" | "warn" | "error";

type Department = {
  id: string;
  name: string;
  status: DeptStatus;
  next_task: string;
  reason: string;
  priority: Priority;
  needs_approval: boolean;
};

type OutreachText = {
  id: string;
  label: string;
  lang: "de" | "en";
  text: string;
};

type DailyTask = {
  order: number;
  task: string;
  link: string | null;
  section: string;
};

type RecentLead = {
  type: "contact" | "booking";
  id: string;
  name: string | null;
  email: string | null;
  created_at: string;
  status: string | null;
  note: string | null;
};

type LaunchOverview = {
  code: string;
  generated_at: string;
  launch_live: boolean;
  canonical_url: string;
  launch_de: string;
  launch_en: string;
  share_de: string;
  share_en: string;
  public_launch_de: string;
  public_launch_en: string;
  booking_demo: string;
  sitemap_url: string;
  real_contacts: number;
  test_contacts: number;
  real_bookings: number;
  test_bookings: number;
  last_real_contact_at: string | null;
  last_real_booking_at: string | null;
  departments: Department[];
  outreach_texts: OutreachText[];
  recent_leads: RecentLead[];
  daily_tasks: DailyTask[];
};

type QaCheck = {
  id: string;
  label: string;
  url: string;
  expected: string;
  actual: string;
  status: CheckStatus;
  detail: string | null;
};

type QaResult = {
  code: string;
  overall_status: CheckStatus;
  ok_count: number;
  warn_count: number;
  error_count: number;
  total: number;
  checks: QaCheck[];
  checked_at: string;
};

// ─── Compliance-Checkliste (statisch) ────────────────────────────────────────

const COMPLIANCE_ITEMS = [
  "Keine Fake-Kunden oder Fake-Testimonials sichtbar",
  "Keine erfundenen Umsatzzahlen kommuniziert",
  "Keine übertriebenen Versprechen (z. B. 'garantiert mehr Patienten')",
  "Legal-Seiten erreichbar (Impressum, Datenschutz, AGB, AVV)",
  "AVV-Hinweis: auf Anfrage bereitgestellt (nicht automatisch versendet)",
  "Keine medizinische Beratung behauptet oder angeboten",
  "Keine automatische SMS/WhatsApp ohne Aktivierung durch Praxis",
  "Stripe ist integriert aber noch nicht aktiviert – Hinweis auf der Preisseite",
  "Alle Texte auf Landing-Seiten: ehrlich, ohne Garantien",
  "Status 'Öffentlicher Soft Launch – keine zahlenden Kunden' korrekt kommuniziert",
];

// ─── SEO-Checkliste (statisch, manuell markierbar via localStorage) ───────────

const SEO_ITEMS = [
  { id: "gsc_domain", label: "Google Search Console: Domain clinicslothub.com bestätigt ✓ (erledigt 10.06.2026)" },
  { id: "gsc_sitemap", label: "Google Search Console: Sitemap eingetragen – ~160 Seiten erkannt ✓ (erledigt 10.06.2026)" },
  { id: "bing_webmaster", label: "Bing Webmaster Tools: Domain + Sitemap eingereicht ✓ (erledigt 10.06.2026)" },
  { id: "canonical_set", label: "Canonical-Tag auf allen Seiten: clinicslothub.com ✓ (automatisch, bereits aktiv)" },
  { id: "hreflang_set", label: "Hreflang auf allen Locale-Seiten vorhanden ✓ (automatisch, bereits aktiv)" },
  { id: "robots_accessible", label: "robots.txt erreichbar ✓ (prüfbar über QA-Check)" },
  { id: "sitemap_accessible", label: "Sitemap erreichbar ✓ (prüfbar über QA-Check)" },
  { id: "og_tags", label: "OG-Tags (Title, Description, Image) auf Launch-Seiten vorhanden ✓ (bereits aktiv)" },
];

// Standardwerte: bekannte erledigte Punkte – werden beim ersten Besuch vorausgefüllt
const SEO_DEFAULTS: Record<string, boolean> = {
  gsc_domain: true,       // Google Domain bestätigt 10.06.2026
  gsc_sitemap: true,      // Google Sitemap eingetragen, ~160 Seiten erkannt
  bing_webmaster: true,   // Bing Sitemap eingereicht 10.06.2026
  canonical_set: true,    // automatisch aktiv
  hreflang_set: true,     // automatisch aktiv
  robots_accessible: true, // via QA-Check bestätigt
  sitemap_accessible: true, // via QA-Check bestätigt
  og_tags: true,          // automatisch aktiv
};

// ─── Antwort-Vorlage für Leads ────────────────────────────────────────────────

const REPLY_TEMPLATE_DE = `Guten Tag,

vielen Dank für Ihre Anfrage. Ich freue mich über Ihr Interesse an ClinicSlotHub.

Gerne beantworte ich Ihre Fragen schriftlich – damit ich Ihre Anforderungen sauber prüfen kann, wäre es hilfreich, wenn Sie mir kurz mitteilen würden:
- Welche Art von Praxis betreiben Sie?
- Wie viele Terminanfragen erhalten Sie ungefähr pro Woche?
- Was ist Ihr größtes Problem mit dem aktuellen Prozess?

Keine sensiblen Patientendaten bitte – nur allgemeine Informationen zur Praxis.

Ich melde mich zeitnah zurück.

Mit freundlichen Grüßen`;

const REPLY_TEMPLATE_EN = `Dear [Name],

Thank you for your inquiry. I'm glad to hear about your interest in ClinicSlotHub.

Happy to answer your questions in writing. To better understand your needs, it would be helpful if you could briefly share:
- What type of practice do you run?
- How many appointment requests do you receive approximately per week?
- What is your biggest challenge with the current process?

No sensitive patient data please — just general information about your practice.

I'll get back to you promptly.

Best regards`;

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

function copyText(text: string, label: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success(`${label} kopiert!`))
    .catch(() => toast.error("Kopieren fehlgeschlagen"));
}

function fmtDate(iso: string | null): string {
  if (!iso) return "–";
  try {
    return new Date(iso).toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Berlin",
    });
  } catch {
    return iso;
  }
}

const DEPT_STATUS_STYLE: Record<DeptStatus, string> = {
  ready: "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800",
  needs_review: "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800",
  blocked: "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800",
};

const DEPT_STATUS_ICON: Record<DeptStatus, React.ReactNode> = {
  ready: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  needs_review: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  blocked: <XCircle className="h-4 w-4 text-red-500" />,
};

const DEPT_STATUS_LABEL: Record<DeptStatus, string> = {
  ready: "Bereit",
  needs_review: "Prüfen",
  blocked: "Blockiert",
};

const PRIORITY_BADGE: Record<Priority, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  low: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
};

const PRIORITY_LABEL: Record<Priority, string> = {
  high: "Hoch",
  medium: "Mittel",
  low: "Niedrig",
};

const QA_STATUS_STYLE: Record<CheckStatus, string> = {
  ok: "text-green-600 dark:text-green-400",
  warn: "text-amber-600 dark:text-amber-400",
  error: "text-red-600 dark:text-red-500",
};

const QA_STATUS_BG: Record<CheckStatus, string> = {
  ok: "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800",
  warn: "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800",
  error: "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800",
};

function QaIcon({ status }: { status: CheckStatus }) {
  if (status === "ok") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  if (status === "warn") return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  return <XCircle className="h-4 w-4 text-red-500" />;
}

// ─── Sektion: Tägliches CEO Briefing ─────────────────────────────────────────

function DailyBriefing({ tasks }: { tasks: DailyTask[] }) {
  return (
    <div className="rounded-2xl border-2 border-blue-400 bg-blue-50 p-5 dark:border-blue-700 dark:bg-blue-950/30">
      <div className="mb-3 flex items-center gap-2">
        <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Heute zu tun – max. 3 Aufgaben
        </h2>
        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
          {tasks.length} Aufgaben
        </span>
      </div>
      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
        Das System hat diese Aufgaben priorisiert. Nicht mehr als 3 pro Tag.
        Alles Weitere kann warten.
      </p>
      <div className="space-y-3">
        {tasks.map((t) => (
          <div
            key={t.order}
            className="flex items-start gap-3 rounded-xl border border-blue-200 bg-white p-3 dark:border-blue-800 dark:bg-slate-900"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {t.order}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {t.task}
              </p>
            </div>
            {t.link && (
              <a
                href={t.link}
                target={t.link.startsWith("http") ? "_blank" : undefined}
                rel={t.link.startsWith("http") ? "noopener noreferrer" : undefined}
                className="shrink-0 rounded p-1 text-blue-500 hover:text-blue-700 dark:hover:text-blue-300"
                title="Öffnen"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sektion: Launch-Status ───────────────────────────────────────────────────

function LaunchStatus({ data }: { data: LaunchOverview }) {
  const links = [
    { label: "Launch DE", url: data.launch_de },
    { label: "Launch EN", url: data.launch_en },
    { label: "Share Kit DE", url: data.share_de },
    { label: "Share Kit EN", url: data.share_en },
    { label: "Public Launch Hub DE", url: data.public_launch_de },
    { label: "Demo-Buchungslink", url: data.booking_demo },
    { label: "Sitemap", url: data.sitemap_url },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center gap-2">
        <Globe className="h-5 w-5 text-green-600" />
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          A. Launch-Status
        </h2>
        <span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-300">
          ● Live
        </span>
      </div>

      {/* Lead-Zahlen */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Echte Kontakte", value: data.real_contacts, color: "text-green-600" },
          { label: "Echte Buchungen", value: data.real_bookings, color: "text-blue-600" },
          { label: "Test-Kontakte", value: data.test_contacts, color: "text-slate-500" },
          { label: "Test-Buchungen", value: data.test_bookings, color: "text-slate-500" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-800"
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
        <span>
          Letzte Kontaktanfrage: <strong>{fmtDate(data.last_real_contact_at)}</strong>
        </span>
        <span>
          Letzte Buchungsanfrage: <strong>{fmtDate(data.last_real_booking_at)}</strong>
        </span>
      </div>

      {/* SEO-Status (manuell gepflegt, Stand 10.06.2026) */}
      <div className="mb-4 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2.5 dark:border-teal-800 dark:bg-teal-950/20">
        <p className="mb-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400">
          🔍 SEO &amp; Indexing – Stand 10.06.2026
        </p>
        <div className="space-y-1">
          {[
            "✅ Google Search Console: Sitemap https://clinicslothub.com/sitemap.xml erfolgreich eingereicht",
            "✅ Google erkannte URLs: ~160 Seiten indexiert",
            "✅ Bing Webmaster Tools: Sitemap eingereicht (Verarbeitung läuft / abgeschlossen)",
            "✅ Domain clinicslothub.com bestätigt – kein weiterer Setup-Schritt notwendig",
          ].map((item, i) => (
            <p key={i} className="text-xs text-teal-700 dark:text-teal-400">{item}</p>
          ))}
        </div>
      </div>

      {/* Link-Tabelle */}
      <div className="space-y-2">
        {links.map((l) => (
          <div
            key={l.label}
            className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800"
          >
            <span className="w-40 shrink-0 text-xs font-medium text-slate-600 dark:text-slate-400">
              {l.label}
            </span>
            <code className="flex-1 min-w-0 truncate text-xs text-slate-700 dark:text-slate-300">
              {l.url}
            </code>
            <div className="flex shrink-0 gap-1">
              <button
                onClick={() => copyText(l.url, l.label)}
                title="Kopieren"
                className="rounded p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                title="Öffnen"
                className="rounded p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sektion: Product QA ──────────────────────────────────────────────────────

function ProductQA() {
  const [result, setResult] = useState<QaResult | null>(null);
  const [running, setRunning] = useState(false);

  async function runCheck() {
    setRunning(true);
    try {
      const res = await fetch("/api/admin/ceo-launch/qa-check", {
        method: "POST",
        cache: "no-store",
      });
      const json = await res.json().catch(() => null);
      if (json?.code === "QA_CHECK_DONE") {
        setResult(json);
      } else {
        toast.error("QA-Check fehlgeschlagen");
      }
    } catch {
      toast.error("QA-Check fehlgeschlagen");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div id="qa" className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            B. Product QA
          </h2>
        </div>
        <button
          onClick={runCheck}
          disabled={running}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${running ? "animate-spin" : ""}`} />
          {running ? "Prüft…" : "QA-Check starten"}
        </button>
      </div>

      {!result && !running && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Klick auf &bdquo;QA-Check starten&ldquo; prüft alle öffentlichen Launch-Seiten live.
          Dauert ca. 10–20 Sekunden.
        </p>
      )}

      {running && (
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Überprüfe {10} URLs…
        </div>
      )}

      {result && (
        <>
          {/* Gesamt-Status */}
          <div className={`mb-4 rounded-lg border p-3 ${QA_STATUS_BG[result.overall_status]}`}>
            <div className="flex items-center gap-2">
              <QaIcon status={result.overall_status} />
              <span className={`text-sm font-semibold ${QA_STATUS_STYLE[result.overall_status]}`}>
                {result.overall_status === "ok"
                  ? "Alle Checks bestanden"
                  : result.overall_status === "warn"
                    ? "Warnungen vorhanden"
                    : "Fehler gefunden"}
              </span>
              <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
                ✓ {result.ok_count} / ⚠ {result.warn_count} / ✗ {result.error_count}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Geprüft: {fmtDate(result.checked_at)}
            </p>
          </div>

          {/* Einzelne Checks */}
          <div className="space-y-1.5">
            {result.checks.map((c) => (
              <div
                key={c.id}
                className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800"
              >
                <QaIcon status={c.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-900 dark:text-slate-100">
                    {c.label}
                  </p>
                  {c.detail && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{c.detail}</p>
                  )}
                </div>
                <span className={`shrink-0 text-xs font-mono ${QA_STATUS_STYLE[c.status]}`}>
                  {c.actual}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Sektion: Abteilungen ─────────────────────────────────────────────────────

function DepartmentCards({ departments }: { departments: Department[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center gap-2">
        <ClipboardList className="h-5 w-5 text-purple-600" />
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          C. Abteilungs-Zuweisungen
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {departments.map((d) => (
          <div
            key={d.id}
            className={`rounded-xl border p-3 ${DEPT_STATUS_STYLE[d.status]}`}
          >
            <div className="mb-1.5 flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5">
                {DEPT_STATUS_ICON[d.status]}
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {d.name}
                </span>
              </div>
              <span
                className={`rounded px-1.5 py-0.5 text-xs font-medium ${PRIORITY_BADGE[d.priority]}`}
              >
                {PRIORITY_LABEL[d.priority]}
              </span>
            </div>
            <span
              className={`mb-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                d.status === "ready"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : d.status === "needs_review"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {DEPT_STATUS_LABEL[d.status]}
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              <strong>Aufgabe:</strong> {d.next_task}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{d.reason}</p>
            {d.needs_approval && (
              <p className="mt-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                ⚠ Betreiber-Freigabe erforderlich
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sektion: SEO & Indexing ──────────────────────────────────────────────────

function SeoChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  // localStorage laden – beim ersten Besuch bekannte erledigte Punkte vorausfüllen
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ceo_launch_seo_checks");
      if (saved) {
        setChecked(JSON.parse(saved));
      } else {
        // Erster Besuch: alle bekannten erledigten Punkte als erledigt markieren
        setChecked(SEO_DEFAULTS);
        localStorage.setItem("ceo_launch_seo_checks", JSON.stringify(SEO_DEFAULTS));
      }
    } catch {}
  }, []);

  function toggle(id: string) {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem("ceo_launch_seo_checks", JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  const doneCount = SEO_ITEMS.filter((i) => checked[i.id]).length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center gap-2">
        <Globe className="h-5 w-5 text-teal-600" />
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          D. SEO & Indexing
        </h2>
        <span className="ml-auto rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
          {doneCount}/{SEO_ITEMS.length} erledigt
        </span>
      </div>
      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
        Google/Bing werden NICHT automatisch bedient. Manuell als erledigt markieren.
        Status wird lokal gespeichert.
      </p>
      <div className="space-y-2">
        {SEO_ITEMS.map((item) => (
          <label
            key={item.id}
            className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:hover:bg-slate-750"
          >
            <input
              type="checkbox"
              checked={!!checked[item.id]}
              onChange={() => toggle(item.id)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span
              className={`text-xs ${
                checked[item.id]
                  ? "line-through text-slate-400"
                  : "text-slate-700 dark:text-slate-300"
              }`}
            >
              {item.label}
            </span>
          </label>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <a
          href="https://search.google.com/search-console"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-teal-300 px-3 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-50 dark:border-teal-700 dark:text-teal-400"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Google Search Console öffnen
        </a>
        <a
          href="https://www.bing.com/webmasters"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Bing Webmaster Tools
        </a>
      </div>
    </div>
  );
}

// ─── Sektion: Outreach Preparation ───────────────────────────────────────────

function OutreachPrep({ texts }: { texts: OutreachText[] }) {
  const [langFilter, setLangFilter] = useState<"de" | "en" | "all">("de");
  const filtered =
    langFilter === "all" ? texts : texts.filter((t) => t.lang === langFilter);

  return (
    <div id="outreach" className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-3 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-indigo-600" />
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          E. Outreach-Vorbereitung
        </h2>
      </div>
      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
        🚫 <strong>Kein Auto-Versand.</strong> Alle Texte sind Vorlagen – nur manuell und nur
        an passende persönliche Kontakte weiterleiten.
        Betreiber-Freigabe erforderlich.
      </div>

      {/* Copy-Buttons für Buchungslinks */}
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { label: "Buchungslink DE", text: "https://clinicslothub.com/de/launch" },
          { label: "Buchungslink EN", text: "https://clinicslothub.com/en/launch" },
          { label: "Share-Link DE", text: "https://clinicslothub.com/de/share" },
          { label: "Antwortvorlage DE", text: REPLY_TEMPLATE_DE },
          { label: "Antwortvorlage EN", text: REPLY_TEMPLATE_EN },
        ].map((b) => (
          <button
            key={b.label}
            onClick={() => copyText(b.text, b.label)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <Copy className="h-3.5 w-3.5" />
            {b.label}
          </button>
        ))}
      </div>

      {/* Sprach-Filter */}
      <div className="mb-3 flex gap-2">
        {(["de", "en", "all"] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLangFilter(l)}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
              langFilter === l
                ? "bg-indigo-600 text-white"
                : "border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400"
            }`}
          >
            {l === "de" ? "Deutsch" : l === "en" ? "English" : "Alle"}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t.label}
              </span>
              <button
                onClick={() => copyText(t.text, t.label)}
                className="flex items-center gap-1 rounded border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400"
              >
                <Copy className="h-3 w-3" />
                Kopieren
              </button>
            </div>
            <pre className="whitespace-pre-wrap break-words font-sans text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {t.text}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sektion: Lead Handling ───────────────────────────────────────────────────

function LeadHandling({
  leads,
  realContacts,
  realBookings,
}: {
  leads: RecentLead[];
  realContacts: number;
  realBookings: number;
}) {
  return (
    <div id="lead-handling" className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center gap-2">
        <Inbox className="h-5 w-5 text-green-600" />
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          F. Lead Handling
        </h2>
        <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold ${
          realContacts + realBookings > 0
            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
            : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
        }`}>
          {realContacts + realBookings} echte Anfragen
        </span>
      </div>

      {/* Antwort-Hinweis */}
      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400">
        💬 Keine sensiblen Patientendaten per Chat anfordern.
        Telefonanfragen schriftlich umleiten:
        <span className="ml-1 font-medium">&bdquo;Gerne zuerst kurz schriftlich, damit ich Ihre Anforderungen sauber prüfen kann.&ldquo;</span>
      </div>

      {/* Vorbereitete Antwortvorlagen */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => copyText(REPLY_TEMPLATE_DE, "Antwortvorlage DE")}
          className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400"
        >
          <Copy className="h-3.5 w-3.5" />
          Antwortvorlage DE kopieren
        </button>
        <button
          onClick={() => copyText(REPLY_TEMPLATE_EN, "Antwortvorlage EN")}
          className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400"
        >
          <Copy className="h-3.5 w-3.5" />
          Antwortvorlage EN kopieren
        </button>
        <a
          href="/admin/booking-requests"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Buchungsanfragen öffnen
        </a>
        <a
          href="/admin/contact-messages"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Kontaktnachrichten öffnen
        </a>
      </div>

      {leads.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Noch keine echten Leads eingegangen. Sobald Anfragen kommen, erscheinen sie hier.
        </p>
      ) : (
        <div className="space-y-2">
          {leads.map((l) => (
            <div
              key={`${l.type}-${l.id}`}
              className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-800"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                        l.type === "booking"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                      }`}
                    >
                      {l.type === "booking" ? "Buchungsanfrage" : "Kontaktnachricht"}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {fmtDate(l.created_at)}
                    </span>
                    {l.status && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        {l.status}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs font-medium text-slate-900 dark:text-slate-100">
                    {l.name ?? "Unbekannt"}
                    {l.email ? ` · ${l.email}` : ""}
                  </p>
                  {l.note && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {l.note}
                      {l.note.length >= 100 ? "…" : ""}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sektion: Compliance & Trust ──────────────────────────────────────────────

function ComplianceTrust() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center gap-2">
        <Shield className="h-5 w-5 text-slate-600" />
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          G. Compliance & Trust
        </h2>
        <span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-300">
          {COMPLIANCE_ITEMS.length} Punkte
        </span>
      </div>
      <div className="space-y-1.5">
        {COMPLIANCE_ITEMS.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-2 rounded-lg border border-green-100 bg-green-50 px-3 py-2 dark:border-green-900/30 dark:bg-green-950/10"
          >
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
            <span className="text-xs text-slate-700 dark:text-slate-300">{item}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {[
          { label: "Impressum", href: "/impressum" },
          { label: "Datenschutz", href: "/datenschutz" },
          { label: "AGB", href: "/agb" },
          { label: "AVV", href: "/avv" },
        ].map((p) => (
          <a
            key={p.href}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400"
          >
            <ExternalLink className="h-3 w-3" />
            {p.label}
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── Sektion: Analytics / Reporting ──────────────────────────────────────────

function AnalyticsReporting({ data }: { data: LaunchOverview }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-slate-600" />
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          H. Analytics / Reporting
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Echte Kontaktanfragen", value: data.real_contacts },
          { label: "Echte Buchungsanfragen", value: data.real_bookings },
          { label: "Test-Daten gesamt", value: data.test_contacts + data.test_bookings },
          {
            label: "Letzter Lead",
            value:
              data.last_real_contact_at || data.last_real_booking_at
                ? "vorhanden"
                : "–",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-800"
          >
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {s.value}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        Externe Analytics (Google Analytics / Plausible) optional einrichten.
        Kein Tracking-Cookie ohne Cookie-Consent. Aktuell kein Analytics aktiv – kein Launch-Blocker.
      </p>
    </div>
  );
}

// ─── Haupt-Seite ──────────────────────────────────────────────────────────────

export default function CeoLaunchPage() {
  const [data, setData] = useState<LaunchOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/ceo-launch", { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!res.ok || json?.code !== "CEO_LAUNCH_READY") {
        setError(true);
        return;
      }
      setData(json);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Rocket className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              CEO Launch Operations
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Internes Delegations-Dashboard · Nur für Admin · Kein Auto-Versand · Approval-basiert
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Aktualisieren
        </button>
      </div>

      {/* Sicherheitshinweis */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
        🚫 Kein Auto-Versand · 🚫 Kein Spam · 🚫 Keine Kaltakquise · 🚫 Keine Fake-Zahlen ·
        ✅ Alle Aktionen erfordern Betreiber-Freigabe
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Lade Launch-Daten…</span>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            Launch-Daten konnten nicht geladen werden.
          </p>
          <button
            onClick={load}
            className="mt-2 text-sm text-red-600 underline hover:text-red-700 dark:text-red-400"
          >
            Erneut versuchen
          </button>
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* H. Tägliches CEO Briefing (immer oben) */}
          <DailyBriefing tasks={data.daily_tasks} />

          {/* A. Launch-Status */}
          <LaunchStatus data={data} />

          {/* B. Product QA */}
          <ProductQA />

          {/* C. Abteilungen */}
          <DepartmentCards departments={data.departments} />

          {/* D. SEO & Indexing */}
          <SeoChecklist />

          {/* E. Outreach-Vorbereitung */}
          <OutreachPrep texts={data.outreach_texts} />

          {/* F. Lead Handling */}
          <LeadHandling
            leads={data.recent_leads}
            realContacts={data.real_contacts}
            realBookings={data.real_bookings}
          />

          {/* G. Compliance & Trust */}
          <ComplianceTrust />

          {/* H. Analytics */}
          <AnalyticsReporting data={data} />

          {/* Footer */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <strong>Maximal-3-Regel:</strong> Das System priorisiert täglich max. 3 Aufgaben.
            Mehr muss der Betreiber nicht tun. Alles Weitere ist dokumentiert und wartet.
            Zuletzt geladen: {fmtDate(data.generated_at)}
          </div>
        </>
      )}
    </div>
  );
}
