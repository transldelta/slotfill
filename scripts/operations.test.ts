import { test } from "node:test";
import assert from "node:assert/strict";
import { runSecurityCheck, assertNoSecretsInResponse } from "../lib/security-agent";
import {
  generateMaintenanceTasks,
  detectCriticalIssues,
} from "../lib/operations-agent";

// Hinweis: runOperationsCheck() greift auf die DB zu und wird zur Laufzeit
// bzw. per Cron geprüft; hier werden die reinen, hermetischen Teile getestet.

test("Security-Score liegt zwischen 0 und 100 und ist bei sicherer Basis nicht kritisch", () => {
  process.env.ADMIN_EMAILS = "admin@example.de";
  delete process.env.MESSAGING_PROVIDER; // -> none
  const r = runSecurityCheck();
  assert.ok(r.score >= 0 && r.score <= 100);
  assert.notEqual(r.status, "critical");
});

test("MESSAGING_PROVIDER=none / dry-run gilt als sicher", () => {
  process.env.ADMIN_EMAILS = "admin@example.de";
  delete process.env.MESSAGING_PROVIDER;
  const r = runSecurityCheck();
  assert.ok(r.findings.some((f) => f.code === "MESSAGING_SAFE"));
});

test("assertNoSecretsInResponse: erkennt Secrets, lässt saubere Objekte durch", () => {
  assert.equal(assertNoSecretsInResponse({ ok: true, count: 5 }), true);
  assert.equal(assertNoSecretsInResponse({ key: "sk_test_123" }), false);
  assert.equal(assertNoSecretsInResponse({ nested: { t: "whsec_abc" } }), false);
});

test("Safe Maintenance / Tasks: kritisch nicht autoExecutable, Report autoExecutable", () => {
  const tasks = generateMaintenanceTasks([
    { level: "critical", code: "CRON_SECRET_MISSING" },
  ]);
  assert.equal(
    tasks.find((t) => t.code === "CRON_SECRET_MISSING")?.autoExecutable,
    false,
  );
  assert.equal(
    tasks.find((t) => t.code === "GENERATE_REPORT")?.autoExecutable,
    true,
  );
});

test("detectCriticalIssues filtert nur kritische Findings", () => {
  const crit = detectCriticalIssues([
    { level: "warning", code: "X" },
    { level: "critical", code: "Y" },
  ]);
  assert.equal(crit.length, 1);
  assert.equal(crit[0].code, "Y");
});
