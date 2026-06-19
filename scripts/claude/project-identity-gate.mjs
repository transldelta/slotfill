#!/usr/bin/env node
/**
 * Project Identity Gate
 * Stellt sicher, dass Claude Code wirklich im Slotfill-Repository arbeitet und
 * nicht versehentlich in einem anderen Projekt (z. B. SprachmittlerNetz) Dateien ändert.
 *
 * Nutzung:
 *   node scripts/claude/project-identity-gate.mjs            (CLI – Exit 1 bei Fehler)
 *   node scripts/claude/project-identity-gate.mjs --hook ... (SessionStart – blockiert nie)
 *
 * 0 € Kosten, keine Netzwerkzugriffe, keine Secrets.
 */
import { readFileSync } from "node:fs";
import { PROJECT_NAME, REPO_MATCH, sh, C } from "./_lib.mjs";

const isHook = process.argv.includes("--hook");

function check() {
  const problems = [];
  const info = [];

  const cwd = process.cwd();
  info.push(`Arbeitsverzeichnis: ${cwd}`);

  // package.json-Name
  let pkgName = "";
  try {
    pkgName = JSON.parse(readFileSync("package.json", "utf8")).name || "";
  } catch {
    problems.push("package.json nicht lesbar.");
  }
  info.push(`package.json name: ${pkgName || "—"}`);
  if (pkgName && pkgName !== PROJECT_NAME) {
    problems.push(`Projektname '${pkgName}' ≠ erwartet '${PROJECT_NAME}'.`);
  }

  // Git-Remote
  const remote = sh("git remote -v");
  const remoteOk = remote.ok && remote.out.includes(REPO_MATCH);
  info.push(`Git-Remote enthält '${REPO_MATCH}': ${remoteOk ? "ja" : "NEIN"}`);
  if (!remoteOk) problems.push(`Git-Remote passt nicht zu '${REPO_MATCH}'.`);

  // Branch + Commit (nur Info)
  const branch = sh("git branch --show-current");
  const commit = sh("git log --oneline -1");
  if (branch.ok) info.push(`Branch: ${branch.out}`);
  if (commit.ok) info.push(`Letzter Commit: ${commit.out}`);

  // Fremdprojekt-Marker (Schutz vor Verwechslung)
  if (/sprachmittlernetz/i.test(remote.out)) {
    problems.push("Remote deutet auf SprachmittlerNetz hin – FALSCHES PROJEKT.");
  }

  return { problems, info };
}

const { problems, info } = check();

console.log(C.bold("\n🛡  Slotfill · Project Identity Gate"));
info.forEach((l) => console.log("  " + C.dim(l)));

if (problems.length === 0) {
  console.log(C.green("  ✓ Identität bestätigt – richtiges Projekt.\n"));
  process.exit(0);
}

console.log(C.red("  ✗ Identitätsprüfung FEHLGESCHLAGEN:"));
problems.forEach((p) => console.log(C.red("    • " + p)));
if (isHook) {
  // Beim Session-Start nur warnen, nicht die Sitzung blockieren.
  console.log(C.yellow("  ⚠ STOPP empfohlen: Bitte Projekt prüfen, bevor Dateien geändert werden.\n"));
  process.exit(0);
}
process.exit(1);
