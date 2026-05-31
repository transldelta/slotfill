/**
 * Go-Live-Readiness-Agent Tests – Schritt 21
 *
 * Prüft hermetisch (ohne echte DB-Verbindung):
 * - 9 Abschnitte A–I vorhanden
 * - Keine automatische Kaltakquise
 * - Kein automatischer SMS/WhatsApp-Versand
 * - Keine Fake-Testimonials
 * - Alle Aufgaben: manualOnly=true, autoExecutable=false
 * - API-Antworten frei von Secrets
 * - docs/FIRST_TEST_PRACTICE.md vorhanden
 * - Admin-Checkliste enthält 13 Punkte
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  getGoLiveSections,
  getGoLiveTasks,
  getGoLiveChecklist,
  calculateGoLiveScore,
  runGoLiveCheck,
} from "../lib/go-live-agent";
import { assertNoSecretsInResponse } from "../lib/security-agent";

// ─── Abschnitte: Vollständigkeit ──────────────────────────────────────────────

test("Go-Live: genau 9 Abschnitte (A–I) vorhanden", () => {
  const sections = getGoLiveSections();
  assert.equal(sections.length, 9, `Erwartet 9, erhalten: ${sections.length}`);
});

test("Go-Live: Abschnitt-IDs sind A bis I", () => {
  const sections = getGoLiveSections();
  const ids = sections.map((s) => s.sectionId);
  const expected = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
  for (const id of expected) {
    assert.ok(ids.includes(id), `Abschnitt ${id} fehlt`);
  }
});

test("Go-Live: Abschnitt A prüft Startseite", () => {
  const sections = getGoLiveSections();
  const a = sections.find((s) => s.sectionId === "A");
  assert.ok(a, "Abschnitt A fehlt");
  assert.ok(
    a.title.toLowerCase().includes("startseite") ||
      a.title.toLowerCase().includes("landing"),
    `Abschnitt A Titel unpassend: ${a.title}`,
  );
  assert.ok(a.checks.length > 0, "Abschnitt A hat keine Prüfungen");
});

test("Go-Live: Abschnitt B prüft Preise", () => {
  const sections = getGoLiveSections();
  const b = sections.find((s) => s.sectionId === "B");
  assert.ok(b, "Abschnitt B fehlt");
  assert.ok(
    b.title.toLowerCase().includes("preis") ||
      b.title.toLowerCase().includes("pricing"),
    `Abschnitt B Titel unpassend: ${b.title}`,
  );
});

test("Go-Live: Abschnitt C prüft Kontakt", () => {
  const sections = getGoLiveSections();
  const c = sections.find((s) => s.sectionId === "C");
  assert.ok(c, "Abschnitt C fehlt");
  assert.ok(
    c.title.toLowerCase().includes("kontakt") ||
      c.title.toLowerCase().includes("contact"),
    `Abschnitt C Titel unpassend: ${c.title}`,
  );
});

test("Go-Live: Abschnitt D prüft Trial-Anmeldung", () => {
  const sections = getGoLiveSections();
  const d = sections.find((s) => s.sectionId === "D");
  assert.ok(d, "Abschnitt D fehlt");
  assert.ok(
    d.title.toLowerCase().includes("trial") ||
      d.title.toLowerCase().includes("anmeld"),
    `Abschnitt D Titel unpassend: ${d.title}`,
  );
});

test("Go-Live: Abschnitt E prüft erste Test-Praxis", () => {
  const sections = getGoLiveSections();
  const e = sections.find((s) => s.sectionId === "E");
  assert.ok(e, "Abschnitt E fehlt");
  assert.ok(
    e.title.toLowerCase().includes("test") ||
      e.title.toLowerCase().includes("praxis"),
    `Abschnitt E Titel unpassend: ${e.title}`,
  );
});

test("Go-Live: Abschnitt F ist Admin-Checkliste", () => {
  const sections = getGoLiveSections();
  const f = sections.find((s) => s.sectionId === "F");
  assert.ok(f, "Abschnitt F fehlt");
  assert.ok(
    f.title.toLowerCase().includes("checkliste") ||
      f.title.toLowerCase().includes("admin"),
    `Abschnitt F Titel unpassend: ${f.title}`,
  );
  // Muss genau 13 Checks enthalten
  assert.equal(f.checks.length, 13, `Abschnitt F: erwartet 13 Checks, erhalten ${f.checks.length}`);
});

test("Go-Live: Abschnitt G prüft Fake-Testimonials", () => {
  const sections = getGoLiveSections();
  const g = sections.find((s) => s.sectionId === "G");
  assert.ok(g, "Abschnitt G fehlt");
  assert.ok(
    g.title.toLowerCase().includes("testimonial") ||
      g.title.toLowerCase().includes("fake"),
    `Abschnitt G Titel unpassend: ${g.title}`,
  );
});

test("Go-Live: Abschnitt H prüft Kaltakquise", () => {
  const sections = getGoLiveSections();
  const h = sections.find((s) => s.sectionId === "H");
  assert.ok(h, "Abschnitt H fehlt");
  assert.ok(
    h.title.toLowerCase().includes("kaltakquise") ||
      h.title.toLowerCase().includes("akquise") ||
      h.title.toLowerCase().includes("outreach"),
    `Abschnitt H Titel unpassend: ${h.title}`,
  );
});

test("Go-Live: Abschnitt I prüft SMS/WhatsApp-Sicherheit", () => {
  const sections = getGoLiveSections();
  const i = sections.find((s) => s.sectionId === "I");
  assert.ok(i, "Abschnitt I fehlt");
  assert.ok(
    i.title.toLowerCase().includes("messaging") ||
      i.title.toLowerCase().includes("sms") ||
      i.title.toLowerCase().includes("whatsapp"),
    `Abschnitt I Titel unpassend: ${i.title}`,
  );
});

// ─── Aufgaben: manualOnly & autoExecutable ────────────────────────────────────

test("Go-Live: alle Aufgaben haben manualOnly=true", () => {
  const sections = getGoLiveSections();
  const tasks = getGoLiveTasks(sections);
  for (const task of tasks) {
    assert.equal(
      task.manualOnly,
      true,
      `Aufgabe "${task.title}" hat manualOnly=${task.manualOnly}`,
    );
  }
});

test("Go-Live: alle Aufgaben haben autoExecutable=false", () => {
  const sections = getGoLiveSections();
  const tasks = getGoLiveTasks(sections);
  for (const task of tasks) {
    assert.equal(
      task.autoExecutable,
      false,
      `Aufgabe "${task.title}" hat autoExecutable=${task.autoExecutable}`,
    );
  }
});

test("Go-Live: keine blockierende Aufgabe ist autoExecutable", () => {
  const sections = getGoLiveSections();
  const tasks = getGoLiveTasks(sections);
  const blockingAuto = tasks.filter(
    (t) => t.priority === "blocking" && t.autoExecutable,
  );
  assert.equal(blockingAuto.length, 0, "Blockierende Aufgabe mit autoExecutable=true gefunden");
});

test("Go-Live: Aufgaben sind nach Priorität sortiert (blocking vor important vor recommended)", () => {
  const sections = getGoLiveSections();
  const tasks = getGoLiveTasks(sections);
  if (tasks.length < 2) return; // Nichts zu prüfen wenn < 2 Aufgaben
  const order: Record<string, number> = { blocking: 0, important: 1, recommended: 2 };
  for (let i = 1; i < tasks.length; i++) {
    assert.ok(
      order[tasks[i].priority] >= order[tasks[i - 1].priority],
      `Falsche Reihenfolge: ${tasks[i - 1].priority} → ${tasks[i].priority}`,
    );
  }
});

// ─── Checkliste: 13 Punkte ────────────────────────────────────────────────────

test("Go-Live: Checkliste enthält genau 13 Punkte", () => {
  const checklist = getGoLiveChecklist();
  assert.equal(checklist.length, 13, `Erwartet 13, erhalten: ${checklist.length}`);
});

test("Go-Live: Checkliste enthält Backup-Review und Legal-Review", () => {
  const checklist = getGoLiveChecklist();
  const hasBackup = checklist.some((c) =>
    c.label.toLowerCase().includes("backup"),
  );
  const hasLegal = checklist.some((c) =>
    c.label.toLowerCase().includes("legal") ||
    c.label.toLowerCase().includes("impressum") ||
    c.label.toLowerCase().includes("datenschutz"),
  );
  assert.ok(hasBackup, "Backup-Review fehlt in Checkliste");
  assert.ok(hasLegal, "Legal-Review fehlt in Checkliste");
});

test("Go-Live: Checkliste enthält Messaging-Sicherheits-Punkt", () => {
  const checklist = getGoLiveChecklist();
  const hasMessaging = checklist.some(
    (c) =>
      c.label.toLowerCase().includes("messaging") ||
      c.label.toLowerCase().includes("versand"),
  );
  assert.ok(hasMessaging, "Messaging-Sicherheits-Punkt fehlt in Checkliste");
});

test("Go-Live: Checkliste enthält 10-Sprachen-Punkt", () => {
  const checklist = getGoLiveChecklist();
  const hasI18n = checklist.some(
    (c) =>
      c.label.includes("10") && c.label.toLowerCase().includes("sprache"),
  );
  assert.ok(hasI18n, "10-Sprachen-Prüfpunkt fehlt in Checkliste");
});

// ─── Score & Status ───────────────────────────────────────────────────────────

test("Go-Live: Score liegt zwischen 0 und 100", () => {
  const sections = getGoLiveSections();
  const score = calculateGoLiveScore(sections);
  assert.ok(score >= 0 && score <= 100, `Score ${score} außerhalb 0–100`);
});

test("Go-Live: runGoLiveCheck liefert code=GO_LIVE_READINESS_READY", () => {
  const result = runGoLiveCheck();
  assert.equal(result.code, "GO_LIVE_READINESS_READY");
});

test("Go-Live: runGoLiveCheck enthält generatedAt-Timestamp", () => {
  const result = runGoLiveCheck();
  assert.ok(result.generatedAt, "generatedAt fehlt");
  const date = new Date(result.generatedAt);
  assert.ok(!isNaN(date.getTime()), "generatedAt ist kein gültiger Timestamp");
});

// ─── Keine Fake-Testimonials ──────────────────────────────────────────────────

test("Go-Live (G): Abschnitt G scannt auf Fake-Testimonials", () => {
  const sections = getGoLiveSections();
  const g = sections.find((s) => s.sectionId === "G");
  assert.ok(g, "Abschnitt G fehlt");
  const fakeCheck = g.checks.find((c) => c.id === "G1_NO_FAKE_TESTIMONIALS");
  assert.ok(fakeCheck, "G1_NO_FAKE_TESTIMONIALS fehlt in Abschnitt G");
});

test("Go-Live (G): lib/blog-translations.ts enthält keine Fake-Testimonials", () => {
  const path = resolve(process.cwd(), "lib/blog-translations.ts");
  if (!existsSync(path)) return;
  const { readFileSync } = require("fs");
  const content: string = readFileSync(path, "utf8");
  const forbidden = [
    /kunden sagen/i,
    /\d{3,}\s+zufriedene/i,
    /tausende\s+praxen/i,
    /bewährt bei hunderten/i,
  ];
  for (const pattern of forbidden) {
    assert.ok(
      !pattern.test(content),
      `Möglicher Fake-Testimonial-Text in blog-translations.ts: ${pattern}`,
    );
  }
});

// ─── Keine automatische Kaltakquise ──────────────────────────────────────────

test("Go-Live (H): Abschnitt H hat Prüfung auf Marketing-Auto-Outreach", () => {
  const sections = getGoLiveSections();
  const h = sections.find((s) => s.sectionId === "H");
  assert.ok(h, "Abschnitt H fehlt");
  const outreachCheck = h.checks.find((c) => c.id === "H1_MARKETING_NO_AUTO_OUTREACH");
  assert.ok(outreachCheck, "H1_MARKETING_NO_AUTO_OUTREACH fehlt in Abschnitt H");
});

test("Go-Live (H): Abschnitt H hat Prüfung auf Bulk-E-Mail", () => {
  const sections = getGoLiveSections();
  const h = sections.find((s) => s.sectionId === "H");
  assert.ok(h, "Abschnitt H fehlt");
  const bulkCheck = h.checks.find((c) => c.id === "H2_NO_BULK_EMAIL");
  assert.ok(bulkCheck, "H2_NO_BULK_EMAIL fehlt in Abschnitt H");
});

test("Go-Live (H): Abschnitt H hat Prüfung auf automatische Anrufe", () => {
  const sections = getGoLiveSections();
  const h = sections.find((s) => s.sectionId === "H");
  assert.ok(h, "Abschnitt H fehlt");
  const callCheck = h.checks.find((c) => c.id === "H3_NO_AUTO_CALLS");
  assert.ok(callCheck, "H3_NO_AUTO_CALLS fehlt in Abschnitt H");
});

test("Go-Live (H): marketing-agent.ts enthält keine Auto-Outreach-Funktion", () => {
  const path = resolve(process.cwd(), "lib/marketing-agent.ts");
  assert.ok(existsSync(path), "lib/marketing-agent.ts fehlt");
  const { readFileSync } = require("fs");
  const content: string = readFileSync(path, "utf8");
  const forbidden = [/autoOutreach/i, /sendColdEmail/i, /contactPractice\(/i];
  for (const pattern of forbidden) {
    assert.ok(
      !pattern.test(content),
      `Verbotene Auto-Outreach-Funktion in marketing-agent.ts: ${pattern}`,
    );
  }
});

// ─── Kein Auto-SMS/WhatsApp ohne Freigabe ────────────────────────────────────

test("Go-Live (I): Abschnitt I hat Prüfung auf Standard-Provider=none", () => {
  const sections = getGoLiveSections();
  const i = sections.find((s) => s.sectionId === "I");
  assert.ok(i, "Abschnitt I fehlt");
  const providerCheck = i.checks.find((c) => c.id === "I1_DEFAULT_PROVIDER_NONE");
  assert.ok(providerCheck, "I1_DEFAULT_PROVIDER_NONE fehlt in Abschnitt I");
});

test("Go-Live (I): Abschnitt I hat Prüfung auf DryRun-Modus", () => {
  const sections = getGoLiveSections();
  const i = sections.find((s) => s.sectionId === "I");
  assert.ok(i, "Abschnitt I fehlt");
  const dryRunCheck = i.checks.find((c) => c.id === "I2_DRY_RUN_OR_NONE");
  assert.ok(dryRunCheck, "I2_DRY_RUN_OR_NONE fehlt in Abschnitt I");
});

test("Go-Live (I): Abschnitt I hat UI-Messaging-Ehrlichkeits-Check", () => {
  const sections = getGoLiveSections();
  const i = sections.find((s) => s.sectionId === "I");
  assert.ok(i, "Abschnitt I fehlt");
  const uiCheck = i.checks.find((c) => c.id === "I3_UI_MESSAGING_HONEST");
  assert.ok(uiCheck, "I3_UI_MESSAGING_HONEST fehlt in Abschnitt I");
});

// ─── docs/FIRST_TEST_PRACTICE.md ─────────────────────────────────────────────

test("Go-Live: docs/FIRST_TEST_PRACTICE.md existiert", () => {
  const path = resolve(process.cwd(), "docs/FIRST_TEST_PRACTICE.md");
  assert.ok(existsSync(path), "docs/FIRST_TEST_PRACTICE.md fehlt – erstellen");
});

test("Go-Live: FIRST_TEST_PRACTICE.md enthält Einwilligungs-Abschnitt", () => {
  const path = resolve(process.cwd(), "docs/FIRST_TEST_PRACTICE.md");
  if (!existsSync(path)) return;
  const { readFileSync } = require("fs");
  const content: string = readFileSync(path, "utf8");
  assert.ok(
    content.toLowerCase().includes("einwilligung") ||
      content.toLowerCase().includes("einverständnis"),
    "FIRST_TEST_PRACTICE.md enthält keinen Einwilligungs-Abschnitt",
  );
});

test("Go-Live: FIRST_TEST_PRACTICE.md enthält Messaging-Sicherheits-Hinweis", () => {
  const path = resolve(process.cwd(), "docs/FIRST_TEST_PRACTICE.md");
  if (!existsSync(path)) return;
  const { readFileSync } = require("fs");
  const content: string = readFileSync(path, "utf8");
  assert.ok(
    content.toLowerCase().includes("messaging") ||
      content.toLowerCase().includes("sms"),
    "FIRST_TEST_PRACTICE.md enthält keinen Messaging-Sicherheitshinweis",
  );
});

test("Go-Live: FIRST_TEST_PRACTICE.md enthält keinen werblichen 'DSGVO-konform'-Claim", () => {
  const path = resolve(process.cwd(), "docs/FIRST_TEST_PRACTICE.md");
  if (!existsSync(path)) return;
  const { readFileSync } = require("fs");
  const content: string = readFileSync(path, "utf8");
  // Erlaubt: "DSGVO-konform" als negativer Hinweis (in Verbots-Listen/Tabellen)
  // Verboten: werbliche Behauptung wie "SlotFill ist DSGVO-konform"
  const werblicheBehauptung = /slotfill\s+ist\s+dsgvo-konform/i.test(content) ||
    /wir\s+(sind|bieten)\s+.*dsgvo-konform/i.test(content);
  assert.ok(
    !werblicheBehauptung,
    'FIRST_TEST_PRACTICE.md enthält werbliche "DSGVO-konform"-Behauptung',
  );
});

test("Go-Live: FIRST_TEST_PRACTICE.md schreibt keine automatische Kaltakquise vor", () => {
  const path = resolve(process.cwd(), "docs/FIRST_TEST_PRACTICE.md");
  if (!existsSync(path)) return;
  const { readFileSync } = require("fs");
  const content: string = readFileSync(path, "utf8");
  // Erlaubt: "Keine automatische Kaltakquise" (Verbot)
  // Verboten: Anleitung zur automatischen Kaltakquise
  const prescribesAutoOutreach =
    /\b(nutze|verwende|starte|führe\s+durch)\s+automatische\s+kaltakquise/i.test(content) ||
    /automatisch.*e-mail.*an\s+(alle\s+)?praxen\s+senden/i.test(content);
  assert.ok(
    !prescribesAutoOutreach,
    "FIRST_TEST_PRACTICE.md enthält Anleitung zur automatischen Kaltakquise",
  );
});

// ─── API: Keine Secrets in Antwort ───────────────────────────────────────────

test("Go-Live: runGoLiveCheck-Antwort enthält keine Secrets", () => {
  const result = runGoLiveCheck();
  assert.equal(
    assertNoSecretsInResponse(result),
    true,
    "runGoLiveCheck gibt mögliche Secrets aus",
  );
});

test("Go-Live: runGoLiveCheck-Antwort enthält kein 'sk_' in agentSummary", () => {
  const result = runGoLiveCheck();
  const summaryText = JSON.stringify(result.agentSummary);
  assert.ok(!/sk_/.test(summaryText), "Secret (sk_) in agentSummary gefunden");
});

// ─── Agenten-Zusammenfassung ──────────────────────────────────────────────────

test("Go-Live: agentSummary enthält alle 4 Agenten", () => {
  const result = runGoLiveCheck();
  assert.ok(result.agentSummary.marketing, "marketing-Zusammenfassung fehlt");
  assert.ok(result.agentSummary.ceo, "ceo-Zusammenfassung fehlt");
  assert.ok(result.agentSummary.operations, "operations-Zusammenfassung fehlt");
  assert.ok(result.agentSummary.security, "security-Zusammenfassung fehlt");
});

// ─── Dateien vorhanden ────────────────────────────────────────────────────────

test("Go-Live: lib/go-live-agent.ts existiert", () => {
  assert.ok(
    existsSync(resolve(process.cwd(), "lib/go-live-agent.ts")),
    "lib/go-live-agent.ts fehlt",
  );
});

test("Go-Live: app/api/admin/go-live/route.ts existiert", () => {
  assert.ok(
    existsSync(resolve(process.cwd(), "app/api/admin/go-live/route.ts")),
    "app/api/admin/go-live/route.ts fehlt",
  );
});

test("Go-Live: app/admin/go-live/page.tsx existiert", () => {
  assert.ok(
    existsSync(resolve(process.cwd(), "app/admin/go-live/page.tsx")),
    "app/admin/go-live/page.tsx fehlt",
  );
});

// ─── go-live-agent.ts selbst enthält keine Secrets ───────────────────────────

test("Go-Live: lib/go-live-agent.ts enthält keine Secrets", () => {
  const { readFileSync } = require("fs");
  const content: string = readFileSync(
    resolve(process.cwd(), "lib/go-live-agent.ts"),
    "utf8",
  );
  assert.ok(
    !/(sk_|re_|whsec_|AC[0-9a-fA-F]{8})/.test(content),
    "Mögliches Secret in lib/go-live-agent.ts",
  );
});

test("Go-Live: lib/go-live-agent.ts enthält kein 'DSGVO-konform'", () => {
  const { readFileSync } = require("fs");
  const content: string = readFileSync(
    resolve(process.cwd(), "lib/go-live-agent.ts"),
    "utf8",
  );
  assert.ok(
    !content.includes("DSGVO-konform"),
    'lib/go-live-agent.ts enthält verbotenen Text "DSGVO-konform"',
  );
});
