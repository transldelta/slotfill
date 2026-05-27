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
