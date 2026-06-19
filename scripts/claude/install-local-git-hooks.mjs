#!/usr/bin/env node
/**
 * Installiert lokale Git-Hooks, die das Kontrollsystem automatisch auslösen:
 *   .git/hooks/pre-commit  → node scripts/claude/auto-guard.mjs pre-commit  (Fail-Closed)
 *   .git/hooks/pre-push    → node scripts/claude/auto-guard.mjs pre-push    (Fail-Closed)
 *
 * Die Hooks selbst werden NICHT committet (liegen in .git/). Nur dieses
 * Installationsskript wird versioniert. Erneut ausführbar (idempotent).
 *
 * Nutzung:  npm run claude:install-hooks
 * Kein Netzwerk, keine Secrets.
 */
import { writeFileSync, chmodSync, mkdirSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

function gitDir() {
  try {
    return execSync("git rev-parse --git-dir", { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

const gd = gitDir();
if (!gd) {
  console.error("✗ Kein Git-Repository gefunden – Hooks nicht installiert.");
  process.exit(1);
}

const hooksDir = join(gd, "hooks");
mkdirSync(hooksDir, { recursive: true });

const HOOK = (mode) => `#!/bin/sh
# Slotfill auto-guard ${mode} hook – installiert von scripts/claude/install-local-git-hooks.mjs
# Nicht manuell bearbeiten. Bei Bedarf: npm run claude:install-hooks
ROOT="$(git rev-parse --show-toplevel)"
if [ -f "$ROOT/scripts/claude/auto-guard.mjs" ]; then
  node "$ROOT/scripts/claude/auto-guard.mjs" ${mode} || exit 1
fi
exit 0
`;

for (const mode of ["pre-commit", "pre-push"]) {
  const p = join(hooksDir, mode);
  writeFileSync(p, HOOK(mode), { mode: 0o755 });
  chmodSync(p, 0o755);
  console.log(`✓ installiert: ${p}`);
}

console.log("\nLokale Git-Hooks sind auf diesem Rechner aktiv:");
console.log("  • pre-commit → auto-guard pre-commit (Gates, Fail-Closed)");
console.log("  • pre-push   → auto-guard pre-push (Final-Verify, Fail-Closed)");
console.log(`(Hinweis: existsSync-Check ${existsSync(join(hooksDir, "pre-commit")) ? "ok" : "fehlgeschlagen"})`);
