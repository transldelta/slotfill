/**
 * CEO Launch Operations Tests – Phase 16
 *
 * Prüft ohne echte DB/Netzwerkverbindung:
 * - Admin-Seite ist geschützt (liegt hinter AdminShell-Layout)
 * - Neue API-Routen existieren
 * - Kein automatischer Versand in der Seite
 * - Copy-Texte (Outreach) sind im API-Route vorhanden
 * - Dashboard zeigt keine Secrets
 * - Nav-Eintrag vorhanden
 * - QA-Route prüft korrekte URLs (enthält clinicslothub.com)
 * - Daily Tasks: max. 3 (Funktion im Quellcode begrenzt auf 3)
 * - Dokumentation existiert
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(process.cwd());
const read = (p: string) => readFileSync(resolve(ROOT, p), "utf-8");

// ─── Datei-Existenz ───────────────────────────────────────────────────────────

test("CEO Launch: Admin-Seite app/admin/ceo-launch/page.tsx existiert", () => {
  assert.ok(
    existsSync(resolve(ROOT, "app/admin/ceo-launch/page.tsx")),
    "Admin-Seite fehlt",
  );
});

test("CEO Launch: API-Route GET /api/admin/ceo-launch/route.ts existiert", () => {
  assert.ok(
    existsSync(resolve(ROOT, "app/api/admin/ceo-launch/route.ts")),
    "GET-Route fehlt",
  );
});

test("CEO Launch: QA-Check API /api/admin/ceo-launch/qa-check/route.ts existiert", () => {
  assert.ok(
    existsSync(resolve(ROOT, "app/api/admin/ceo-launch/qa-check/route.ts")),
    "QA-Check-Route fehlt",
  );
});

test("CEO Launch: Dokumentation CEO_DELEGATED_LAUNCH_OPERATIONS.md existiert", () => {
  assert.ok(
    existsSync(resolve(ROOT, "docs/CEO_DELEGATED_LAUNCH_OPERATIONS.md")),
    "Dokumentation fehlt",
  );
});

// ─── Admin-Schutz ─────────────────────────────────────────────────────────────

test("CEO Launch: Admin-Layout nutzt requireAdmin (Zugriffsschutz)", () => {
  const layout = read("app/admin/layout.tsx");
  assert.ok(
    layout.includes("requireAdmin"),
    "Admin-Layout hat keine requireAdmin-Prüfung",
  );
});

test("CEO Launch: GET-Route nutzt getAdminContext (kein öffentlicher Zugang)", () => {
  const route = read("app/api/admin/ceo-launch/route.ts");
  assert.ok(
    route.includes("getAdminContext"),
    "CEO-Launch-API hat keine Admin-Prüfung",
  );
  assert.ok(
    route.includes("UNAUTHORIZED"),
    "CEO-Launch-API sendet keine UNAUTHORIZED-Antwort",
  );
});

test("CEO Launch: QA-Check-Route nutzt getAdminContext", () => {
  const qa = read("app/api/admin/ceo-launch/qa-check/route.ts");
  assert.ok(
    qa.includes("getAdminContext"),
    "QA-Check-Route hat keine Admin-Prüfung",
  );
});

// ─── Kein Auto-Versand ────────────────────────────────────────────────────────

test("CEO Launch: Seite enthält keinen automatischen Versand (kein sendEmail, kein fetch POST an Mail-Endpunkt)", () => {
  const page = read("app/admin/ceo-launch/page.tsx");
  assert.ok(
    !page.includes("sendEmail("),
    "CEO-Launch-Seite ruft sendEmail() auf – kein Auto-Versand erlaubt",
  );
  assert.ok(
    !page.includes("sendBookingEmail"),
    "CEO-Launch-Seite ruft sendBookingEmail auf",
  );
  assert.ok(
    !page.includes("sendContactAdminNotification"),
    "CEO-Launch-Seite ruft sendContactAdminNotification auf",
  );
});

test("CEO Launch: GET-Route sendet keine E-Mails", () => {
  const route = read("app/api/admin/ceo-launch/route.ts");
  assert.ok(
    !route.includes("sendEmail("),
    "CEO-Launch-GET-Route sendet E-Mails – nicht erlaubt",
  );
  assert.ok(
    !route.includes("resend"),
    "CEO-Launch-GET-Route nutzt Resend – nicht erlaubt",
  );
});

test("CEO Launch: QA-Check sendet keine E-Mails oder Nachrichten", () => {
  const qa = read("app/api/admin/ceo-launch/qa-check/route.ts");
  assert.ok(
    !qa.includes("sendEmail("),
    "QA-Check sendet E-Mails",
  );
  assert.ok(
    !qa.includes("twilio"),
    "QA-Check sendet Nachrichten via Twilio",
  );
});

// ─── Korrekte Inhalte ─────────────────────────────────────────────────────────

test("CEO Launch: Outreach-Texte sind in GET-Route vorhanden (DE + EN)", () => {
  const route = read("app/api/admin/ceo-launch/route.ts");
  assert.ok(
    route.includes("outreach_texts"),
    "outreach_texts fehlen in GET-Route",
  );
  assert.ok(
    route.includes('"de"'),
    "Keine deutschen Outreach-Texte",
  );
  assert.ok(
    route.includes('"en"'),
    "Keine englischen Outreach-Texte",
  );
  // Mindestens 10 Texte (5 DE + 5 EN + E-Mails)
  const matches = route.match(/id: "de_|id: "en_/g) ?? [];
  assert.ok(
    matches.length >= 10,
    `Zu wenige Outreach-Texte: ${matches.length} (erwartet ≥ 10)`,
  );
});

test("CEO Launch: Seite zeigt keine API-Keys oder Passwörter", () => {
  const page = read("app/admin/ceo-launch/page.tsx");
  assert.ok(
    !page.includes("SUPABASE_SERVICE_ROLE_KEY"),
    "Seite enthält SERVICE_ROLE_KEY",
  );
  assert.ok(
    !page.includes("RESEND_API_KEY"),
    "Seite enthält RESEND_API_KEY",
  );
  assert.ok(
    !page.includes("process.env."),
    "Seite greift direkt auf process.env zu – client-seitig nicht erlaubt",
  );
});

test("CEO Launch: GET-Route gibt keine Secrets zurück (kein auth_uid, kein service_role)", () => {
  const route = read("app/api/admin/ceo-launch/route.ts");
  // Die Route darf keinen auth_uid-Wert in der Antwort zurückgeben
  // (lead-Daten enthalten id, name, email, status – nicht auth_uid)
  assert.ok(
    !route.includes('"auth_uid"'),
    "Route gibt auth_uid in Response zurück",
  );
});

test("CEO Launch: Daily Tasks sind auf max. 3 begrenzt (slice(0, 3))", () => {
  const route = read("app/api/admin/ceo-launch/route.ts");
  assert.ok(
    route.includes("slice(0, 3)"),
    "Daily Tasks sind nicht auf 3 begrenzt",
  );
});

// ─── QA-Check prüft richtige Domain ──────────────────────────────────────────

test("CEO Launch: QA-Check prüft clinicslothub.com (CANONICAL_URL)", () => {
  const qa = read("app/api/admin/ceo-launch/qa-check/route.ts");
  assert.ok(
    qa.includes("CANONICAL_URL"),
    "QA-Check nutzt nicht CANONICAL_URL",
  );
  assert.ok(
    qa.includes("/de/launch"),
    "QA-Check prüft nicht /de/launch",
  );
  assert.ok(
    qa.includes("/en/launch"),
    "QA-Check prüft nicht /en/launch",
  );
  assert.ok(
    qa.includes("dashboard"),
    "QA-Check prüft nicht /dashboard (muss geschützt sein)",
  );
});

// ─── Nav-Eintrag ──────────────────────────────────────────────────────────────

test("CEO Launch: Nav-Eintrag in admin-shell.tsx vorhanden", () => {
  const shell = read("components/admin-shell.tsx");
  assert.ok(
    shell.includes("/admin/ceo-launch"),
    "CEO-Launch-Seite fehlt im Admin-Nav",
  );
  assert.ok(
    shell.includes("CEO Launch"),
    "CEO-Launch-Label fehlt im Admin-Nav",
  );
});

// ─── Dokumentation ────────────────────────────────────────────────────────────

test("CEO Launch: Dokumentation enthält Maximal-3-Regel", () => {
  const doc = read("docs/CEO_DELEGATED_LAUNCH_OPERATIONS.md");
  assert.ok(
    doc.includes("3 Aufgaben") || doc.includes("max. 3"),
    "Dokumentation beschreibt die Maximal-3-Aufgaben-Regel nicht",
  );
  assert.ok(
    doc.includes("NIEMALS automatisch"),
    "Dokumentation listet nicht auf, was niemals automatisch passiert",
  );
});

test("CEO Launch: Dokumentation beschreibt Abteilungen", () => {
  const doc = read("docs/CEO_DELEGATED_LAUNCH_OPERATIONS.md");
  for (const dept of [
    "Product QA",
    "SEO",
    "Outreach",
    "Lead Handling",
    "Compliance",
  ]) {
    assert.ok(doc.includes(dept), `Dokumentation fehlt Abteilung: ${dept}`);
  }
});

// ─── Compliance-Text ──────────────────────────────────────────────────────────

test("CEO Launch: Seite enthält Compliance-Hinweis (kein Auto-Versand)", () => {
  const page = read("app/admin/ceo-launch/page.tsx");
  assert.ok(
    page.includes("Kein Auto-Versand") || page.includes("kein Auto-Versand"),
    "Seite enthält keinen Hinweis auf fehlenden Auto-Versand",
  );
  assert.ok(
    page.includes("Betreiber-Freigabe"),
    "Seite enthält keinen Betreiber-Freigabe-Hinweis",
  );
});
