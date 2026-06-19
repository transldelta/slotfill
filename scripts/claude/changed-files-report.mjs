#!/usr/bin/env node
/**
 * Changed-Files Report
 * Listet geänderte Dateien mit einer einfachen Risiko-Einschätzung – damit der
 * Inhaber auf einen Blick sieht, was angefasst wurde und ob es heikel ist.
 *
 * Nutzung:  node scripts/claude/changed-files-report.mjs
 * 0 € Kosten, keine Secrets, nur lokale Git-Infos.
 */
import { sh, C } from "./_lib.mjs";

function risk(file) {
  if (/(^|\/)\.env|secret|credential|\.pem$|\.key$/i.test(file)) return ["HOCH", "Secret-/Env-Datei – normalerweise NICHT ändern/committen"];
  if (/\.(png|jpe?g|webp|gif|mp4|mov)$/i.test(file)) return ["MITTEL", "Medien-/Screenshot-Datei – nur gezielt & lizenzsicher committen"];
  if (/package(-lock)?\.json$/.test(file)) return ["MITTEL", "Abhängigkeiten/Scripts – prüfen, ob nötig"];
  if (/middleware\.ts$|next\.config|tailwind\.config|tsconfig/.test(file)) return ["MITTEL", "Build-/Routing-Konfiguration – sorgfältig prüfen"];
  if (/^app\/api\//.test(file)) return ["MITTEL", "API-Route – Security/Datenfluss prüfen"];
  if (/^(app|components|lib|messages|scripts|docs)\//.test(file)) return ["NIEDRIG", "App-/Inhalts-/Doku-Datei"];
  return ["NIEDRIG", "sonstige Datei"];
}

const status = sh("git status --short");
const stat = sh("git diff --stat");

console.log(C.bold("\n📋 Slotfill · Changed-Files Report"));

if (!status.out) {
  console.log(C.green("  ✓ Working Tree sauber – keine offenen Änderungen.\n"));
  process.exit(0);
}

const lines = status.out.split("\n").filter(Boolean);
console.log(C.dim(`  ${lines.length} geänderte/neue Datei(en):\n`));
for (const l of lines) {
  const m = l.match(/^\s*(\S+)\s+(.+?)\s*$/);
  if (!m) continue;
  const flag = m[1];
  const file = m[2].replace(/^"(.*)"$/, "$1");
  const [level, note] = risk(file);
  const color = level === "HOCH" ? C.red : level === "MITTEL" ? C.yellow : C.green;
  console.log(`  ${color(`[${level}]`)} ${flag.padEnd(2)} ${file}`);
  console.log("        " + C.dim(note));
}
console.log("\n" + C.dim(stat.out) + "\n");
console.log(C.dim("  Hinweis: Nur gezielt adden (kein 'git add .'). Keine Secrets, keine Screenshots, keine .env.\n"));
process.exit(0);
