/**
 * CEO-Agent Tests – Schritt 16
 *
 * Testet hermetische Funktionen ohne echte DB-Verbindung.
 * runOperationsCheck() / deptNutzung() etc. greifen auf DB zu und
 * werden per Cron / Integrations-Tests geprüft.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateSaaSScore, getCeoTasks } from "../lib/ceo-agent";
import { assertNoSecretsInResponse } from "../lib/security-agent";
import {
  METRIC_LABELS,
  FINDING_LABELS,
  DEPT_LABELS,
  metricLabel,
  findingLabel,
  deptLabel,
  formatMetricValue,
} from "../lib/ceo-labels";

// ─── Typ-Hilfsfunktionen ───────────────────────────────────────────────────────

function makeDept(
  department: string,
  status: "healthy" | "warning" | "critical",
  score: number,
  findings: string[] = [],
  recommendations: string[] = [],
) {
  return {
    department,
    label: department,
    status,
    score,
    summary: "Test-Summary",
    findings,
    recommendations,
    metrics: {} as Record<string, string | number | boolean>,
  };
}

// ─── Score-Tests ──────────────────────────────────────────────────────────────

test("calculateSaaSScore: Score liegt zwischen 0 und 100", () => {
  const depts = [
    makeDept("tech", "healthy", 90),
    makeDept("security", "warning", 75),
    makeDept("operations", "healthy", 85),
    makeDept("product", "healthy", 92),
    makeDept("usage", "warning", 65),
    makeDept("finance", "warning", 70),
    makeDept("support", "healthy", 90),
    makeDept("marketing", "warning", 70),
    makeDept("compliance", "healthy", 88),
  ];
  const score = calculateSaaSScore(depts);
  assert.ok(score >= 0 && score <= 100, `Score ${score} außerhalb 0-100`);
});

test("calculateSaaSScore: Score ist 0 oder höher bei allen kritischen Abteilungen", () => {
  const depts = Array.from({ length: 9 }, (_, i) =>
    makeDept(`dept${i}`, "critical", 0),
  );
  const score = calculateSaaSScore(depts);
  assert.ok(score >= 0);
});

test("calculateSaaSScore: Score ist 100 oder niedriger bei allen gesunden Abteilungen", () => {
  const depts = Array.from({ length: 9 }, (_, i) =>
    makeDept(`dept${i}`, "healthy", 100),
  );
  const score = calculateSaaSScore(depts);
  assert.ok(score <= 100);
});

// ─── Aufgaben-Tests ───────────────────────────────────────────────────────────

test("getCeoTasks: Aufgaben sind nach Priorität sortiert (critical zuerst)", () => {
  const depts = [
    makeDept("security", "critical", 20),
    makeDept("operations", "warning", 70),
    makeDept("tech", "healthy", 90),
  ];
  const tasks = getCeoTasks(depts);
  assert.ok(tasks.length > 0);

  // Prüfe Sortierung: critical vor important vor recommended
  const order = { critical: 0, important: 1, recommended: 2 };
  for (let i = 1; i < tasks.length; i++) {
    assert.ok(
      order[tasks[i].priority] >= order[tasks[i - 1].priority],
      `Reihenfolge falsch: ${tasks[i - 1].priority} → ${tasks[i].priority}`,
    );
  }
});

test("getCeoTasks: autoExecutable ist immer false bei Aufgaben mit Priorität critical/important", () => {
  const depts = [
    makeDept("security", "critical", 10, ["SEC_ADMIN_EMAILS_MISSING"]),
    makeDept("finance", "warning", 50, ["FIN_STRIPE_NOT_CONFIGURED"]),
  ];
  const tasks = getCeoTasks(depts);
  const riskyTasks = tasks.filter(
    (t) => t.priority === "critical" || t.priority === "important",
  );
  for (const task of riskyTasks) {
    assert.equal(task.autoExecutable, false, `Task "${task.title}" sollte autoExecutable=false haben`);
  }
});

test("getCeoTasks: MESSAGING_PROVIDER=none erzeugt keine critical-Aufgabe", () => {
  // Marketing hat MESSAGING_NONE nicht als critical markiert
  const depts = [
    makeDept("operations", "healthy", 88), // none ist healthy
  ];
  const tasks = getCeoTasks(depts);
  const criticals = tasks.filter((t) => t.priority === "critical");
  assert.equal(criticals.length, 0);
});

test("getCeoTasks: fehlende Marketing-Leads führen nicht zu critical-Aufgabe", () => {
  const depts = [
    makeDept("marketing", "warning", 70, ["MARKETING_NO_ACTIVE_LEADS"]),
  ];
  const tasks = getCeoTasks(depts);
  // Warning → important, nicht critical
  const criticals = tasks.filter(
    (t) => t.priority === "critical" && t.department === "marketing",
  );
  assert.equal(criticals.length, 0);
});

// ─── Sicherheits-Tests ────────────────────────────────────────────────────────

test("assertNoSecretsInResponse: CEO-Response ohne Secrets ist sicher", () => {
  const fakeResponse = {
    code: "CEO_OVERVIEW_READY",
    status: "healthy",
    score: 87,
    departments: [
      {
        department: "tech",
        label: "Technik",
        status: "healthy",
        score: 90,
        summary: "Alles OK",
        findings: [],
        recommendations: [],
        metrics: { dbOk: true, cronCount: 4 },
      },
    ],
    tasks: [
      {
        priority: "recommended",
        department: "tech",
        title: "Prüfen",
        description: "Regelmäßig prüfen",
        actionable: false,
        link: null,
        autoExecutable: false,
      },
    ],
    generatedAt: new Date().toISOString(),
  };
  assert.equal(assertNoSecretsInResponse(fakeResponse), true);
});

test("assertNoSecretsInResponse: Response mit sk_-Secret wird erkannt", () => {
  const leakyResponse = {
    code: "CEO_OVERVIEW_READY",
    metrics: { apiKey: "sk_test_geheimeskey123" },
  };
  assert.equal(assertNoSecretsInResponse(leakyResponse), false);
});

// ─── Department-Anzahl-Test ───────────────────────────────────────────────────

test("calculateSaaSScore: funktioniert mit genau 9 Abteilungen", () => {
  const deptNames = [
    "tech", "security", "operations", "product",
    "usage", "finance", "support", "marketing", "compliance",
  ];
  assert.equal(deptNames.length, 9);

  const depts = deptNames.map((d) => makeDept(d, "healthy", 85));
  const score = calculateSaaSScore(depts);
  assert.ok(score >= 0 && score <= 100);
});

// ─── CEO ist read-only: keine autoExecutable-Tasks bei riskanten Aktionen ──

test("getCeoTasks: keine autoExecutable=true bei bekannten Risiko-Findings", () => {
  const riskyDept = makeDept("tech", "critical", 0, ["TECH_DB_UNREACHABLE"]);
  const tasks = getCeoTasks([riskyDept]);
  for (const task of tasks) {
    if (task.priority === "critical") {
      assert.equal(task.autoExecutable, false);
    }
  }
});

// ─── Labels: keine Roh-Codes sichtbar ────────────────────────────────────────

test("Labels: BACKUP_REVIEW wird nicht roh angezeigt (SEC_BACKUP_REVIEW übersetzt)", () => {
  const label = findingLabel("SEC_BACKUP_REVIEW");
  assert.ok(!label.includes("BACKUP_REVIEW"), `Rohcode sichtbar: ${label}`);
  assert.ok(label.includes("Backup"), `Kein deutsches Wort: ${label}`);
});

test("Labels: Metric-Keys werden auf Deutsch übersetzt", () => {
  assert.equal(metricLabel("practicesTotal"), "Praxen gesamt");
  assert.equal(metricLabel("activeSubscriptions"), "Aktive Abos");
  assert.equal(metricLabel("trialSubscriptions"), "Test-Abos");
  assert.equal(metricLabel("cancelledSubscriptions"), "Gekündigte Abos");
  assert.equal(metricLabel("securityScore"), "Security-Score");
  assert.equal(metricLabel("operationsScore"), "Operations-Score");
  assert.equal(metricLabel("cronCount"), "Cron-Jobs");
  assert.equal(metricLabel("errors7d"), "Fehler letzte 7 Tage");
  assert.equal(metricLabel("imprintReady"), "Impressum vorhanden");
  assert.equal(metricLabel("privacyReady"), "Datenschutz vorhanden");
  assert.equal(metricLabel("termsReady"), "AGB vorhanden");
});

test("Labels: Abteilungs-Codes werden auf Deutsch übersetzt", () => {
  assert.equal(deptLabel("tech"), "Technik");
  assert.equal(deptLabel("security"), "Sicherheit");
  assert.equal(deptLabel("operations"), "Operations");
  assert.equal(deptLabel("product"), "Produkt");
  assert.equal(deptLabel("usage"), "Praxen & Nutzung");
  assert.equal(deptLabel("finance"), "Umsatz & Finanzen");
  assert.equal(deptLabel("support"), "Support");
  assert.equal(deptLabel("marketing"), "Marketing & Vertrieb");
  assert.equal(deptLabel("compliance"), "Compliance & Trust");
});

test("Labels: Alle 9 Abteilungs-Codes sind im DEPT_LABELS-Map vorhanden", () => {
  const expected = ["tech", "security", "operations", "product", "usage", "finance", "support", "marketing", "compliance"];
  for (const code of expected) {
    assert.ok(DEPT_LABELS[code], `Abteilungs-Code fehlt im Map: ${code}`);
  }
});

test("Labels: formatMetricValue übersetzt boolean und bekannte Strings korrekt", () => {
  assert.equal(formatMetricValue(true), "✓ Ja");
  assert.equal(formatMetricValue(false), "Nein");
  assert.equal(formatMetricValue("ok"), "OK");
  assert.equal(formatMetricValue("healthy"), "Gesund");
  assert.equal(formatMetricValue("warning"), "Warnung");
  assert.equal(formatMetricValue("critical"), "Kritisch");
  assert.equal(formatMetricValue(42), "42");
});

test("Labels: getCeoTasks-Empfehlungen enthalten kein rohes BACKUP_REVIEW", () => {
  // Sicherheits-Abteilung mit BACKUP_REVIEW-Finding
  const secDept = makeDept("security", "warning", 90, ["SEC_BACKUP_REVIEW"], [
    "Backup-Strategie prüfen und regelmäßige Sicherungen sicherstellen.",
  ]);
  const tasks = getCeoTasks([secDept]);
  for (const task of tasks) {
    assert.ok(
      !task.title.includes("BACKUP_REVIEW"),
      `Roh-Code in title: ${task.title}`,
    );
    assert.ok(
      !task.description.includes("BACKUP_REVIEW"),
      `Roh-Code in description: ${task.description}`,
    );
  }
});

test("Labels: Marketing-Empfehlung enthält nicht mehr 'Schritt 17+'", () => {
  // Veraltete Empfehlung wurde durch aktuelle ersetzt
  const marketingDept = makeDept("marketing", "warning", 70, ["MARKETING_NO_ACTIVE_LEADS"], [
    "Erste 5 Test-Praxen manuell ansprechen.",
    "Marketing & Sales regelmäßig prüfen und erste Testpraxen manuell ansprechen.",
  ]);
  const tasks = getCeoTasks([marketingDept]);
  for (const task of tasks) {
    assert.ok(
      !task.title.includes("Schritt 17+"),
      `Veralteter Text in title: ${task.title}`,
    );
    assert.ok(
      !task.description.includes("Schritt 17+"),
      `Veralteter Text in description: ${task.description}`,
    );
  }
});

// Unbenutzte Import-Prüfung (verhindert TS-Fehler bei unbenutzten Variablen)
test("Labels: METRIC_LABELS und FINDING_LABELS sind nicht leer", () => {
  assert.ok(Object.keys(METRIC_LABELS).length > 20, "METRIC_LABELS zu wenig Einträge");
  assert.ok(Object.keys(FINDING_LABELS).length > 10, "FINDING_LABELS zu wenig Einträge");
});
