"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { formatBerlin } from "@/lib/datetime";

// ─── Typen ────────────────────────────────────────────────────────────────────

type GoLiveStatus = "ready" | "warning" | "blocking";

type GoLiveCheckItem = {
  id: string;
  label: string;
  status: GoLiveStatus;
  note: string;
};

type GoLiveSection = {
  sectionId: string;
  title: string;
  status: GoLiveStatus;
  summary: string;
  checks: GoLiveCheckItem[];
  findings: string[];
};

type GoLiveTask = {
  priority: "blocking" | "important" | "recommended";
  sectionId: string;
  title: string;
  description: string;
  manualOnly: true;
  autoExecutable: false;
  link: string | null;
};

type GoLiveChecklistItem = {
  id: string;
  label: string;
  done: boolean | null;
  category: "tech" | "legal" | "content" | "ops";
};

type Payload = {
  code: "GO_LIVE_READINESS_READY";
  status: GoLiveStatus;
  score: number;
  sections: GoLiveSection[];
  tasks: GoLiveTask[];
  checklist: GoLiveChecklistItem[];
  agentSummary: {
    marketing: string;
    ceo: string;
    operations: string;
    security: string;
  };
  generatedAt: string;
};

// ─── Stil-Konstanten ──────────────────────────────────────────────────────────

const STATUS_STYLE: Record<GoLiveStatus, string> = {
  ready: "text-green-600 dark:text-green-400",
  warning: "text-amber-600 dark:text-amber-400",
  blocking: "text-red-600 dark:text-red-500",
};

const STATUS_BG: Record<GoLiveStatus, string> = {
  ready: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800",
  warning: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
  blocking: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
};

const STATUS_ICON: Record<GoLiveStatus, React.ReactNode> = {
  ready: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  blocking: <XCircle className="h-4 w-4 text-red-500" />,
};

const STATUS_LABEL: Record<GoLiveStatus, string> = {
  ready: "Bereit",
  warning: "Prüfen",
  blocking: "Blockiert",
};

const PRIORITY_STYLE: Record<GoLiveTask["priority"], string> = {
  blocking:
    "bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  important:
    "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  recommended:
    "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
};

const PRIORITY_LABEL: Record<GoLiveTask["priority"], string> = {
  blocking: "Blockierend",
  important: "Wichtig",
  recommended: "Empfohlen",
};

const CATEGORY_LABEL: Record<GoLiveChecklistItem["category"], string> = {
  tech: "Technik",
  legal: "Legal",
  content: "Inhalt",
  ops: "Betrieb",
};

const SCORE_COLOR = (score: number): string => {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-500";
};

// ─── Sektion-Komponente ───────────────────────────────────────────────────────

function SectionCard({ section }: { section: GoLiveSection }) {
  const [open, setOpen] = useState(section.status !== "ready");

  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${STATUS_BG[section.status]}`}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/60 text-sm font-bold text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
            {section.sectionId}
          </span>
          <div>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {section.title}
            </span>
            <span className={`ml-2 text-xs font-medium ${STATUS_STYLE[section.status]}`}>
              {STATUS_LABEL[section.status]}
            </span>
          </div>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-slate-500" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
        )}
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {section.summary}
          </p>
          <ul className="space-y-2">
            {section.checks.map((check) => (
              <li
                key={check.id}
                className="flex items-start gap-2 rounded-lg bg-white/60 px-3 py-2 dark:bg-slate-900/40"
              >
                <span className="mt-0.5 shrink-0">{STATUS_ICON[check.status]}</span>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {check.label}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {check.note}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Checklisten-Komponente ───────────────────────────────────────────────────

function ChecklistCard({ items }: { items: GoLiveChecklistItem[] }) {
  const grouped = items.reduce<Record<string, GoLiveChecklistItem[]>>(
    (acc, item) => {
      const cat = item.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {},
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
        <ShieldCheck className="h-5 w-5 text-blue-500" />
        Go-Live-Checkliste (13 Punkte)
      </h2>
      <p className="mb-4 text-xs text-amber-700 dark:text-amber-400">
        ⚠ Alle Punkte müssen manuell vor dem Go-Live bestätigt werden. Keine automatische Freigabe.
      </p>
      <div className="space-y-4">
        {(["tech", "content", "ops", "legal"] as const).map((cat) => {
          const catItems = grouped[cat] ?? [];
          if (catItems.length === 0) return null;
          const doneCount = catItems.filter((i) => i.done === true).length;
          const pendingCount = catItems.filter((i) => i.done === null).length;
          return (
            <div key={cat}>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {CATEGORY_LABEL[cat]}
                </span>
                <span className="text-xs text-slate-400">
                  {doneCount}/{catItems.length} Dateien gefunden · {pendingCount} manuell
                </span>
              </div>
              <ul className="space-y-1.5">
                {catItems.map((item) => (
                  <li key={item.id} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 shrink-0">
                      {item.done === true ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : item.done === false ? (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-slate-400" />
                      )}
                    </span>
                    <span
                      className={
                        item.done === true
                          ? "text-slate-700 dark:text-slate-300"
                          : item.done === false
                            ? "text-red-700 dark:text-red-400"
                            : "text-slate-500 dark:text-slate-400"
                      }
                    >
                      {item.label}
                      {item.done === null && (
                        <span className="ml-1 text-xs italic">(manuell bestätigen)</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Aufgaben-Komponente ──────────────────────────────────────────────────────

function TaskList({ tasks }: { tasks: GoLiveTask[] }) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-800 dark:bg-green-950/30">
        <p className="text-sm font-medium text-green-700 dark:text-green-400">
          ✓ Keine offenen Go-Live-Aufgaben gefunden.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLE[task.priority]}`}>
              {PRIORITY_LABEL[task.priority]}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              Abschnitt {task.sectionId}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              Nur manuell
            </span>
          </div>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {task.title}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {task.description}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Haupt-Seite ──────────────────────────────────────────────────────────────

export default function GoLivePage() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "sections" | "tasks" | "checklist" | "agents"
  >("sections");

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const res = await fetch("/api/admin/go-live", { cache: "no-store" });
      if (!res.ok) throw new Error("go-live failed");
      const json = await res.json();
      setData(json);
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
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
          />
        ))}
      </div>
    );
  }

  if (failed || !data) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="mb-4 text-slate-500 dark:text-slate-400">
          Go-Live-Daten konnten nicht geladen werden.
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

  const blockingCount = data.sections.filter((s) => s.status === "blocking").length;
  const warningCount = data.sections.filter((s) => s.status === "warning").length;
  const readyCount = data.sections.filter((s) => s.status === "ready").length;

  const tabs = [
    { id: "sections" as const, label: "Abschnitte A–I", count: data.sections.length },
    { id: "tasks" as const, label: "Aufgaben", count: data.tasks.length },
    { id: "checklist" as const, label: "Checkliste", count: data.checklist.length },
    { id: "agents" as const, label: "Agenten-Status" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Go-Live-Readiness
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Analysiert 9 Bereiche vor dem Launch. Alle Aufgaben sind manuell.
            Keine automatischen Aktionen.
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

      {/* Score-Karte */}
      <div className={`rounded-2xl border p-5 ${STATUS_BG[data.status]}`}>
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Go-Live-Score
            </div>
            <div className={`text-4xl font-bold ${SCORE_COLOR(data.score)}`}>
              {data.score}
              <span className="text-xl font-normal text-slate-400">/100</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{blockingCount}</div>
              <div className="text-xs text-slate-500">Blockierend</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-amber-600">{warningCount}</div>
              <div className="text-xs text-slate-500">Zu prüfen</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{readyCount}</div>
              <div className="text-xs text-slate-500">Bereit</div>
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className={`text-sm font-semibold ${STATUS_STYLE[data.status]}`}>
              {data.status === "ready"
                ? "✓ Go-Live möglich"
                : data.status === "warning"
                  ? "⚠ Punkte prüfen"
                  : "✗ Blockierende Punkte"}
            </div>
            <div className="mt-0.5 text-xs text-slate-400">
              {formatBerlin(data.generatedAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Sicherheits-Hinweis */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300">
        <strong>Wichtig:</strong> Alle Aufgaben sind{" "}
        <strong>manuell</strong>. Keine automatischen Aktionen, keine echten
        Nachrichten, keine echten Zahlungen, keine Kaltakquise. Messaging bleibt
        sicher bis bewusst konfiguriert.
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-0 dark:border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {tab.label}
            {"count" in tab && tab.count !== undefined && (
              <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab-Inhalt */}
      {activeTab === "sections" && (
        <div className="space-y-3">
          {data.sections.map((section) => (
            <SectionCard key={section.sectionId} section={section} />
          ))}
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {data.tasks.length === 0
              ? "Keine offenen Aufgaben."
              : `${data.tasks.length} Aufgabe(n) – alle manuell, keine automatische Ausführung.`}
          </p>
          <TaskList tasks={data.tasks} />
        </div>
      )}

      {activeTab === "checklist" && (
        <ChecklistCard items={data.checklist} />
      )}

      {activeTab === "agents" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
              Einbezogene Agenten
            </h2>
            <div className="space-y-3">
              {Object.entries(data.agentSummary).map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {key === "marketing"
                      ? "Marketing-Agent"
                      : key === "ceo"
                        ? "CEO-Agent"
                        : key === "operations"
                          ? "Operations-Agent"
                          : "Security-Agent"}
                  </p>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Die Agenten analysieren und empfehlen nur. Sie senden keine
              Nachrichten, kontaktieren keine Praxen und führen keine
              automatischen Aktionen aus.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
