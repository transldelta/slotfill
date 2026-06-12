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

// ─── Phase 16b: Erledigte Aufgaben, SEO-Defaults, Wording ────────────────────

test("CEO Launch (16b): Daily Tasks enthalten keine erledigte Google-SEO-Pflichtaufgabe mehr", () => {
  const route = read("app/api/admin/ceo-launch/route.ts");
  assert.ok(
    !route.includes("Domain bestätigen + Sitemap eintragen"),
    "Daily Tasks enthalten noch 'Domain bestätigen + Sitemap eintragen' – diese Aufgabe ist bereits erledigt",
  );
  assert.ok(
    !route.includes("https://search.google.com/search-console"),
    "Daily Tasks verlinken noch auf Google Search Console als Pflichtaufgabe",
  );
});

test("CEO Launch (16b): SEO-Checkliste hat Standardwerte für bekannte erledigte Punkte", () => {
  const page = read("app/admin/ceo-launch/page.tsx");
  assert.ok(
    page.includes("SEO_DEFAULTS"),
    "SEO_DEFAULTS fehlt in page.tsx – erledigte Punkte werden nicht vorausgefüllt",
  );
  assert.ok(
    page.includes("gsc_domain: true"),
    "Google Domain ist nicht als erledigt vormarkiert (gsc_domain: true fehlt)",
  );
  assert.ok(
    page.includes("gsc_sitemap: true"),
    "Google Sitemap ist nicht als erledigt vormarkiert (gsc_sitemap: true fehlt)",
  );
  assert.ok(
    page.includes("bing_webmaster: true"),
    "Bing Webmaster ist nicht als erledigt vormarkiert",
  );
});

test("CEO Launch (16b): Outreach-Wording verwendet 'freigeben' statt Pflicht-'senden'", () => {
  const route = read("app/api/admin/ceo-launch/route.ts");
  assert.ok(
    !route.includes("manuell an 1 passenden Kontakt senden"),
    "Outreach-Text enthält noch Pflicht-'senden'-Formulierung – ersetzen durch 'freigeben'",
  );
  assert.ok(
    route.includes("manuell freigeben"),
    "Outreach-Wording verwendet nicht 'manuell freigeben'",
  );
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

// ─── CEO Secretary Briefing ───────────────────────────────────────────────────

test("CEO Secretary: SecretaryBriefing-Typ ist in page.tsx definiert", () => {
  const page = read("app/admin/ceo-launch/page.tsx");
  assert.ok(
    page.includes("SecretaryBriefing"),
    "SecretaryBriefing-Typ fehlt in page.tsx",
  );
  assert.ok(
    page.includes("overall_signal"),
    "overall_signal fehlt im SecretaryBriefing-Typ",
  );
  assert.ok(
    page.includes("recommended_action"),
    "recommended_action fehlt im SecretaryBriefing-Typ",
  );
});

test("CEO Secretary: secretary_briefing ist in LaunchOverview (page.tsx) enthalten", () => {
  const page = read("app/admin/ceo-launch/page.tsx");
  assert.ok(
    page.includes("secretary_briefing"),
    "secretary_briefing fehlt in LaunchOverview (page.tsx)",
  );
});

test("CEO Secretary: API-Route hat buildSecretaryBriefing-Funktion", () => {
  const route = read("app/api/admin/ceo-launch/route.ts");
  assert.ok(
    route.includes("buildSecretaryBriefing"),
    "buildSecretaryBriefing fehlt in der API-Route",
  );
});

test("CEO Secretary: Ampel-Logik – alle drei Signale (green/yellow/red) definiert", () => {
  const route = read("app/api/admin/ceo-launch/route.ts");
  assert.ok(route.includes('"green"'), 'Ampel-Signal "green" fehlt');
  assert.ok(route.includes('"yellow"'), 'Ampel-Signal "yellow" fehlt');
  assert.ok(route.includes('"red"'), 'Ampel-Signal "red" fehlt');
});

test("CEO Secretary: Empfohlene-Aktion-Logik – alle drei Fälle abgedeckt", () => {
  const route = read("app/api/admin/ceo-launch/route.ts");
  assert.ok(
    route.includes("Nichts tun – weiter beobachten"),
    "Fall 'Nichts tun' fehlt",
  );
  assert.ok(
    route.includes("Antwort vorbereiten – Freigabe erforderlich"),
    "Fall 'Antwort vorbereiten' fehlt",
  );
  assert.ok(
    route.includes("Technik prüfen – keine externe Kommunikation"),
    "Fall 'Technik prüfen' fehlt",
  );
});

test("CEO Secretary: Stripe-Status gibt niemals Secret-Wert zurück (nur Klassifikation)", () => {
  const route = read("app/api/admin/ceo-launch/route.ts");
  // Stripe-Key wird nur über Präfix klassifiziert – Wert darf nicht in Response
  assert.ok(
    route.includes("stripe_status"),
    "stripe_status fehlt in buildSecretaryBriefing",
  );
  assert.ok(
    route.includes("sk_live_"),
    "Stripe-Key-Klassifikation via Präfix fehlt",
  );
  // Der Wert selbst darf nicht im Payload landen
  assert.ok(
    !route.includes("stripeKey:"),
    "stripeKey wird direkt in der Response gesendet",
  );
});

test("CEO Secretary: ENV-Status gibt niemals Werte zurück (nur Präsenz)", () => {
  const route = read("app/api/admin/ceo-launch/route.ts");
  assert.ok(
    route.includes("env_status"),
    "env_status fehlt in buildSecretaryBriefing",
  );
  assert.ok(
    route.includes("criticalEnvKeys"),
    "criticalEnvKeys-Prüfung fehlt",
  );
  // Werte dürfen nicht zurückgegeben werden
  assert.ok(
    !route.includes("process.env[k]:"),
    "ENV-Werte werden direkt in der Response gesendet",
  );
});

test("CEO Secretary: daily_brief_email_enabled ist immer false", () => {
  const route = read("app/api/admin/ceo-launch/route.ts");
  assert.ok(
    route.includes("daily_brief_email_enabled: false"),
    "daily_brief_email_enabled ist nicht auf false gesetzt",
  );
  // Kein tatsächlicher E-Mail-Versand – process.env darf nicht ausgewertet werden
  assert.ok(
    !route.includes("process.env.CEO_DAILY_BRIEF_EMAIL_ENABLED"),
    "CEO_DAILY_BRIEF_EMAIL_ENABLED wird per process.env ausgewertet – Feature noch nicht aktiviert",
  );
});

test("CEO Secretary: Kein Auto-Versand in buildSecretaryBriefing", () => {
  const route = read("app/api/admin/ceo-launch/route.ts");
  // Die Secretary-Funktion darf keine E-Mail/SMS/Webhook auslösen
  assert.ok(
    !route.includes("sendEmail("),
    "buildSecretaryBriefing ruft sendEmail() auf",
  );
  assert.ok(
    !route.includes("resend.emails"),
    "buildSecretaryBriefing nutzt Resend direkt",
  );
  assert.ok(
    !route.includes("twilio"),
    "buildSecretaryBriefing nutzt Twilio",
  );
});

test("CEO Secretary: SecretaryBriefingPanel-Komponente in page.tsx vorhanden", () => {
  const page = read("app/admin/ceo-launch/page.tsx");
  assert.ok(
    page.includes("SecretaryBriefingPanel"),
    "SecretaryBriefingPanel-Komponente fehlt in page.tsx",
  );
  assert.ok(
    page.includes("secretary-briefing"),
    "secretary-briefing id-Anker fehlt (benötigt für Navigation)",
  );
});

test("CEO Secretary: CEO-Secretary-Abteilung in buildDepartments vorhanden", () => {
  const route = read("app/api/admin/ceo-launch/route.ts");
  assert.ok(
    route.includes('"ceo_secretary"'),
    "CEO-Secretary-Abteilung fehlt in buildDepartments",
  );
  assert.ok(
    route.includes('"CEO Secretary"'),
    "CEO-Secretary-Name fehlt in buildDepartments",
  );
});

test("CEO Secretary: Stripe bleibt unangetastet (kein Checkout, kein Webhook)", () => {
  const route = read("app/api/admin/ceo-launch/route.ts");
  // Secretary-Briefing darf keine Stripe-Aktionen auslösen
  assert.ok(
    !route.includes("stripe.checkout"),
    "CEO-Launch-Route löst Stripe-Checkout aus",
  );
  assert.ok(
    !route.includes("stripe.subscriptions"),
    "CEO-Launch-Route manipuliert Stripe-Subscriptions",
  );
});
