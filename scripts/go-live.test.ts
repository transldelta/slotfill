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

// ─── Aufgaben 1-4: Neue Content-Elemente ──────────────────────────────────────

test("Go-Live: A4 – Trust-Sektion: messages/de.json enthält trustTitle", () => {
  const { readFileSync } = require("fs");
  const msgs = JSON.parse(readFileSync(resolve(process.cwd(), "messages/de.json"), "utf8"));
  assert.ok(msgs.landing?.trustTitle, "messages/de.json: landing.trustTitle fehlt");
  assert.ok(msgs.landing?.trustPoint1, "messages/de.json: landing.trustPoint1 fehlt");
  assert.ok(msgs.landing?.trustPoint4, "messages/de.json: landing.trustPoint4 fehlt");
});

test("Go-Live: A4 – Trust-Sektion: app/[locale]/page.tsx verwendet trustTitle", () => {
  const { readFileSync } = require("fs");
  const content: string = readFileSync(
    resolve(process.cwd(), "app/[locale]/page.tsx"),
    "utf8",
  );
  assert.ok(
    content.includes("trustTitle"),
    'app/[locale]/page.tsx: trustTitle fehlt – Trust-Sektion nicht eingebaut',
  );
  assert.ok(
    content.includes("trustPoint1"),
    'app/[locale]/page.tsx: trustPoint1 fehlt',
  );
});

test("Go-Live: A4 – KNOWN_CONTENT enthält TRUST_SECTION_ADDED → A4 ist ready", () => {
  const sections = getGoLiveSections();
  const a = sections.find((s) => s.sectionId === "A");
  assert.ok(a, "Abschnitt A fehlt");
  const a4 = a.checks.find((c) => c.id === "A4_TRUST_SECTION");
  assert.ok(a4, "A4_TRUST_SECTION check fehlt");
  assert.equal(
    a4.status,
    "ready",
    `A4 soll ready sein nach Aufgabe 1, ist aber: ${a4.status}`,
  );
});

test("Go-Live: Aufgabe 4 – trialNoMessages im Hero der Startseite", () => {
  const { readFileSync } = require("fs");
  const content: string = readFileSync(
    resolve(process.cwd(), "app/[locale]/page.tsx"),
    "utf8",
  );
  assert.ok(
    content.includes("trialNoMessages"),
    'app/[locale]/page.tsx: trialNoMessages fehlt – Messaging-Ehrlichkeit im Hero fehlt',
  );
  assert.ok(
    content.includes("trialNote"),
    'app/[locale]/page.tsx: trialNote fehlt',
  );
});

test("Go-Live: B3 – Trial-Infobox: messages/de.json enthält trialInfo", () => {
  const { readFileSync } = require("fs");
  const msgs = JSON.parse(readFileSync(resolve(process.cwd(), "messages/de.json"), "utf8"));
  assert.ok(msgs.pricing?.trialInfo, "messages/de.json: pricing.trialInfo fehlt");
  assert.ok(msgs.pricing?.trialNoCreditCard, "messages/de.json: pricing.trialNoCreditCard fehlt");
  assert.ok(msgs.pricing?.trialNoSms, "messages/de.json: pricing.trialNoSms fehlt");
});

test("Go-Live: B3 – Trial-Infobox: app/[locale]/pricing/page.tsx verwendet trialInfo", () => {
  const { readFileSync } = require("fs");
  const content: string = readFileSync(
    resolve(process.cwd(), "app/[locale]/pricing/page.tsx"),
    "utf8",
  );
  assert.ok(
    content.includes("trialInfo"),
    'app/[locale]/pricing/page.tsx: trialInfo fehlt – Trial-Infobox nicht eingebaut',
  );
  assert.ok(
    content.includes("trialNoCreditCard"),
    'app/[locale]/pricing/page.tsx: trialNoCreditCard fehlt',
  );
});

test("Go-Live: B3 – KNOWN_CONTENT → B3 ist ready", () => {
  const sections = getGoLiveSections();
  const b = sections.find((s) => s.sectionId === "B");
  assert.ok(b, "Abschnitt B fehlt");
  const b3 = b.checks.find((c) => c.id === "B3_TRIAL_CLEAR");
  assert.ok(b3, "B3_TRIAL_CLEAR check fehlt");
  assert.equal(b3.status, "ready", `B3 soll ready sein, ist aber: ${b3.status}`);
});

test("Go-Live: B4 – Anbieterkosten: messages/de.json enthält providerCostNote", () => {
  const { readFileSync } = require("fs");
  const msgs = JSON.parse(readFileSync(resolve(process.cwd(), "messages/de.json"), "utf8"));
  assert.ok(msgs.pricing?.providerCostNote, "messages/de.json: pricing.providerCostNote fehlt");
});

test("Go-Live: B4 – KNOWN_CONTENT → B4 ist ready", () => {
  const sections = getGoLiveSections();
  const b = sections.find((s) => s.sectionId === "B");
  assert.ok(b, "Abschnitt B fehlt");
  const b4 = b.checks.find((c) => c.id === "B4_PROVIDER_COSTS_HONEST");
  assert.ok(b4, "B4_PROVIDER_COSTS_HONEST check fehlt");
  assert.equal(b4.status, "ready", `B4 soll ready sein, ist aber: ${b4.status}`);
});

test("Go-Live: B4 – Pricing-Seite enthält providerCostNote", () => {
  const { readFileSync } = require("fs");
  const content: string = readFileSync(
    resolve(process.cwd(), "app/[locale]/pricing/page.tsx"),
    "utf8",
  );
  assert.ok(
    content.includes("providerCostNote"),
    'app/[locale]/pricing/page.tsx: providerCostNote fehlt',
  );
});

test("Go-Live: C4 – Kontaktklarheit: messages/de.json enthält whatHappensTitle", () => {
  const { readFileSync } = require("fs");
  const msgs = JSON.parse(readFileSync(resolve(process.cwd(), "messages/de.json"), "utf8"));
  assert.ok(msgs.contact?.whatHappensTitle, "messages/de.json: contact.whatHappensTitle fehlt");
  assert.ok(msgs.contact?.whatHappens1, "messages/de.json: contact.whatHappens1 fehlt");
  assert.ok(msgs.contact?.whatHappens3, "messages/de.json: contact.whatHappens3 fehlt");
});

test("Go-Live: C4 – Kontaktseite verwendet whatHappensTitle", () => {
  const { readFileSync } = require("fs");
  const content: string = readFileSync(
    resolve(process.cwd(), "app/[locale]/kontakt/page.tsx"),
    "utf8",
  );
  assert.ok(
    content.includes("whatHappensTitle"),
    'app/[locale]/kontakt/page.tsx: whatHappensTitle fehlt – "Was passiert danach?"-Sektion nicht eingebaut',
  );
  assert.ok(
    content.includes("whatHappens1"),
    'app/[locale]/kontakt/page.tsx: whatHappens1 fehlt',
  );
});

test("Go-Live: C4 – KNOWN_CONTENT → C4 ist ready", () => {
  const sections = getGoLiveSections();
  const c = sections.find((s) => s.sectionId === "C");
  assert.ok(c, "Abschnitt C fehlt");
  const c4 = c.checks.find((c2) => c2.id === "C4_TRIAL_REQUEST_CLEAR");
  assert.ok(c4, "C4_TRIAL_REQUEST_CLEAR check fehlt");
  assert.equal(c4.status, "ready", `C4 soll ready sein, ist aber: ${c4.status}`);
});

test("Go-Live: I3 – KNOWN_CONTENT → I3 ist ready", () => {
  const sections = getGoLiveSections();
  const i = sections.find((s) => s.sectionId === "I");
  assert.ok(i, "Abschnitt I fehlt");
  const i3 = i.checks.find((c) => c.id === "I3_UI_MESSAGING_HONEST");
  assert.ok(i3, "I3_UI_MESSAGING_HONEST check fehlt");
  assert.equal(i3.status, "ready", `I3 soll ready sein, ist aber: ${i3.status}`);
});

test("Go-Live: Score ≥ 90 nach Aufgaben 1-4", () => {
  const sections = getGoLiveSections();
  const score = calculateGoLiveScore(sections);
  assert.ok(score >= 90, `Score soll ≥ 90 sein, ist aber: ${score}`);
});

// ─── Sicherheit: Kein Auto-SMS-Versprechen, kein Kaltakquise ─────────────────

test("Go-Live: Startseite enthält kein automatisches SMS-Versprechen", () => {
  const { readFileSync } = require("fs");
  const content: string = readFileSync(
    resolve(process.cwd(), "app/[locale]/page.tsx"),
    "utf8",
  );
  assert.ok(
    !/automatisch.*sms/i.test(content),
    'app/[locale]/page.tsx: automatisches SMS-Versprechen gefunden',
  );
  assert.ok(
    !/automatisch.*whatsapp/i.test(content),
    'app/[locale]/page.tsx: automatisches WhatsApp-Versprechen gefunden',
  );
});

test("Go-Live: Pricing-Seite enthält keine Fake-Testimonials", () => {
  const { readFileSync } = require("fs");
  const content: string = readFileSync(
    resolve(process.cwd(), "app/[locale]/pricing/page.tsx"),
    "utf8",
  );
  assert.ok(
    !/\d{3,}\s+zufriedene/i.test(content),
    'app/[locale]/pricing/page.tsx: mögliche Fake-Zahlen gefunden',
  );
  assert.ok(
    !/trusted\s+by\s+\d+/i.test(content),
    'app/[locale]/pricing/page.tsx: "trusted by N" gefunden',
  );
});

test("Go-Live: i18n – alle 10 Locales haben landing.trustTitle", () => {
  const { readFileSync } = require("fs");
  const locales = ['de', 'en', 'zh', 'hi', 'es', 'ar', 'fr', 'pt', 'bn', 'ru'];
  for (const locale of locales) {
    const msgs = JSON.parse(
      readFileSync(resolve(process.cwd(), `messages/${locale}.json`), "utf8"),
    );
    assert.ok(
      msgs.landing?.trustTitle,
      `messages/${locale}.json: landing.trustTitle fehlt`,
    );
  }
});

test("Go-Live: i18n – alle 10 Locales haben pricing.providerCostNote", () => {
  const { readFileSync } = require("fs");
  const locales = ['de', 'en', 'zh', 'hi', 'es', 'ar', 'fr', 'pt', 'bn', 'ru'];
  for (const locale of locales) {
    const msgs = JSON.parse(
      readFileSync(resolve(process.cwd(), `messages/${locale}.json`), "utf8"),
    );
    assert.ok(
      msgs.pricing?.providerCostNote,
      `messages/${locale}.json: pricing.providerCostNote fehlt`,
    );
  }
});

test("Go-Live: i18n – alle 10 Locales haben contact.whatHappensTitle", () => {
  const { readFileSync } = require("fs");
  const locales = ['de', 'en', 'zh', 'hi', 'es', 'ar', 'fr', 'pt', 'bn', 'ru'];
  for (const locale of locales) {
    const msgs = JSON.parse(
      readFileSync(resolve(process.cwd(), `messages/${locale}.json`), "utf8"),
    );
    assert.ok(
      msgs.contact?.whatHappensTitle,
      `messages/${locale}.json: contact.whatHappensTitle fehlt`,
    );
  }
});

// ─── Finale Route-Detection: Vercel-Sicherheit ────────────────────────────────

test("Go-Live (Route): KNOWN_URL_ROUTES enthält /de (Startseite)", () => {
  // Importiere den Agenten-Quelltext und prüfe direkt
  const { readFileSync } = require("fs");
  const src: string = readFileSync(
    resolve(process.cwd(), "lib/go-live-agent.ts"),
    "utf8",
  );
  assert.ok(
    src.includes('"/de"'),
    'KNOWN_URL_ROUTES muss "/de" enthalten',
  );
  assert.ok(
    src.includes('KNOWN_URL_ROUTES'),
    'lib/go-live-agent.ts: KNOWN_URL_ROUTES fehlt',
  );
});

test("Go-Live (Route): KNOWN_URL_ROUTES enthält /de/pricing, /de/kontakt, /de/blog", () => {
  const { readFileSync } = require("fs");
  const src: string = readFileSync(
    resolve(process.cwd(), "lib/go-live-agent.ts"),
    "utf8",
  );
  assert.ok(src.includes('"/de/pricing"'), 'KNOWN_URL_ROUTES: /de/pricing fehlt');
  assert.ok(src.includes('"/de/kontakt"'), 'KNOWN_URL_ROUTES: /de/kontakt fehlt');
  assert.ok(src.includes('"/de/blog"'),    'KNOWN_URL_ROUTES: /de/blog fehlt');
});

test("Go-Live (Route): KNOWN_URL_ROUTES enthält /auth/login, /dashboard, /admin", () => {
  const { readFileSync } = require("fs");
  const src: string = readFileSync(
    resolve(process.cwd(), "lib/go-live-agent.ts"),
    "utf8",
  );
  assert.ok(src.includes('"/auth/login"'),   'KNOWN_URL_ROUTES: /auth/login fehlt');
  assert.ok(src.includes('"/dashboard"'),    'KNOWN_URL_ROUTES: /dashboard fehlt');
  assert.ok(src.includes('"/admin"'),        'KNOWN_URL_ROUTES: /admin fehlt');
  assert.ok(src.includes('"/admin/go-live"'),'KNOWN_URL_ROUTES: /admin/go-live fehlt');
});

test("Go-Live (Route): SOURCE_TO_URL enthält Mapping für alle Kern-Routen", () => {
  const { readFileSync } = require("fs");
  const src: string = readFileSync(
    resolve(process.cwd(), "lib/go-live-agent.ts"),
    "utf8",
  );
  assert.ok(src.includes('SOURCE_TO_URL'), 'SOURCE_TO_URL fehlt in go-live-agent.ts');
  assert.ok(
    src.includes('"app/[locale]/page.tsx"') && src.includes('"/de"'),
    'SOURCE_TO_URL: Mapping app/[locale]/page.tsx → /de fehlt',
  );
});

test("Go-Live (Route): routeExists gibt niemals 'not_found' für bekannte Pfade zurück", () => {
  const sections = getGoLiveSections();
  // Alle Route-Checks in Abschnitten A–E und I dürfen nicht "blocking" wegen fehlender Dateien sein
  const routeSectionIds = ["A", "B", "C", "D", "E"];
  for (const sectionId of routeSectionIds) {
    const section = sections.find((s) => s.sectionId === sectionId);
    assert.ok(section, `Abschnitt ${sectionId} fehlt`);
    const routeChecks = section.checks.filter((c) =>
      c.id.endsWith("_EXISTS") || c.id.endsWith("_EXIST"),
    );
    for (const check of routeChecks) {
      assert.notEqual(
        check.status,
        "blocking",
        `Abschnitt ${sectionId}, Check ${check.id}: Route-Check blockiert auf Vercel → ${check.note}`,
      );
    }
  }
});

test("Go-Live (Route): Abschnitt A – Startseite ist 'ready' (nicht blocking)", () => {
  const sections = getGoLiveSections();
  const a = sections.find((s) => s.sectionId === "A")!;
  const a1 = a.checks.find((c) => c.id === "A1_LANDING_EXISTS")!;
  assert.equal(
    a1.status,
    "ready",
    `A1 soll 'ready' sein (Startseite ist bekannt via KNOWN_ROUTES), ist: ${a1.status}`,
  );
});

test("Go-Live (Route): Abschnitt B – Pricing ist 'ready' (nicht blocking)", () => {
  const sections = getGoLiveSections();
  const b = sections.find((s) => s.sectionId === "B")!;
  const b1 = b.checks.find((c) => c.id === "B1_PRICING_EXISTS")!;
  assert.equal(
    b1.status,
    "ready",
    `B1 soll 'ready' sein (Pricing ist bekannt), ist: ${b1.status}`,
  );
});

test("Go-Live (Route): Abschnitt C – Kontakt ist 'ready' (nicht blocking)", () => {
  const sections = getGoLiveSections();
  const c = sections.find((s) => s.sectionId === "C")!;
  const c1 = c.checks.find((c2) => c2.id === "C1_CONTACT_EXISTS")!;
  assert.equal(
    c1.status,
    "ready",
    `C1 soll 'ready' sein (Kontakt ist bekannt), ist: ${c1.status}`,
  );
});

test("Go-Live (Route): Abschnitt D – Login und Dashboard sind 'ready'", () => {
  const sections = getGoLiveSections();
  const d = sections.find((s) => s.sectionId === "D")!;
  const d1 = d.checks.find((c) => c.id === "D1_AUTH_ROUTES_EXIST")!;
  const d2 = d.checks.find((c) => c.id === "D2_DASHBOARD_EXISTS")!;
  assert.equal(d1.status, "ready", `D1 soll ready sein, ist: ${d1.status}`);
  assert.equal(d2.status, "ready", `D2 soll ready sein, ist: ${d2.status}`);
});

test("Go-Live (Route): Kein Abschnitt ist 'blocking' wegen fehlender Source-Dateien", () => {
  const sections = getGoLiveSections();
  const blockingSections = sections.filter((s) => s.status === "blocking");
  assert.equal(
    blockingSections.length,
    0,
    `Keine Abschnitte sollen blocking sein (alle Routen bekannt). Blocking: ${blockingSections.map((s) => s.sectionId).join(", ")}`,
  );
});

test("Go-Live (Route): Score ≥ 90 (nur manuelle Punkte offen)", () => {
  const sections = getGoLiveSections();
  const score = calculateGoLiveScore(sections);
  assert.ok(
    score >= 90,
    `Score soll ≥ 90 sein wenn nur manuelle/Config-Punkte offen sind. Aktuell: ${score}`,
  );
});

test("Go-Live (Route): routeExists kann '/de' direkt als URL-Pfad prüfen", () => {
  // Prüfe dass KNOWN_URL_ROUTES im Quelltext alle 10 Locales enthält
  const { readFileSync } = require("fs");
  const src: string = readFileSync(
    resolve(process.cwd(), "lib/go-live-agent.ts"),
    "utf8",
  );
  const locales = ["/de", "/en", "/zh", "/hi", "/es", "/ar", "/fr", "/pt", "/bn", "/ru"];
  for (const loc of locales) {
    assert.ok(src.includes(`"${loc}"`), `KNOWN_URL_ROUTES: ${loc} fehlt`);
  }
});

test("Go-Live (Route): Echte Risiken – G1 (Fake-Testimonials) kann weiterhin blocking sein", () => {
  // Abschnitt G hat die Fähigkeit zu blockieren, ABER nur wenn echte Fake-Testimonials gefunden werden.
  // Im aktuellen Code (keine Fake-Testimonials) ist G ready.
  const sections = getGoLiveSections();
  const g = sections.find((s) => s.sectionId === "G")!;
  const g1 = g.checks.find((c) => c.id === "G1_NO_FAKE_TESTIMONIALS")!;
  // Im normalen Code: kein Fake → ready (das ist der erwartete Status)
  assert.equal(g1.status, "ready", `G1 soll ready sein (keine Fake-Testimonials im Code)`);
  // Verifiziere dass die blocking-Logik im Code vorhanden ist (präventiv)
  const { readFileSync } = require("fs");
  const src: string = readFileSync(
    resolve(process.cwd(), "lib/go-live-agent.ts"),
    "utf8",
  );
  assert.ok(
    src.includes("FORBIDDEN_TESTIMONIAL_PATTERNS"),
    "Fake-Testimonial-Erkennung muss im Code bleiben",
  );
});

test("Go-Live (Route): H-Sektion (Kaltakquise) kann weiterhin blocking sein", () => {
  // Abschnitt H kann blocking sein wenn Auto-Outreach gefunden wird.
  // Im aktuellen Code: kein Auto-Outreach → ready.
  const sections = getGoLiveSections();
  const h = sections.find((s) => s.sectionId === "H")!;
  assert.ok(h.status !== "blocking", "H-Sektion soll nicht blocking sein (kein Auto-Outreach)");
  // Verifiziere dass die blocking-Logik im Code vorhanden ist
  const { readFileSync } = require("fs");
  const src: string = readFileSync(
    resolve(process.cwd(), "lib/go-live-agent.ts"),
    "utf8",
  );
  assert.ok(
    src.includes("autoOutreach"),
    "Auto-Outreach-Erkennung muss im Code bleiben",
  );
});

// ─── Manuelle Go-Live-Bestätigungen ──────────────────────────────────────────

test("Go-Live (Confirmations): lib/go-live-confirmations.ts existiert", () => {
  assert.ok(
    existsSync(resolve(process.cwd(), "lib/go-live-confirmations.ts")),
    "lib/go-live-confirmations.ts fehlt",
  );
});

test("Go-Live (Confirmations): 4 MANUAL_CONFIRMATION_KEYS definiert", () => {
  const { MANUAL_CONFIRMATION_KEYS } = require("../lib/go-live-confirmations");
  assert.equal(
    MANUAL_CONFIRMATION_KEYS.length,
    4,
    `Erwartet 4 Keys, erhalten: ${MANUAL_CONFIRMATION_KEYS.length}`,
  );
});

test("Go-Live (Confirmations): alle 4 Keys vorhanden (prod_domain, languages_checked, backup_review, messaging_safe)", () => {
  const { MANUAL_CONFIRMATION_KEYS } = require("../lib/go-live-confirmations");
  const expected = ["prod_domain", "languages_checked", "backup_review", "messaging_safe"];
  for (const key of expected) {
    assert.ok(
      MANUAL_CONFIRMATION_KEYS.includes(key),
      `Key "${key}" fehlt in MANUAL_CONFIRMATION_KEYS`,
    );
  }
});

test("Go-Live (Confirmations): MANUAL_CONFIRMATIONS enthält 4 Einträge mit key, checklistId, label", () => {
  const { MANUAL_CONFIRMATIONS } = require("../lib/go-live-confirmations");
  assert.equal(MANUAL_CONFIRMATIONS.length, 4, "Erwartet 4 MANUAL_CONFIRMATIONS");
  for (const mc of MANUAL_CONFIRMATIONS) {
    assert.ok(mc.key, `MANUAL_CONFIRMATIONS Eintrag fehlt 'key'`);
    assert.ok(mc.checklistId, `MANUAL_CONFIRMATIONS Eintrag "${mc.key}" fehlt 'checklistId'`);
    assert.ok(mc.label, `MANUAL_CONFIRMATIONS Eintrag "${mc.key}" fehlt 'label'`);
  }
});

test("Go-Live (Confirmations): checklistIds sind CL01, CL09, CL10, CL13", () => {
  const { MANUAL_CONFIRMATIONS } = require("../lib/go-live-confirmations");
  const ids = MANUAL_CONFIRMATIONS.map((mc: { checklistId: string }) => mc.checklistId);
  for (const id of ["CL01", "CL09", "CL10", "CL13"]) {
    assert.ok(ids.includes(id), `checklistId "${id}" fehlt in MANUAL_CONFIRMATIONS`);
  }
});

test("Go-Live (Confirmations): calculateGoLiveScore ohne Confirmations gibt ≥ 90 zurück", () => {
  const sections = getGoLiveSections();
  const score = calculateGoLiveScore(sections);
  assert.ok(
    score >= 90,
    `Score ohne Confirmations soll ≥ 90 sein. Aktuell: ${score}`,
  );
});

test("Go-Live (Confirmations): calculateGoLiveScore mit allen Confirmations = 100 (keine Blocking)", () => {
  const { MANUAL_CONFIRMATION_KEYS } = require("../lib/go-live-confirmations");
  const sections = getGoLiveSections();
  const blockingCount = sections.filter((s: { status: string }) => s.status === "blocking").length;

  // Alle 4 Keys als bestätigt simulieren
  const allConfirmed: Record<string, { key: string; confirmedBy: string; confirmedAt: string }> = {};
  for (const key of MANUAL_CONFIRMATION_KEYS) {
    allConfirmed[key] = {
      key,
      confirmedBy: "test@example.com",
      confirmedAt: new Date().toISOString(),
    };
  }

  const score = calculateGoLiveScore(sections, allConfirmed as Parameters<typeof calculateGoLiveScore>[1]);
  if (blockingCount === 0) {
    assert.equal(
      score,
      100,
      `Score mit allen Confirmations und ohne Blocking soll 100 sein. Aktuell: ${score}`,
    );
  } else {
    // Bei Blocking darf Score auch mit Confirmations nicht 100 sein
    assert.ok(
      score < 100,
      `Score mit Blocking darf nicht 100 sein, auch nicht mit Confirmations. Aktuell: ${score}`,
    );
  }
});

test("Go-Live (Confirmations): calculateGoLiveScore mit Blocking bleibt < 100 trotz Confirmations", () => {
  const { MANUAL_CONFIRMATION_KEYS } = require("../lib/go-live-confirmations");
  // Fake-Section mit blocking-Status
  const fakeSections = [
    { sectionId: "X", title: "Test", status: "blocking" as const, summary: "", checks: [], findings: [] },
  ];
  const allConfirmed: Record<string, { key: string; confirmedBy: string; confirmedAt: string }> = {};
  for (const key of MANUAL_CONFIRMATION_KEYS) {
    allConfirmed[key] = { key, confirmedBy: "test@test.com", confirmedAt: new Date().toISOString() };
  }
  const score = calculateGoLiveScore(fakeSections, allConfirmed as Parameters<typeof calculateGoLiveScore>[1]);
  assert.ok(
    score < 100,
    `Bei blocking-Sektionen darf Score nie 100 sein, auch nicht mit Confirmations. Aktuell: ${score}`,
  );
});

test("Go-Live (Confirmations): runGoLiveCheck enthält confirmations-Feld", () => {
  const result = runGoLiveCheck();
  assert.ok(
    "confirmations" in result,
    "runGoLiveCheck() Ergebnis muss 'confirmations' Feld enthalten",
  );
  assert.equal(
    typeof result.confirmations,
    "object",
    "confirmations muss ein Objekt sein",
  );
});

test("Go-Live (Confirmations): getGoLiveChecklist mit Confirmations – CL01 ist done:true wenn bestätigt", () => {
  const allConfirmed = {
    prod_domain: { key: "prod_domain" as const, confirmedBy: "test@test.com", confirmedAt: new Date().toISOString() },
  };
  const checklist = getGoLiveChecklist(allConfirmed);
  const cl01 = checklist.find((item) => item.id === "CL01");
  assert.ok(cl01, "CL01 muss in der Checkliste sein");
  assert.equal(cl01.done, true, `CL01 soll done:true sein wenn prod_domain bestätigt. Ist: ${cl01.done}`);
});

test("Go-Live (Confirmations): getGoLiveChecklist ohne Confirmations – CL01/CL09/CL10 sind done:null", () => {
  const checklist = getGoLiveChecklist();
  for (const id of ["CL01", "CL09", "CL10"]) {
    const item = checklist.find((i) => i.id === id);
    assert.ok(item, `${id} muss in der Checkliste sein`);
    assert.equal(item.done, null, `${id} soll done:null sein ohne Bestätigung. Ist: ${item.done}`);
  }
});

test("Go-Live (Confirmations): Bestätigungen wirken niemals blocking", () => {
  // Keine Confirmations → sections dürfen weiterhin nicht blocking wegen fehlender Confirmations sein
  const sections = getGoLiveSections();
  for (const section of sections) {
    // Keine Sektion darf nur wegen fehlender manueller Bestätigung blocking sein
    if (section.status === "blocking") {
      // Finde den Grund (findings)
      const noConfirmBlocking = section.findings.some((f) =>
        f.toLowerCase().includes("confirmation") || f.toLowerCase().includes("bestätig"),
      );
      assert.ok(
        !noConfirmBlocking,
        `Sektion ${section.sectionId} ist blocking wegen fehlender Bestätigung – das ist verboten`,
      );
    }
  }
});

test("Go-Live (Confirmations): API-Route /api/admin/go-live/confirmations/route.ts existiert", () => {
  assert.ok(
    existsSync(
      resolve(
        process.cwd(),
        "app/api/admin/go-live/confirmations/route.ts",
      ),
    ),
    "app/api/admin/go-live/confirmations/route.ts fehlt",
  );
});

test("Go-Live (Confirmations): Confirmations-Route hat GET und POST", () => {
  const { readFileSync } = require("fs");
  const src: string = readFileSync(
    resolve(process.cwd(), "app/api/admin/go-live/confirmations/route.ts"),
    "utf8",
  );
  assert.ok(src.includes("export async function GET"), "Confirmations-Route: GET fehlt");
  assert.ok(src.includes("export async function POST"), "Confirmations-Route: POST fehlt");
});

test("Go-Live (Confirmations): Confirmations-Route prüft Admin (getAdminContext)", () => {
  const { readFileSync } = require("fs");
  const src: string = readFileSync(
    resolve(process.cwd(), "app/api/admin/go-live/confirmations/route.ts"),
    "utf8",
  );
  assert.ok(
    src.includes("getAdminContext"),
    "Confirmations-Route muss Admin via getAdminContext prüfen",
  );
  assert.ok(
    src.includes("UNAUTHORIZED"),
    "Confirmations-Route muss UNAUTHORIZED zurückgeben wenn kein Admin",
  );
});

test("Go-Live (Confirmations): go-live-agent.ts exportiert MANUAL_CONFIRMATION_KEYS", () => {
  const { readFileSync } = require("fs");
  const src: string = readFileSync(
    resolve(process.cwd(), "lib/go-live-agent.ts"),
    "utf8",
  );
  assert.ok(
    src.includes("ManualConfirmationKey") &&
    src.includes("ConfirmationsMap"),
    "lib/go-live-agent.ts muss ManualConfirmationKey und ConfirmationsMap re-exportieren",
  );
});
