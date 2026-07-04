/**
 * ClinicSlotHub Public Access Security Guards (P1 Freeze).
 *
 * Sichern: keine öffentliche Selfservice-Registrierung, kein offener Admin-/
 * Dashboard-Zugriff, kein Trial-/„Kostenlos registrieren"-CTA, keine alte
 * gefährliche Kampagnen-Copy live, Auth-Bereich noindex.
 *
 * Lauf: tsx --test scripts/security-access.test.ts
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

// ─── 1. Public Register Blocked Guard ─────────────────────────────────────────

test("Public Register Blocked Guard: signUp deaktiviert + Register-Seite leitet um", () => {
  const actions = read("app/auth/actions.ts");
  // Kill-Switch im Server Action selbst (wirkt auch bei direktem POST).
  assert.ok(/ENABLE_PUBLIC_SIGNUP/.test(actions), "signUp ohne ENABLE_PUBLIC_SIGNUP-Sperre");
  assert.ok(/REGISTRATION_DISABLED/.test(actions), "signUp ohne REGISTRATION_DISABLED-Rückgabe");
  assert.ok(/process\.env\.ENABLE_PUBLIC_SIGNUP\s*!==\s*"true"/.test(actions), "Kill-Switch nicht fail-closed");
  // Register-Seite hat kein Formular mehr, sondern leitet zur Kontaktseite (EN = Default-Locale).
  const reg = read("app/auth/register/page.tsx");
  assert.ok(/redirect\(\s*["']\/en\/kontakt["']\s*\)/.test(reg), "Register-Seite leitet nicht zu /en/kontakt um");
  assert.equal(/signUp|<form|"use client"/.test(reg), false, "Register-Seite enthält noch ein Konto-Formular");
});

// ─── 2. No Public Selfservice / Trial Guard ───────────────────────────────────

test("No Public Selfservice Trial Guard: kein 'Kostenlos registrieren'/Trial-CTA", () => {
  const login = read("app/auth/login/page.tsx");
  assert.equal(login.includes("/auth/register"), false, "Login verlinkt noch auf /auth/register");
  assert.equal(/kostenlos registrieren/i.test(login), false, "Login zeigt 'Kostenlos registrieren'");
  for (const f of ["app/auth/login/page.tsx", "app/auth/register/page.tsx"]) {
    const low = read(f).toLowerCase();
    for (const bad of ["14 tage kostenlos", "14-day", "free trial", "kostenlos testen"]) {
      assert.equal(low.includes(bad), false, `${f}: Trial-Claim "${bad}"`);
    }
  }
});

// ─── 3. Protected Dashboard / Admin Guard ─────────────────────────────────────

test("Protected Dashboard Guard: /admin + /dashboard erfordern Auth (fail-closed)", () => {
  const mw = read("middleware.ts");
  assert.ok(/AUTH_PROTECTED\s*=\s*\[[^\]]*"\/admin"[^\]]*"\/dashboard"/.test(mw.replace(/\s+/g, " ")), "AUTH_PROTECTED ohne /admin+/dashboard");
  assert.ok(/auth\.getUser\(\)/.test(mw), "Middleware prüft keinen Supabase-User");
  assert.ok(/if\s*\(!user\)/.test(mw) && /\/auth\/login/.test(mw), "Middleware leitet nicht-eingeloggte nicht auf /auth/login");
});

// ─── 4. No Dangerous Old Copy Guard ───────────────────────────────────────────

test("No Dangerous Old Copy Guard: alte Kampagnenseiten sind sichere Redirects", () => {
  for (const f of ["app/[locale]/launch/page.tsx", "app/[locale]/public-launch/page.tsx", "app/[locale]/share/page.tsx"]) {
    const src = read(f);
    assert.ok(/redirect\(\s*["']\/de\/kontakt["']\s*\)/.test(src), `${f}: ist kein sicherer Redirect`);
    const low = src.toLowerCase();
    for (const bad of ["weltweit", "worldwide", "twilio", "resend", "14 tage", "14 days", "10 sprachen", "10 languages", "/auth/register"]) {
      assert.equal(low.includes(bad), false, `${f}: gefährliche Alt-Copy "${bad}"`);
    }
  }
});

// ─── 5. Auth Section Noindex Guard ────────────────────────────────────────────

test("Auth Noindex Guard: /auth/* trägt noindex,nofollow", () => {
  assert.ok(existsSync(join(ROOT, "app/auth/layout.tsx")), "app/auth/layout.tsx fehlt");
  assert.ok(/index:\s*false/.test(read("app/auth/layout.tsx")), "Auth-Layout ohne noindex");
  assert.ok(/index:\s*false/.test(read("app/auth/register/page.tsx")), "Register ohne noindex");
});

// ─── 6. No Hardcoded Demo Credentials Guard ───────────────────────────────────

test("No Hardcoded Credentials Guard: keine fixen Demo-Passwörter/Tokens im Code", () => {
  for (const f of ["app/auth/actions.ts", "app/auth/login/page.tsx", "middleware.ts"]) {
    const src = read(f);
    assert.equal(/password\s*[:=]\s*["'][^"']{4,}["']/i.test(src), false, `${f}: hartkodiertes Passwort`);
    assert.equal(/(token|secret|api[_-]?key)\s*[:=]\s*["'][A-Za-z0-9_\-]{16,}["']/i.test(src), false, `${f}: hartkodierter Token/Secret`);
  }
});
