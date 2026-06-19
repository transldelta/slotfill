#!/usr/bin/env node
/**
 * auto-guard – zentraler Automatik-Runner für das Slotfill-Kontrollsystem.
 *
 * Modi:
 *   start       Projekt-Identität prüfen (Session-Start, blockiert nie)
 *   pre-bash    gefährliches Bash-Kommando blockieren  (PreToolUse-Hook, stdin=JSON)
 *   pre-write   Schreiben in Secret-/.env-Dateien blockieren (PreToolUse, stdin=JSON)
 *   post-edit   geänderte Datei still auf Secrets prüfen (PostToolUse, stdin=JSON)
 *   pre-commit  alle schnellen Gates – bricht Commit bei Rot ab
 *   pre-push    Final-Verify (Gates+Lint+Test) – bricht Push bei Rot ab
 *   stop|final  Final-Verify + CEO Go/No-Go
 *
 * Fail-Closed: bei echtem Risiko Exit ≠ 0. Kein Netzwerk, keine Secrets, keine .env-Lesung.
 */
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readStdin, C } from "./_lib.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const node = process.execPath;
const mode = (process.argv[2] || "").toLowerCase();

/** Führt ein Skript aus, gibt Exit-Code zurück (wirft nie). Optional stdin/inherit. */
function run(script, args = [], { input, inherit = true } = {}) {
  try {
    execFileSync(node, [join(DIR, script), ...args], {
      input,
      stdio: [input != null ? "pipe" : "ignore", inherit ? "inherit" : "pipe", "inherit"],
    });
    return 0;
  } catch (e) {
    return typeof e.status === "number" ? e.status : 1;
  }
}

/** Leitet einen Hook (stdin-JSON) an den passenden Guard weiter und übernimmt dessen Exit-Code. */
function forwardHook(script, args) {
  const input = readStdin();
  process.exit(run(script, args, { input }));
}

switch (mode) {
  case "start":
    // Session-Start: nur prüfen/anzeigen, niemals blockieren.
    run("project-identity-gate.mjs", ["--hook", "session"]);
    process.exit(0);

  case "pre-bash":
    forwardHook("security-cost-guard.mjs", ["--hook", "bash"]);
    break;

  case "pre-write":
    forwardHook("security-cost-guard.mjs", ["--hook", "write"]);
    break;

  case "post-edit":
    forwardHook("security-cost-guard.mjs", ["--hook", "posttooluse"]);
    break;

  case "pre-commit": {
    console.log(C.bold("\n🔒 auto-guard · pre-commit (Fail-Closed)"));
    const id = run("project-identity-gate.mjs");
    const sec = run("security-cost-guard.mjs");
    const fake = run("no-fake-claims-guard.mjs");
    run("changed-files-report.mjs");
    const bad = id || sec || fake;
    if (bad) {
      console.log(C.red("⛔ Commit blockiert – bitte Gate-Fehler oben beheben.\n"));
      process.exit(1);
    }
    console.log(C.green("✓ Gates grün – Commit erlaubt.\n"));
    process.exit(0);
  }

  case "pre-push":
  case "final":
  case "stop": {
    const code = run("final-verify.mjs");
    if (code && mode === "pre-push") console.log(C.red("⛔ Push blockiert – Final-Verify rot.\n"));
    process.exit(code);
  }

  default:
    console.log("auto-guard Modi: start | pre-bash | pre-write | post-edit | pre-commit | pre-push | stop | final");
    process.exit(0);
}
