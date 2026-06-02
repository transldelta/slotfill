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

test("Go-Live: genau 10 Abschnitte (A–J) vorhanden", () => {
  const sections = getGoLiveSections();
  assert.equal(sections.length, 10, `Erwartet 10, erhalten: ${sections.length}`);
});

test("Go-Live: Abschnitt-IDs sind A bis J", () => {
  const sections = getGoLiveSections();
  const ids = sections.map((s) => s.sectionId);
  const expected = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
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

// ─── Legal-Seiten – Impressum, AGB, Datenschutz, AVV ─────────────────────────

test("Legal: ImpressumContent enthält Pflichtangaben § 5 DDG", () => {
  const { readFileSync } = require("fs");
  // Inhalt liegt jetzt in der shared Component – Root-Page importiert nur
  const contentPath = resolve(process.cwd(), "components/legal/ImpressumContent.tsx");
  assert.ok(existsSync(contentPath), "components/legal/ImpressumContent.tsx fehlt");
  const src: string = readFileSync(contentPath, "utf8");
  assert.ok(
    src.includes("Brahim Ben Abla"),
    "ImpressumContent muss den Betreibernamen 'Brahim Ben Abla' enthalten (§ 5 DDG)",
  );
  assert.ok(
    src.includes("Schlesier Straße 64"),
    "ImpressumContent muss die korrekte Adresse 'Schlesier Straße 64' enthalten",
  );
  assert.ok(
    src.includes("transl.delta@gmail.com"),
    "ImpressumContent muss die Kontakt-E-Mail 'transl.delta@gmail.com' enthalten",
  );
  assert.ok(
    src.includes("76227"),
    "ImpressumContent muss die Postleitzahl '76227' (Karlsruhe) enthalten",
  );
});

test("Legal: AgbContent enthält Testphase, kein SMS im Trial, Provider-Kosten-Hinweis", () => {
  const { readFileSync } = require("fs");
  const contentPath = resolve(process.cwd(), "components/legal/AgbContent.tsx");
  assert.ok(existsSync(contentPath), "components/legal/AgbContent.tsx fehlt");
  const src: string = readFileSync(contentPath, "utf8");
  assert.ok(
    src.includes("14") && (src.includes("Testphase") || src.includes("Trial")),
    "AgbContent muss Hinweis auf 14-tägige Testphase enthalten",
  );
  assert.ok(
    src.includes("keine echten SMS") || src.includes("kein echter SMS") || src.includes("keine echten"),
    "AgbContent muss klarstellen, dass im Testmodus keine echten SMS/WhatsApp versendet werden",
  );
  assert.ok(
    src.includes("AVV") || src.includes("Auftragsverarbeitung"),
    "AgbContent muss Hinweis auf AVV / Auftragsverarbeitung enthalten",
  );
  assert.ok(
    src.includes("Twilio") || src.includes("Provider") || src.includes("provider"),
    "AgbContent muss Hinweis auf externe Messaging-Provider (z.B. Twilio) enthalten",
  );
});

test("Legal: DatenschutzContent verwendet 'datenschutzbewusst' statt 'DSGVO-konform garantiert'", () => {
  const { readFileSync } = require("fs");
  const contentPath = resolve(process.cwd(), "components/legal/DatenschutzContent.tsx");
  assert.ok(existsSync(contentPath), "components/legal/DatenschutzContent.tsx fehlt");
  const src: string = readFileSync(contentPath, "utf8");
  assert.ok(
    !src.includes("DSGVO-konform garantiert") && !src.includes("DSGVO garantiert"),
    "DatenschutzContent darf nicht 'DSGVO-konform garantiert' behaupten",
  );
  assert.ok(
    src.includes("datenschutzbewusst") || src.includes("datenschutz­bewusst"),
    "DatenschutzContent soll 'datenschutzbewusst' statt Compliance-Garantie verwenden",
  );
});

test("Legal: AvvContent existiert und enthält AVV-Pflichthinweis", () => {
  const { readFileSync } = require("fs");
  const contentPath = resolve(process.cwd(), "components/legal/AvvContent.tsx");
  assert.ok(existsSync(contentPath), "components/legal/AvvContent.tsx fehlt – AVV-Seite muss vorhanden sein");
  const src: string = readFileSync(contentPath, "utf8");
  assert.ok(
    src.includes("Art. 28") || src.includes("Auftragsverarbeitung"),
    "AvvContent muss Hinweis auf Art. 28 DSGVO / Auftragsverarbeitung enthalten",
  );
});

test("Legal: Locale Legal-Seiten existieren (app/[locale]/{impressum,agb,datenschutz,avv})", () => {
  const localeLegalPages = [
    "app/[locale]/impressum/page.tsx",
    "app/[locale]/agb/page.tsx",
    "app/[locale]/datenschutz/page.tsx",
    "app/[locale]/avv/page.tsx",
  ];
  for (const p of localeLegalPages) {
    assert.ok(
      existsSync(resolve(process.cwd(), p)),
      `${p} fehlt – Locale Legal-Route muss vorhanden sein (für /de/agb, /en/agb, etc.)`,
    );
  }
});

test("Legal: Locale Legal-Seiten nutzen shared Components (kein Code-Duplikat)", () => {
  const { readFileSync } = require("fs");
  const checks = [
    { page: "app/[locale]/impressum/page.tsx", component: "ImpressumContent" },
    { page: "app/[locale]/agb/page.tsx",       component: "AgbContent" },
    { page: "app/[locale]/datenschutz/page.tsx", component: "DatenschutzContent" },
    { page: "app/[locale]/avv/page.tsx",        component: "AvvContent" },
  ];
  for (const { page, component } of checks) {
    const fullPath = resolve(process.cwd(), page);
    if (existsSync(fullPath)) {
      const src: string = readFileSync(fullPath, "utf8");
      assert.ok(
        src.includes(component),
        `${page} muss die shared Component '${component}' verwenden`,
      );
    }
  }
});

test("Legal: Root Legal-Seiten existieren weiterhin (/impressum, /agb, /datenschutz, /avv)", () => {
  const rootPages = [
    "app/impressum/page.tsx",
    "app/agb/page.tsx",
    "app/datenschutz/page.tsx",
    "app/avv/page.tsx",
  ];
  for (const p of rootPages) {
    assert.ok(
      existsSync(resolve(process.cwd(), p)),
      `Root-Route ${p} fehlt – muss weiterhin erreichbar sein`,
    );
  }
});

test("Legal: Legal-Seiten dürfen persönlichen Namen enthalten (erlaubte Ausnahme)", () => {
  const { readFileSync } = require("fs");
  // Die tatsächlichen Inhalte liegen in den Content-Components
  const legalContentFiles = [
    "components/legal/ImpressumContent.tsx",
    "components/legal/AgbContent.tsx",
    "components/legal/DatenschutzContent.tsx",
    "components/legal/AvvContent.tsx",
  ];
  for (const p of legalContentFiles) {
    const fullPath = resolve(process.cwd(), p);
    if (existsSync(fullPath)) {
      const src: string = readFileSync(fullPath, "utf8");
      // Legal-Content-Dateien DÜRFEN persönliche Namen enthalten – kein Fehler
      assert.ok(src.length > 0, `${p} ist leer`);
    }
  }
});

test("Legal: Footer in app/[locale]/page.tsx verlinkt auf locale-spezifische Legal-Seiten", () => {
  const { readFileSync } = require("fs");
  const localePage = resolve(process.cwd(), "app/[locale]/page.tsx");
  assert.ok(existsSync(localePage), "app/[locale]/page.tsx fehlt");
  const src: string = readFileSync(localePage, "utf8");
  assert.ok(
    src.includes("/${locale}/impressum") || src.includes("`/${locale}/impressum`"),
    "Footer muss auf /${locale}/impressum verlinken (nicht hardcoded /impressum)",
  );
  assert.ok(
    src.includes("/${locale}/datenschutz") || src.includes("`/${locale}/datenschutz`"),
    "Footer muss auf /${locale}/datenschutz verlinken",
  );
  assert.ok(
    src.includes("/${locale}/agb") || src.includes("`/${locale}/agb`"),
    "Footer muss auf /${locale}/agb verlinken",
  );
});

// ─── Legal i18n & RTL ────────────────────────────────────────────────────────

test("Legal i18n: lib/legal-content.ts existiert und exportiert getLegalContent", () => {
  const contentPath = resolve(process.cwd(), "lib/legal-content.ts");
  assert.ok(existsSync(contentPath), "lib/legal-content.ts fehlt");
  const mod = require("../lib/legal-content");
  assert.ok(typeof mod.getLegalContent === "function", "getLegalContent muss eine Funktion sein");
  assert.ok(typeof mod.isRtlLocale === "function", "isRtlLocale muss eine Funktion sein");
  assert.ok(typeof mod.isLegalDraft === "function", "isLegalDraft muss eine Funktion sein");
});

test("Legal i18n: DE-AGB enthält 'Allgemeine Geschäftsbedingungen'", () => {
  const { getLegalContent } = require("../lib/legal-content");
  const c = getLegalContent("de");
  assert.ok(
    c.agbTitle.includes("Allgemeine Geschäftsbedingungen"),
    `DE agbTitle muss 'Allgemeine Geschäftsbedingungen' enthalten, ist: '${c.agbTitle}'`,
  );
});

test("Legal i18n: EN-AGB enthält 'Terms and Conditions', nicht 'Allgemeine Geschäftsbedingungen'", () => {
  const { getLegalContent } = require("../lib/legal-content");
  const c = getLegalContent("en");
  assert.ok(
    c.agbTitle === "Terms and Conditions",
    `EN agbTitle muss 'Terms and Conditions' sein, ist: '${c.agbTitle}'`,
  );
  assert.ok(
    !c.agbTitle.includes("Allgemeine Geschäftsbedingungen"),
    "EN agbTitle darf nicht 'Allgemeine Geschäftsbedingungen' enthalten",
  );
});

test("Legal i18n: FR-AGB enthält 'Conditions générales', nicht 'Allgemeine Geschäftsbedingungen'", () => {
  const { getLegalContent } = require("../lib/legal-content");
  const c = getLegalContent("fr");
  assert.ok(
    c.agbTitle.includes("Conditions générales"),
    `FR agbTitle muss 'Conditions générales' enthalten, ist: '${c.agbTitle}'`,
  );
  assert.ok(
    !c.agbTitle.includes("Allgemeine Geschäftsbedingungen"),
    "FR agbTitle darf nicht 'Allgemeine Geschäftsbedingungen' enthalten",
  );
});

test("Legal i18n: AR-AGB enthält arabischen Titel 'الشروط والأحكام', nicht 'Allgemeine Geschäftsbedingungen'", () => {
  const { getLegalContent } = require("../lib/legal-content");
  const c = getLegalContent("ar");
  assert.ok(
    c.agbTitle === "الشروط والأحكام",
    `AR agbTitle muss 'الشروط والأحكام' sein, ist: '${c.agbTitle}'`,
  );
  assert.ok(
    !c.agbTitle.includes("Allgemeine Geschäftsbedingungen"),
    "AR agbTitle darf nicht 'Allgemeine Geschäftsbedingungen' enthalten",
  );
});

test("Legal i18n: AR-Locale ist RTL (dir='rtl')", () => {
  const { getLegalContent, isRtlLocale } = require("../lib/legal-content");
  const c = getLegalContent("ar");
  assert.equal(c.dir, "rtl", "AR locale muss dir='rtl' haben");
  assert.ok(isRtlLocale("ar"), "isRtlLocale('ar') muss true zurückgeben");
  assert.ok(!isRtlLocale("de"), "isRtlLocale('de') muss false zurückgeben");
  assert.ok(!isRtlLocale("en"), "isRtlLocale('en') muss false zurückgeben");
});

test("Legal i18n: AgbContent-Quellcode enthält RTL-Handling (dir='rtl' für AR)", () => {
  const { readFileSync } = require("fs");
  const src: string = readFileSync(
    resolve(process.cwd(), "components/legal/AgbContent.tsx"),
    "utf8",
  );
  assert.ok(
    src.includes("rtl"),
    "AgbContent muss 'rtl' für Arabic enthalten",
  );
  assert.ok(
    src.includes("isRtlLocale") || src.includes("isRtl"),
    "AgbContent muss RTL-Prüfung verwenden (isRtlLocale oder isRtl)",
  );
});

test("Legal i18n: Nicht-DE-Locale haben authorityNotice (Hinweis auf dt. Originalfassung)", () => {
  const { getLegalContent } = require("../lib/legal-content");
  const nonDeLocales = ["en", "fr", "es", "ar", "pt", "ru", "zh", "hi", "bn"];
  for (const loc of nonDeLocales) {
    const c = getLegalContent(loc);
    assert.ok(
      c.authorityNotice && c.authorityNotice.length > 10,
      `Locale '${loc}' muss authorityNotice enthalten (Hinweis: dt. Version ist maßgeblich)`,
    );
    assert.ok(
      c.authorityLinkLabel && c.authorityLinkLabel.length > 3,
      `Locale '${loc}' muss authorityLinkLabel enthalten`,
    );
  }
});

test("Legal i18n: ES-AGB enthält 'Términos y condiciones', nicht 'Allgemeine Geschäftsbedingungen'", () => {
  const { getLegalContent } = require("../lib/legal-content");
  const c = getLegalContent("es");
  assert.ok(
    c.agbTitle.includes("Términos"),
    `ES agbTitle muss 'Términos' enthalten, ist: '${c.agbTitle}'`,
  );
  assert.ok(
    !c.agbTitle.includes("Allgemeine Geschäftsbedingungen"),
    "ES agbTitle darf nicht 'Allgemeine Geschäftsbedingungen' enthalten",
  );
});

test("Legal i18n: noindex bleibt gesetzt, solange LEGAL_REVIEW_APPROVED nicht 'true' ist", () => {
  const { isLegalDraft } = require("../lib/legal-content");
  // Im Testmodus ist LEGAL_REVIEW_APPROVED nicht gesetzt → isDraft = true
  const originalEnv = process.env.LEGAL_REVIEW_APPROVED;
  delete process.env.LEGAL_REVIEW_APPROVED;
  assert.ok(isLegalDraft(), "isLegalDraft() muss true sein wenn LEGAL_REVIEW_APPROVED nicht gesetzt");
  process.env.LEGAL_REVIEW_APPROVED = "false";
  assert.ok(isLegalDraft(), "isLegalDraft() muss true sein wenn LEGAL_REVIEW_APPROVED='false'");
  process.env.LEGAL_REVIEW_APPROVED = "true";
  assert.ok(!isLegalDraft(), "isLegalDraft() muss false sein wenn LEGAL_REVIEW_APPROVED='true'");
  // Restore
  if (originalEnv === undefined) {
    delete process.env.LEGAL_REVIEW_APPROVED;
  } else {
    process.env.LEGAL_REVIEW_APPROVED = originalEnv;
  }
});

test("Legal i18n: AgbContent rendert DE-Titel 'Allgemeine Geschäftsbedingungen' bei locale=de", () => {
  const { readFileSync } = require("fs");
  const src: string = readFileSync(
    resolve(process.cwd(), "components/legal/AgbContent.tsx"),
    "utf8",
  );
  // Die DE-Vollversion muss vorhanden sein (§ 1-8 Blöcke)
  assert.ok(src.includes("§ 1"), "AgbContent DE muss § 1 enthalten");
  assert.ok(src.includes("§ 3"), "AgbContent DE muss § 3 enthalten");
  assert.ok(src.includes("isDE"), "AgbContent muss isDE-Flag für bedingte Ausgabe verwenden");
});

test("Legal i18n: AgbContent-Nicht-DE gibt keine deutschen §-Überschriften aus (conditionelles Rendering)", () => {
  const { readFileSync } = require("fs");
  const src: string = readFileSync(
    resolve(process.cwd(), "components/legal/AgbContent.tsx"),
    "utf8",
  );
  // Die §§ müssen innerhalb des isDE-Blocks sein, nicht für alle Locales ausgegeben werden
  // Prüfung: isDE && (... § 1 ...) – der Block mit §§ ist isDE-bedingt
  assert.ok(
    src.includes("{isDE && ("),
    "AgbContent muss {isDE && (...)} Block für §§ verwenden – §§ nur für DE sichtbar",
  );
  assert.ok(
    src.includes("{!isDE && ("),
    "AgbContent muss {!isDE && (...)} Block für lokalisierte Zusammenfassung verwenden",
  );
});

// ─── Automatische Kommunikation ──────────────────────────────────────────────

test("Legal: Automatische Kommunikation enthält keinen persönlichen Namen", () => {
  const { readFileSync } = require("fs");
  const automatedFiles = [
    "lib/email/templates.ts",
    "app/kontakt/actions.ts",
  ];
  const personalNames = ["Brahim", "Ben Abla", "transl.delta@gmail.com"];
  for (const f of automatedFiles) {
    const fullPath = resolve(process.cwd(), f);
    if (existsSync(fullPath)) {
      const src: string = readFileSync(fullPath, "utf8");
      for (const name of personalNames) {
        assert.ok(
          !src.includes(name),
          `${f} darf keinen persönlichen Namen ('${name}') enthalten – nur Legal-Seiten erlaubt`,
        );
      }
    }
  }
});

test("Legal: Automatische Kommunikation verwendet 'SlotFill Team'", () => {
  const { readFileSync } = require("fs");
  const templatesPath = resolve(process.cwd(), "lib/email/templates.ts");
  assert.ok(existsSync(templatesPath), "lib/email/templates.ts fehlt");
  const src: string = readFileSync(templatesPath, "utf8");
  assert.ok(
    src.includes("BRAND_TEAM_NAME") || src.includes("SlotFill Team"),
    "lib/email/templates.ts muss 'SlotFill Team' oder BRAND_TEAM_NAME als Absender verwenden",
  );
});

test("Legal: Marketing/Trial/Kontakt darf keinen persönlichen Namen enthalten", () => {
  const { readFileSync } = require("fs");
  const marketingFiles = [
    "app/landing/page.tsx",
    "app/[locale]/page.tsx",
    "components/landing.tsx",
    "components/landing-hero.tsx",
  ];
  const personalNames = ["Brahim", "Ben Abla"];
  for (const f of marketingFiles) {
    const fullPath = resolve(process.cwd(), f);
    if (existsSync(fullPath)) {
      const src: string = readFileSync(fullPath, "utf8");
      for (const name of personalNames) {
        assert.ok(
          !src.includes(name),
          `${f} (Marketing) darf keinen persönlichen Namen ('${name}') enthalten`,
        );
      }
    }
  }
});

test("Legal: app/impressum/page.tsx hat robots noindex (kein SEO-Index)", () => {
  const { readFileSync } = require("fs");
  const path = resolve(process.cwd(), "app/impressum/page.tsx");
  const src: string = readFileSync(path, "utf8");
  assert.ok(
    src.includes("index: false") || src.includes("noindex"),
    "Impressum sollte robots:noindex haben",
  );
});

// ─── Markenkommunikation – kein persönlicher Name ────────────────────────────

test("Brand: lib/brand.ts existiert", () => {
  assert.ok(
    existsSync(resolve(process.cwd(), "lib/brand.ts")),
    "lib/brand.ts fehlt",
  );
});

test("Brand: BRAND_NAME ist 'SlotFill'", () => {
  const { BRAND_NAME } = require("../lib/brand");
  assert.equal(BRAND_NAME, "SlotFill", `BRAND_NAME soll 'SlotFill' sein, ist: ${BRAND_NAME}`);
});

test("Brand: BRAND_TEAM_NAME ist 'SlotFill Team'", () => {
  const { BRAND_TEAM_NAME } = require("../lib/brand");
  assert.equal(BRAND_TEAM_NAME, "SlotFill Team", `BRAND_TEAM_NAME soll 'SlotFill Team' sein, ist: ${BRAND_TEAM_NAME}`);
});

test("Brand: PERSONAL_SIGNATURE_ALLOWED ist false", () => {
  const { PERSONAL_SIGNATURE_ALLOWED } = require("../lib/brand");
  assert.equal(
    PERSONAL_SIGNATURE_ALLOWED,
    false,
    "PERSONAL_SIGNATURE_ALLOWED muss false sein",
  );
});

test("Brand: SUPPORT_EMAIL enthält keinen persönlichen Namen oder Gmail", () => {
  const { SUPPORT_EMAIL } = require("../lib/brand");
  assert.ok(
    !SUPPORT_EMAIL.includes("gmail"),
    `SUPPORT_EMAIL darf keine Gmail-Adresse sein: ${SUPPORT_EMAIL}`,
  );
  assert.ok(
    !SUPPORT_EMAIL.toLowerCase().includes("brahim"),
    `SUPPORT_EMAIL darf keinen persönlichen Namen enthalten: ${SUPPORT_EMAIL}`,
  );
});

test("Brand: CONTACT_EMAIL enthält keinen persönlichen Namen oder Gmail", () => {
  const { CONTACT_EMAIL } = require("../lib/brand");
  assert.ok(
    !CONTACT_EMAIL.includes("gmail"),
    `CONTACT_EMAIL darf keine Gmail-Adresse sein: ${CONTACT_EMAIL}`,
  );
  assert.ok(
    !CONTACT_EMAIL.toLowerCase().includes("brahim"),
    `CONTACT_EMAIL darf keinen persönlichen Namen enthalten: ${CONTACT_EMAIL}`,
  );
});

test("Brand: isCommunicationAllowed erlaubt 'inbound' und 'transactional'", () => {
  const { isCommunicationAllowed } = require("../lib/brand");
  assert.ok(isCommunicationAllowed("inbound"), "'inbound' muss erlaubt sein");
  assert.ok(isCommunicationAllowed("transactional"), "'transactional' muss erlaubt sein");
  assert.ok(!isCommunicationAllowed("cold_outreach"), "'cold_outreach' darf NICHT erlaubt sein");
});

test("Brand: app/kontakt/actions.ts verwendet CONTACT_EMAIL aus lib/brand.ts (kein Gmail-Fallback)", () => {
  const { readFileSync } = require("fs");
  const src: string = readFileSync(
    resolve(process.cwd(), "app/kontakt/actions.ts"),
    "utf8",
  );
  assert.ok(
    !src.includes("gmail.com"),
    "app/kontakt/actions.ts darf keine Gmail-Adresse als Fallback enthalten",
  );
  assert.ok(
    src.includes("CONTACT_EMAIL"),
    "app/kontakt/actions.ts muss CONTACT_EMAIL aus lib/brand.ts verwenden",
  );
});

test("Brand: lib/email/templates.ts enthält keinen persönlichen Namen", () => {
  const { readFileSync } = require("fs");
  const src: string = readFileSync(
    resolve(process.cwd(), "lib/email/templates.ts"),
    "utf8",
  );
  assert.ok(!src.includes("Brahim"), "lib/email/templates.ts darf 'Brahim' nicht enthalten");
  assert.ok(!src.includes("Ben Abla"), "lib/email/templates.ts darf 'Ben Abla' nicht enthalten");
  assert.ok(
    !src.includes("transl.delta@gmail.com"),
    "lib/email/templates.ts darf 'transl.delta@gmail.com' nicht enthalten",
  );
});

test("Brand: lib/email/templates.ts verwendet BRAND_TEAM_NAME aus lib/brand.ts", () => {
  const { readFileSync } = require("fs");
  const src: string = readFileSync(
    resolve(process.cwd(), "lib/email/templates.ts"),
    "utf8",
  );
  assert.ok(
    src.includes("BRAND_TEAM_NAME"),
    "lib/email/templates.ts muss BRAND_TEAM_NAME aus lib/brand.ts verwenden",
  );
});

test("Brand: contactConfirmationEmail existiert und enthält keinen persönlichen Namen", () => {
  const { contactConfirmationEmail } = require("../lib/email/templates");
  const html: string = contactConfirmationEmail("Max Mustermann");
  assert.ok(
    !html.includes("Brahim"),
    "contactConfirmationEmail darf 'Brahim' nicht enthalten",
  );
  assert.ok(
    !html.includes("gmail"),
    "contactConfirmationEmail darf keine Gmail-Adresse enthalten",
  );
  assert.ok(
    html.toLowerCase().includes("slotfill"),
    "contactConfirmationEmail muss 'SlotFill' enthalten",
  );
});

test("Brand: trialWelcomeEmail existiert und enthält keinen persönlichen Namen", () => {
  const { trialWelcomeEmail } = require("../lib/email/templates");
  const html: string = trialWelcomeEmail("Testpraxis GmbH");
  assert.ok(
    !html.includes("Brahim"),
    "trialWelcomeEmail darf 'Brahim' nicht enthalten",
  );
  assert.ok(
    !html.includes("gmail"),
    "trialWelcomeEmail darf keine Gmail-Adresse enthalten",
  );
  assert.ok(
    html.toLowerCase().includes("slotfill"),
    "trialWelcomeEmail muss 'SlotFill' enthalten",
  );
  assert.ok(
    html.includes("14"),
    "trialWelcomeEmail muss die 14-tägige Testphase erwähnen",
  );
});

test("Brand: trialWelcomeEmail enthält Hinweis auf kein automatisches Messaging", () => {
  const { trialWelcomeEmail } = require("../lib/email/templates");
  const html: string = trialWelcomeEmail("Testpraxis GmbH");
  const lower = html.toLowerCase();
  assert.ok(
    lower.includes("ohne") || lower.includes("kein") || lower.includes("simuliert"),
    "trialWelcomeEmail muss erwähnen dass kein echter SMS/WhatsApp-Versand im Trial",
  );
});

test("Brand: testPracticeEmail enthält keinen persönlichen Namen und keine private Telefon/E-Mail", () => {
  const { testPracticeEmail } = require("../lib/email/templates");
  const html: string = testPracticeEmail("Testpraxis");
  assert.ok(!html.includes("Brahim"), "testPracticeEmail darf 'Brahim' nicht enthalten");
  assert.ok(
    !html.includes("gmail"),
    "testPracticeEmail darf keine Gmail-Adresse enthalten",
  );
  assert.ok(
    html.toLowerCase().includes("slotfill"),
    "testPracticeEmail muss 'SlotFill' enthalten",
  );
});

test("Brand: Go-Live Abschnitt J (Markenkommunikation) vorhanden", () => {
  const sections = getGoLiveSections();
  const j = sections.find((s) => s.sectionId === "J");
  assert.ok(j, "Abschnitt J fehlt");
  assert.ok(
    j.title.toLowerCase().includes("marken") ||
    j.title.toLowerCase().includes("persönlich") ||
    j.title.toLowerCase().includes("brand"),
    `Abschnitt J Titel unpassend: ${j.title}`,
  );
  assert.ok(j.checks.length >= 4, `Abschnitt J braucht ≥ 4 Checks, hat: ${j.checks.length}`);
});

test("Brand: Go-Live Abschnitt J – J1 (Brand-Config importiert) ist ready", () => {
  const sections = getGoLiveSections();
  const j = sections.find((s) => s.sectionId === "J")!;
  const j1 = j.checks.find((c) => c.id === "J1_BRAND_CONFIG_EXISTS")!;
  assert.ok(j1, "J1_BRAND_CONFIG_EXISTS fehlt");
  assert.equal(
    j1.status,
    "ready",
    `J1 soll 'ready' sein (BRAND_NAME/BRAND_TEAM_NAME/PERSONAL_SIGNATURE_ALLOWED korrekt importiert). Ist: ${j1.status} | Note: ${j1.note}`,
  );
});

test("Brand: Go-Live Abschnitt J – J1 verwendet Runtime-Import (nicht existsSync)", () => {
  // Sicherstellen dass J1 auf Vercel korrekt funktioniert:
  // Der Check darf NICHT existsSync("lib/brand.ts") verwenden,
  // sondern muss die importierten Werte prüfen.
  const { readFileSync } = require("fs");
  const src: string = readFileSync(
    resolve(process.cwd(), "lib/go-live-agent.ts"),
    "utf8",
  );
  // Der neue Check muss BRAND_NAME, BRAND_TEAM_NAME, PERSONAL_SIGNATURE_ALLOWED prüfen
  assert.ok(
    src.includes("BRAND_NAME") && src.includes("BRAND_TEAM_NAME"),
    "go-live-agent.ts muss BRAND_NAME und BRAND_TEAM_NAME für J1 importieren",
  );
  // Der alte routeExists("lib/brand.ts") === "found" Check darf nicht mehr da sein
  // (wurde durch Runtime-Import-Check ersetzt)
  assert.ok(
    !src.includes('routeExists("lib/brand.ts")'),
    'J1 darf nicht mehr routeExists("lib/brand.ts") verwenden – Vercel-Inkompatibel',
  );
});

test("Brand: Go-Live Abschnitt J – J5 (PERSONAL_SIGNATURE_ALLOWED) ist ready", () => {
  const sections = getGoLiveSections();
  const j = sections.find((s) => s.sectionId === "J")!;
  const j5 = j.checks.find((c) => c.id === "J5_PERSONAL_SIGNATURE_FORBIDDEN")!;
  assert.ok(j5, "J5_PERSONAL_SIGNATURE_FORBIDDEN fehlt");
  assert.equal(
    j5.status,
    "ready",
    `J5 soll 'ready' sein (PERSONAL_SIGNATURE_ALLOWED === false). Ist: ${j5.status}`,
  );
});

test("Brand: Go-Live Abschnitt J – J2 (kein Gmail-Fallback) ist ready", () => {
  const sections = getGoLiveSections();
  const j = sections.find((s) => s.sectionId === "J")!;
  const j2 = j.checks.find((c) => c.id === "J2_NO_PERSONAL_EMAIL_IN_CONTACT")!;
  assert.ok(j2, "J2_NO_PERSONAL_EMAIL_IN_CONTACT fehlt");
  assert.equal(
    j2.status,
    "ready",
    `J2 soll 'ready' sein (kein Gmail in kontakt/actions.ts). Ist: ${j2.status} | Note: ${j2.note}`,
  );
});

test("Brand: Go-Live Abschnitt J – J3 (kein persönlicher Name in Templates) ist ready", () => {
  const sections = getGoLiveSections();
  const j = sections.find((s) => s.sectionId === "J")!;
  const j3 = j.checks.find((c) => c.id === "J3_NO_PERSONAL_NAME_IN_TEMPLATES")!;
  assert.ok(j3, "J3_NO_PERSONAL_NAME_IN_TEMPLATES fehlt");
  assert.equal(
    j3.status,
    "ready",
    `J3 soll 'ready' sein (kein persönlicher Name in templates.ts). Ist: ${j3.status}`,
  );
});

test("Brand: Go-Live Abschnitt J – kein Blocking (alle Brand-Checks erfüllt)", () => {
  const sections = getGoLiveSections();
  const j = sections.find((s) => s.sectionId === "J")!;
  assert.notEqual(
    j.status,
    "blocking",
    `Abschnitt J darf nicht blocking sein wenn Brand-Konfiguration korrekt ist. Status: ${j.status}. Blocking-Checks: ${j.checks.filter((c) => c.status === "blocking").map((c) => `${c.id}: ${c.note}`).join(", ")}`,
  );
});

test("Brand: Go-Live Abschnitt J – ist 'ready' (Vercel-sicher)", () => {
  const sections = getGoLiveSections();
  const j = sections.find((s) => s.sectionId === "J")!;
  assert.equal(
    j.status,
    "ready",
    `Abschnitt J soll 'ready' sein wenn alle Brand-Checks korrekt sind. Ist: ${j.status}. Checks: ${j.checks.map((c) => `${c.id}=${c.status}`).join(", ")}`,
  );
});

test("Brand: Go-Live Score ≥ 90 ohne Bestätigungen (kein Abschnitt blocking)", () => {
  const sections = getGoLiveSections();
  const score = calculateGoLiveScore(sections);
  const blockingCount = sections.filter((s) => s.status === "blocking").length;
  assert.equal(
    blockingCount,
    0,
    `Kein Abschnitt darf blocking sein. Blocking: ${sections.filter((s) => s.status === "blocking").map((s) => s.sectionId).join(", ")}`,
  );
  assert.ok(
    score >= 90,
    `Score soll ≥ 90 sein ohne Bestätigungen. Ist: ${score}`,
  );
});

test("Brand: app/admin/communication/page.tsx existiert", () => {
  assert.ok(
    existsSync(resolve(process.cwd(), "app/admin/communication/page.tsx")),
    "app/admin/communication/page.tsx fehlt",
  );
});

test("Brand: app/api/admin/communication/route.ts existiert und ist admin-geschützt", () => {
  const { readFileSync } = require("fs");
  const path = resolve(process.cwd(), "app/api/admin/communication/route.ts");
  assert.ok(existsSync(path), "app/api/admin/communication/route.ts fehlt");
  const src: string = readFileSync(path, "utf8");
  assert.ok(src.includes("getAdminContext"), "Communication-Route muss admin-geschützt sein");
  assert.ok(src.includes("UNAUTHORIZED"), "Communication-Route muss UNAUTHORIZED zurückgeben");
});

test("Brand: Keine Kaltakquise – isCommunicationAllowed('cold_outreach') ist false", () => {
  const { isCommunicationAllowed } = require("../lib/brand");
  assert.ok(
    !isCommunicationAllowed("cold_outreach"),
    "Kaltakquise ('cold_outreach') darf niemals als erlaubt gelten",
  );
  assert.ok(
    !isCommunicationAllowed("marketing_blast"),
    "Mass-Marketing ('marketing_blast') darf niemals als erlaubt gelten",
  );
});

test("Brand: Kein echter SMS/WhatsApp-Versand im Trial ohne Provider-Konfiguration", () => {
  // Abschnitt I prüft Messaging-Sicherheit; bleibt weiterhin aktiv
  const sections = getGoLiveSections();
  const i = sections.find((s) => s.sectionId === "I")!;
  assert.ok(i, "Abschnitt I (Messaging-Sicherheit) fehlt");
  assert.notEqual(
    i.status,
    "blocking",
    `Abschnitt I (Messaging) soll nicht blocking sein im Standard-Modus. Status: ${i.status}`,
  );
});

// ─── Logo & Premium Colors ────────────────────────────────────────────────────

test("Logo: SVG-Datei public/brand/slotfill-logo.svg existiert", () => {
  const { existsSync } = require("fs");
  const { resolve } = require("path");
  assert.ok(
    existsSync(resolve(process.cwd(), "public/brand/slotfill-logo.svg")),
    "public/brand/slotfill-logo.svg fehlt",
  );
});

test("Logo: SVG enthält gradient-Definition (Blau → Teal)", () => {
  const { readFileSync, existsSync } = require("fs");
  const { resolve } = require("path");
  const p = resolve(process.cwd(), "public/brand/slotfill-logo.svg");
  if (!existsSync(p)) return;
  const src: string = readFileSync(p, "utf8");
  assert.ok(src.includes("<linearGradient"), "Logo-SVG muss linearGradient enthalten");
  assert.ok(
    src.includes("#2563eb") || src.includes("#3b82f6"),
    "Logo muss blaue Primärfarbe (#2563eb oder #3b82f6) enthalten",
  );
  assert.ok(
    src.includes("#0d9488") || src.includes("#14b8a6"),
    "Logo muss teal Akzentfarbe (#0d9488 oder #14b8a6) enthalten",
  );
});

test("Logo: app/icon.svg existiert (Browser-Favicon)", () => {
  const { existsSync } = require("fs");
  const { resolve } = require("path");
  assert.ok(
    existsSync(resolve(process.cwd(), "app/icon.svg")),
    "app/icon.svg (Browser-Favicon) fehlt",
  );
});

test("Logo: SlotFillLogo-Komponente existiert", () => {
  const { existsSync } = require("fs");
  const { resolve } = require("path");
  assert.ok(
    existsSync(resolve(process.cwd(), "components/ui/SlotFillLogo.tsx")),
    "components/ui/SlotFillLogo.tsx fehlt",
  );
});

test("Logo: SlotFillLogo-Komponente enthält alt-Text 'SlotFill Logo'", () => {
  const { readFileSync, existsSync } = require("fs");
  const { resolve } = require("path");
  const p = resolve(process.cwd(), "components/ui/SlotFillLogo.tsx");
  if (!existsSync(p)) return;
  const src: string = readFileSync(p, "utf8");
  assert.ok(src.includes('alt="SlotFill Logo"'), "SlotFillLogo muss alt-Text 'SlotFill Logo' haben");
});

test("Logo: Landing-Page importiert SlotFillLogo-Komponente", () => {
  const { readFileSync, existsSync } = require("fs");
  const { resolve } = require("path");
  const p = resolve(process.cwd(), "app/[locale]/page.tsx");
  if (!existsSync(p)) return;
  const src: string = readFileSync(p, "utf8");
  assert.ok(src.includes("SlotFillLogo"), "Landing Page muss SlotFillLogo importieren und nutzen");
});

test("Premium Colors: globals.css enthält --color-bg CSS-Variable", () => {
  const { readFileSync, existsSync } = require("fs");
  const { resolve } = require("path");
  const p = resolve(process.cwd(), "app/globals.css");
  if (!existsSync(p)) return;
  const src: string = readFileSync(p, "utf8");
  assert.ok(src.includes("--color-bg"), "globals.css muss --color-bg definieren");
  assert.ok(src.includes("--color-surface"), "globals.css muss --color-surface definieren");
  assert.ok(src.includes("--color-primary"), "globals.css muss --color-primary definieren");
  assert.ok(src.includes("--color-accent"), "globals.css muss --color-accent definieren");
  assert.ok(src.includes("--color-border"), "globals.css muss --color-border definieren");
  assert.ok(src.includes("--color-text"), "globals.css muss --color-text definieren");
  assert.ok(src.includes("--color-muted"), "globals.css muss --color-muted definieren");
});

test("Premium Colors: globals.css enthält Gradient-Button .btn-brand", () => {
  const { readFileSync, existsSync } = require("fs");
  const { resolve } = require("path");
  const p = resolve(process.cwd(), "app/globals.css");
  if (!existsSync(p)) return;
  const src: string = readFileSync(p, "utf8");
  assert.ok(src.includes(".btn-brand"), "globals.css muss .btn-brand Utility-Klasse enthalten");
  assert.ok(src.includes("--gradient-brand"), "globals.css muss --gradient-brand definieren");
});

test("Premium Colors: Dark Mode nutzt dunkles Navy (nicht #000000)", () => {
  const { readFileSync, existsSync } = require("fs");
  const { resolve } = require("path");
  const p = resolve(process.cwd(), "app/globals.css");
  if (!existsSync(p)) return;
  const src: string = readFileSync(p, "utf8");
  // Dark mode background should be navy, not pure black
  assert.ok(
    !src.includes("--color-bg:        #000000") && !src.includes("--color-bg: #000"),
    "Dark mode darf kein reines Schwarz (#000) als --color-bg haben",
  );
  // Should have a dark navy value
  assert.ok(
    src.includes("#0f1729") || src.includes("#0f172a") || src.includes("#111827"),
    "Dark mode --color-bg soll ein dunkles Navy (z.B. #0f1729) sein",
  );
});

test("Premium Colors: tailwind.config.ts enthält brand-Farbpalette", () => {
  const { readFileSync, existsSync } = require("fs");
  const { resolve } = require("path");
  const p = resolve(process.cwd(), "tailwind.config.ts");
  if (!existsSync(p)) return;
  const src: string = readFileSync(p, "utf8");
  assert.ok(src.includes("brand:"), "tailwind.config.ts muss brand-Farbpalette enthalten");
  assert.ok(src.includes("gradient-brand"), "tailwind.config.ts muss gradient-brand enthalten");
});
