/**
 * ClinicSlotHub Form Abuse / Spam Protection Guards (P2).
 *
 * Prüft funktional (Honeypot, Time-Trap, Link-/Script-Filter) und statisch
 * (Verdrahtung in den öffentlichen Server-Actions + unsichtbare Felder in den
 * Formularen, keine Uploads, keine neue Mailaktivierung, Register bleibt gesperrt).
 *
 * Lauf: tsx --test scripts/form-abuse-protection.test.ts
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { isSpammyText, HONEYPOT_FIELD, TIMESTAMP_FIELD, FIELD_LIMITS } from "../lib/form-abuse";
import { checkFormAbuse } from "../lib/form-abuse-server";

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

const ACTIONS = ["app/kontakt/actions.ts", "app/termin-buchen/actions.ts", "app/feedback/actions.ts"];
const FORMS = [
  "app/[locale]/kontakt/LocaleContactPageClient.tsx",
  "app/[locale]/termin-buchen/TerminBuchenClient.tsx",
  "app/book/[slug]/page.tsx",
  "app/[locale]/feedback/page.tsx",
];

function fd(fields: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
}

// ─── 1. Honeypot ──────────────────────────────────────────────────────────────

test("Honeypot Guard: ausgefülltes Honeypot-Feld wird blockiert", () => {
  const valid = fd({ [TIMESTAMP_FIELD]: String(Date.now() - 5000) });
  assert.equal(checkFormAbuse(valid, "t-hp-ok").ok, true, "saubere Eingabe sollte ok sein");
  const trapped = fd({ [TIMESTAMP_FIELD]: String(Date.now() - 5000), [HONEYPOT_FIELD]: "http://spam" });
  assert.equal(checkFormAbuse(trapped, "t-hp-bad").ok, false, "ausgefülltes Honeypot muss blockieren");
});

// ─── 2. Time-Trap ─────────────────────────────────────────────────────────────

test("Time-Trap Guard: fehlender/zu schneller Timestamp wird blockiert", () => {
  assert.equal(checkFormAbuse(fd({}), "t-ts-missing").ok, false, "fehlender Timestamp muss blockieren");
  assert.equal(checkFormAbuse(fd({ [TIMESTAMP_FIELD]: String(Date.now()) }), "t-ts-fast").ok, false, "zu schneller Submit (<3s) muss blockieren");
  assert.equal(checkFormAbuse(fd({ [TIMESTAMP_FIELD]: "nonsense" }), "t-ts-nan").ok, false, "ungültiger Timestamp muss blockieren");
  assert.equal(checkFormAbuse(fd({ [TIMESTAMP_FIELD]: String(Date.now() - 4000) }), "t-ts-ok").ok, true, "realistische Zeit sollte ok sein");
});

// ─── 3. Rate-Limit (best-effort) ──────────────────────────────────────────────

test("Rate-Limit Guard: zu viele Submits in kurzem Fenster werden gebremst", () => {
  const mk = () => fd({ [TIMESTAMP_FIELD]: String(Date.now() - 4000) });
  let blocked = false;
  for (let i = 0; i < 8; i++) {
    if (!checkFormAbuse(mk(), "t-rl").ok) blocked = true;
  }
  assert.equal(blocked, true, "nach mehreren schnellen Submits muss gebremst werden");
});

// ─── 4. Link-/Script-Filter ───────────────────────────────────────────────────

test("Spam Text Guard: zu viele Links / HTML / Script werden erkannt", () => {
  assert.equal(isSpammyText("Hallo, ich habe eine Frage zu Terminen."), false, "normaler Text ist kein Spam");
  assert.equal(isSpammyText("http://a.com http://b.com http://c.net buy now"), true, "3+ Links sind Spam");
  assert.equal(isSpammyText('<script>alert(1)</script>'), true, "Script-Tag ist Spam");
  assert.equal(isSpammyText('<a href="x">click</a>'), true, "HTML-Tag ist Spam");
  assert.equal(isSpammyText("Rufen Sie an: 0123/456"), false, "Telefonnummer ist kein Spam");
});

// ─── 5. Server-Action Verdrahtung ─────────────────────────────────────────────

test("Action Wiring Guard: Kontakt/Booking/Feedback nutzen den Abuse-Schutz", () => {
  for (const f of ACTIONS) {
    const src = read(f);
    assert.ok(src.includes("checkFormAbuse"), `${f}: checkFormAbuse nicht verdrahtet`);
    assert.ok(src.includes("isSpammyText"), `${f}: isSpammyText nicht verdrahtet`);
  }
  // Längenlimits aktiv (zentral definiert + im Kontaktschema genutzt).
  assert.ok(FIELD_LIMITS.message <= 2500 && FIELD_LIMITS.email === 254, "Feldlimits unplausibel");
  assert.ok(read("app/kontakt/actions.ts").includes("FIELD_LIMITS"), "Kontakt nutzt keine Längenlimits");
});

// ─── 6. Formular-Felder vorhanden, keine Uploads ──────────────────────────────

test("Form Fields Guard: unsichtbare Anti-Spam-Felder vorhanden, keine Uploads", () => {
  for (const f of FORMS) {
    const src = read(f);
    assert.ok(src.includes("FormAntiSpamFields"), `${f}: FormAntiSpamFields fehlt`);
    assert.equal(/type=["']file["']/.test(src), false, `${f}: enthält Datei-Upload`);
  }
  const comp = read("components/ui/FormAntiSpamFields.tsx");
  assert.ok(comp.includes("HONEYPOT_FIELD") && comp.includes("TIMESTAMP_FIELD"), "Anti-Spam-Komponente unvollständig");
});

// ─── 7. Keine neue Mail-/Dienst-Aktivierung, kein dangerouslySetInnerHTML ──────

test("No New Service / No HTML Injection Guard", () => {
  for (const f of [...ACTIONS, ...FORMS]) {
    const src = read(f);
    assert.equal(src.includes("dangerouslySetInnerHTML"), false, `${f}: dangerouslySetInnerHTML`);
  }
  // E-Mail-Versand bleibt provider-gated (kein hartes Aktivieren in den Actions).
  assert.equal(/new Resend\(|createTransport\(|twilio\(/.test(read("app/kontakt/actions.ts")), false, "Kontakt aktiviert Mail-/SMS-Dienst direkt");
});

// ─── 8. Register bleibt gesperrt (Regression aus P1) ──────────────────────────

test("Register Still Locked Guard: keine öffentliche Registrierung", () => {
  const actions = read("app/auth/actions.ts");
  assert.ok(/ENABLE_PUBLIC_SIGNUP/.test(actions) && /REGISTRATION_DISABLED/.test(actions), "P1-Sperre der Registrierung fehlt");
  assert.ok(/redirect\(\s*["']\/en\/kontakt["']\s*\)/.test(read("app/auth/register/page.tsx")), "Register-Seite leitet nicht um");
});
