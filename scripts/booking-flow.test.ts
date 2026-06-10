/**
 * Booking Flow Tests – Phase 14 SaaS Core Flow
 *
 * Prüft den öffentlichen Buchungsfluss ohne echte DB-Verbindung:
 * - Slug-Generierung aus Praxisnamen
 * - Öffentliche Buchungsseite existiert
 * - Dashboard-API für Buchungslink existiert
 * - Praxis-API-Route existiert
 * - Middleware erlaubt /book ohne i18n-Redirect
 * - Tenant-Isolation: booking_requests hat tenant_id
 * - Patient-/Praxis-Trennung: keine öffentlichen Seiten-Pfade im Dashboard
 * - actions.ts akzeptiert tenant_id
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { generateSlugBase } from "../lib/onboarding";

const ROOT = resolve(process.cwd());

// ─── Slug-Generierung ─────────────────────────────────────────────────────────

test("Slug: Leerzeichen werden zu Bindestrichen", () => {
  assert.equal(generateSlugBase("Zahnarzt Mueller"), "zahnarzt-mueller");
});

test("Slug: Umlaute werden korrekt umgewandelt (dt. Standard: ä→ae, ö→oe, ü→ue, ß→ss)", () => {
  // Deutsches Standard-Umlaut-Mapping
  assert.equal(generateSlugBase("Ärztehaus"), "aerztehaus");
  assert.equal(generateSlugBase("Praxis Über"), "praxis-ueber");
  assert.equal(generateSlugBase("Fußpflege"), "fusspflege");
  assert.equal(generateSlugBase("Zahnarzt Müller"), "zahnarzt-mueller");
});

test("Slug: Sonderzeichen werden entfernt", () => {
  const s = generateSlugBase("Dr. Meier & Partner GmbH");
  assert.ok(!s.includes("."), `Slug enthält Punkt: ${s}`);
  assert.ok(!s.includes("&"), `Slug enthält &: ${s}`);
  assert.ok(!s.includes(" "), `Slug enthält Leerzeichen: ${s}`);
});

test("Slug: Ergebnis ist kleingeschrieben", () => {
  const s = generateSlugBase("GROSSBUCHSTABEN Praxis");
  assert.equal(s, s.toLowerCase());
});

test("Slug: Max-Länge 80 Zeichen", () => {
  const long = "A".repeat(200);
  const s = generateSlugBase(long);
  assert.ok(s.length <= 80, `Slug zu lang: ${s.length}`);
});

test("Slug: Leerer Name ergibt 'praxis'", () => {
  assert.equal(generateSlugBase(""), "praxis");
  assert.equal(generateSlugBase("   "), "praxis");
});

test("Slug: Testpraxis Delta ergibt testpraxis-delta", () => {
  assert.equal(generateSlugBase("Testpraxis Delta"), "testpraxis-delta");
});

// ─── Datei-Existenz: neue Routen ─────────────────────────────────────────────

test("Booking-Flow: öffentliche Buchungsseite /book/[slug]/page.tsx existiert", () => {
  const p = resolve(ROOT, "app/book/[slug]/page.tsx");
  assert.ok(existsSync(p), `Datei fehlt: ${p}`);
});

test("Booking-Flow: API /api/practices/[slug]/route.ts existiert", () => {
  const p = resolve(ROOT, "app/api/practices/[slug]/route.ts");
  assert.ok(existsSync(p), `Datei fehlt: ${p}`);
});

test("Booking-Flow: Dashboard API /api/dashboard/booking-link/route.ts existiert", () => {
  const p = resolve(ROOT, "app/api/dashboard/booking-link/route.ts");
  assert.ok(existsSync(p), `Datei fehlt: ${p}`);
});

test("Booking-Flow: Migration 026_practice_slug.sql existiert", () => {
  const p = resolve(ROOT, "supabase/migrations/026_practice_slug.sql");
  assert.ok(existsSync(p), `Migration fehlt: ${p}`);
});

// ─── Middleware: /book ist in PASSTHROUGH ────────────────────────────────────

test("Middleware: /book ist in PASSTHROUGH-Liste (kein i18n-Redirect)", () => {
  const mw = require("fs").readFileSync(resolve(ROOT, "middleware.ts"), "utf-8");
  assert.ok(
    mw.includes('"/book"') || mw.includes("'/book'"),
    "'/book' fehlt in PASSTHROUGH-Liste der middleware.ts",
  );
});

// ─── Tenant-Isolation: booking_requests ──────────────────────────────────────

test("Tenant-Isolation: Migration 018 enthält tenant_id in booking_requests", () => {
  const sql = require("fs").readFileSync(
    resolve(ROOT, "supabase/migrations/018_booking_requests.sql"),
    "utf-8",
  );
  assert.ok(sql.includes("tenant_id"), "tenant_id fehlt in booking_requests");
  assert.ok(
    sql.includes("practices"),
    "Keine practices-FK in booking_requests",
  );
});

test("Tenant-Isolation: RLS-Policy prüft auth_uid via practices", () => {
  const sql = require("fs").readFileSync(
    resolve(ROOT, "supabase/migrations/018_booking_requests.sql"),
    "utf-8",
  );
  assert.ok(
    sql.includes("auth_uid = auth.uid()"),
    "RLS prüft nicht auth_uid = auth.uid()",
  );
  assert.ok(
    sql.includes("tenant_id IN"),
    "RLS filtert nicht nach tenant_id",
  );
});

test("Tenant-Isolation: Anon-INSERT-Policy erfordert privacy_accepted = true", () => {
  const sql = require("fs").readFileSync(
    resolve(ROOT, "supabase/migrations/018_booking_requests.sql"),
    "utf-8",
  );
  assert.ok(
    sql.includes("privacy_accepted = true"),
    "Anon-INSERT erfordert nicht privacy_accepted",
  );
  assert.ok(
    sql.includes("auto_confirmed = false"),
    "Anon-INSERT erlaubt auto_confirmed = true",
  );
});

// ─── Actions: tenant_id wird akzeptiert ──────────────────────────────────────

test("Actions: submitBookingRequest akzeptiert tenant_id als optionalen UUID-Parameter", () => {
  const src = require("fs").readFileSync(
    resolve(ROOT, "app/termin-buchen/actions.ts"),
    "utf-8",
  );
  assert.ok(src.includes("tenant_id"), "tenant_id fehlt in actions.ts");
  assert.ok(src.includes("z.string().uuid()"), "tenant_id wird nicht als UUID validiert");
});

// ─── Patient-Zugriffskontrolle ────────────────────────────────────────────────

test("Sicherheit: /book/[slug]-Seite enthält kein Dashboard-Link", () => {
  const src = require("fs").readFileSync(
    resolve(ROOT, "app/book/[slug]/page.tsx"),
    "utf-8",
  );
  assert.ok(
    !src.includes('href="/dashboard'),
    "/book/[slug] enthält Dashboard-Link – Patienten sollten kein Dashboard sehen",
  );
  assert.ok(
    !src.includes("/admin"),
    "/book/[slug] enthält Admin-Link",
  );
});

test("Sicherheit: /book/[slug]-Seite enthält kein Login-Formular", () => {
  const src = require("fs").readFileSync(
    resolve(ROOT, "app/book/[slug]/page.tsx"),
    "utf-8",
  );
  assert.ok(
    !src.includes("auth/login"),
    "/book/[slug] verweist auf Login – Patienten brauchen kein Login",
  );
});

test("Sicherheit: /api/practices/[slug] select-Statement enthält nur (id, name, slug)", () => {
  const src = require("fs").readFileSync(
    resolve(ROOT, "app/api/practices/[slug]/route.ts"),
    "utf-8",
  );
  // Der .select()-Aufruf darf NUR id, name, slug enthalten
  assert.ok(
    src.includes('"id, name, slug"'),
    "API wählt mehr als (id, name, slug) aus – sensible Felder könnten exponiert sein",
  );
  // Response-Objekt gibt nur id, name, slug zurück
  assert.ok(
    src.includes("id: data.id"),
    "API Response mappt id nicht explizit",
  );
  assert.ok(
    src.includes("name: data.name"),
    "API Response mappt name nicht explizit",
  );
  assert.ok(
    src.includes("slug: data.slug"),
    "API Response mappt slug nicht explizit",
  );
});

// ─── Dashboard-Link-Widget ────────────────────────────────────────────────────

test("Dashboard: Buchungslink-Widget ist in dashboard/page.tsx vorhanden", () => {
  const src = require("fs").readFileSync(
    resolve(ROOT, "app/dashboard/page.tsx"),
    "utf-8",
  );
  assert.ok(
    src.includes("booking-link"),
    "Dashboard lädt keinen Buchungslink (/api/dashboard/booking-link)",
  );
  assert.ok(
    src.includes("Buchungslink"),
    "Dashboard zeigt kein 'Buchungslink'-Widget",
  );
  assert.ok(
    src.includes("copyBookingLink"),
    "Dashboard hat keine Kopier-Funktion für den Buchungslink",
  );
});

// ─── Onboarding: Slug wird generiert ─────────────────────────────────────────

test("Onboarding: generateSlugBase ist aus lib/onboarding exportiert", () => {
  // Prüft Export über Import-Mechanismus (kein require nötig da bereits importiert)
  assert.equal(typeof generateSlugBase, "function");
});

test("Onboarding: Slug wird beim INSERT in practices gesetzt", () => {
  const src = require("fs").readFileSync(
    resolve(ROOT, "lib/onboarding.ts"),
    "utf-8",
  );
  assert.ok(src.includes("resolveUniqueSlug"), "resolveUniqueSlug fehlt in onboarding.ts");
  assert.ok(src.includes("slug"), "slug wird nicht in practices INSERT gesetzt");
});
