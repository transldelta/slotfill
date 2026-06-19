#!/usr/bin/env node
/**
 * Final Verify – CEO Go/No-Go
 * Bündelt alle Kontrollen und gibt ein einfaches GO / NO-GO aus.
 *
 * Nutzung:
 *   node scripts/claude/final-verify.mjs          (Gates + lint + test)
 *   node scripts/claude/final-verify.mjs --full    (zusätzlich npm run build)
 *
 * 0 € Kosten, keine Netzwerkzugriffe, keine Secrets, keine externen Dienste.
 */
import { readFileSync } from "node:fs";
import { sh, C } from "./_lib.mjs";

const full = process.argv.includes("--full");
const node = process.execPath;
const D = "scripts/claude";
const results = [];

function step(label, cmd, { required = true } = {}) {
  const r = sh(cmd);
  const ok = r.ok;
  results.push({ label, ok, required, out: r.out });
  console.log(ok ? C.green(`  ✓ ${label}`) : (required ? C.red(`  ✗ ${label}`) : C.yellow(`  ⚠ ${label}`)));
}

function hasScript(name) {
  try {
    return !!JSON.parse(readFileSync("package.json", "utf8")).scripts?.[name];
  } catch {
    return false;
  }
}

console.log(C.bold("\n🏁 Slotfill · Final Verify (CEO Go/No-Go)\n"));

// 1) Pflicht-Gates
step("Project Identity Gate", `${node} ${D}/project-identity-gate.mjs`);
step("Security & Cost Scan", `${node} ${D}/security-cost-guard.mjs`);
step("No-Fake-Claims Guard", `${node} ${D}/no-fake-claims-guard.mjs`);

// 2) Qualität (sofern vorhanden)
if (hasScript("lint")) step("npm run lint", "npm run lint");
else results.push({ label: "lint (fehlt)", ok: true, required: false });

if (hasScript("test")) step("npm test", "npm test");
else console.log(C.yellow("  ⚠ kein 'test'-Script – Tests übersprungen"));

if (full && hasScript("build")) step("npm run build", "npm run build");
else if (full) console.log(C.yellow("  ⚠ kein 'build'-Script gefunden"));
else console.log(C.dim("  · build übersprungen (mit --full erzwingen)"));

// 3) Übersicht offene Änderungen
console.log("");
console.log(sh(`${node} ${D}/changed-files-report.mjs`).out);

// 4) Urteil
const failed = results.filter((r) => r.required && !r.ok);
console.log(C.bold("\n──────────── CEO-URTEIL ────────────"));
if (failed.length === 0) {
  console.log(C.green(C.bold("  ✅ GO – alle Pflichtkontrollen bestanden.")));
  console.log(C.dim("  Erlaubt: gezielt committen (kein 'git add .'), dann pushen.\n"));
  process.exit(0);
}
console.log(C.red(C.bold("  ⛔ NO-GO – bitte zuerst beheben:")));
failed.forEach((f) => console.log(C.red(`    • ${f.label}`)));
console.log("");
process.exit(1);
