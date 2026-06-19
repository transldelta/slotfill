/**
 * Gemeinsame Helfer für die Claude-Code-Kontroll-Skripte.
 * Nur Node-Builtins – keine externen Pakete, keine Netzwerkzugriffe, 0 € Kosten.
 */
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

export const PROJECT_NAME = "slotfill";
export const REPO_MATCH = "transldelta/slotfill";
export const PUBLIC_BRAND = "Slotfill";

/** Liest stdin synchron (für Hook-Eingaben). Leerer String, wenn kein stdin. */
export function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

/** Parst Hook-JSON von stdin defensiv. */
export function readHookInput() {
  const raw = readStdin();
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

/** Führt ein Shell-Kommando aus und gibt {ok, out} zurück – wirft nie. */
export function sh(cmd) {
  try {
    return { ok: true, out: execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim() };
  } catch (e) {
    return { ok: false, out: (e.stdout || "") + (e.stderr || "") };
  }
}

export const C = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
};

/**
 * Blockiert eine Tool-Aktion in einem PreToolUse-Hook:
 * Exit-Code 2 + Begründung auf stderr → Claude Code verweigert die Aktion.
 */
export function blockTool(reason) {
  process.stderr.write(`\n⛔ SLOTFILL-GUARD blockiert diese Aktion:\n${reason}\n`);
  process.exit(2);
}

/** Erlaubt die Aktion (Hook endet sauber). */
export function allowTool() {
  process.exit(0);
}
