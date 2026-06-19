#!/usr/bin/env node
/**
 * No-Fake-Claims Guard
 * Durchsucht die öffentlichen Texte (messages/*.json + öffentliche Seiten) nach
 * verbotenen Aussagen: Fake-Kunden/-Zahlen/-Bewertungen/-Standorte, falsche
 * Garantien sowie medizinische/rechtliche/finanzielle Versprechen.
 *
 * Nutzung:  node scripts/claude/no-fake-claims-guard.mjs   (Exit 1 bei Fund)
 * 0 € Kosten, keine Netzwerkzugriffe, keine Secrets.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { C } from "./_lib.mjs";

// Verbotene Phrasen (klein geschrieben geprüft). Bewusst eng, um Fehlalarme zu vermeiden.
const BANNED = [
  // Falsche Garantien / Sofortversprechen
  "guaranteed appointment",
  "garantierter termin",
  "soforttermin garantiert",
  "24h garantie",
  "48h garantie",
  "24-stunden-garantie",
  // Falsche Compliance-Behauptungen
  "gdpr-ready",
  "hipaa-ready",
  "fully compliant",
  "guaranteed compliance",
  "rechtssicher garantiert",
  "medically certified",
  "medizinisch zertifiziert",
  // Medizinische Versprechen
  "medical advice",
  "treatment recommendation",
  "diagnosis guaranteed",
  // Fake-Belege
  "trusted by thousands",
  "join thousands of clinics",
  "rated 5 stars",
  "5-sterne bewertung",
  "tausende kliniken",
  "#1 clinic booking",
  "marktführer",
];

// Verdächtige Muster (erfundene Zahlen/Bewertungen in öffentlicher Copy).
const SUSPECT_PATTERNS = [
  { re: /\b\d{2,}\s*\+?\s*(zufriedene|happy)\s+(kunden|customers|clinics|kliniken|praxen)\b/i, name: "erfundene Kundenzahl" },
  { re: /\b\d+(\.\d+)?\s*\/\s*5\s*(sterne|stars)\b/i, name: "erfundene Sterne-Bewertung" },
  { re: /\b\d{3,}\s*(reviews|bewertungen)\b/i, name: "erfundene Review-Anzahl" },
];

function collectPublicTexts() {
  const out = [];
  // messages/*.json
  if (existsSync("messages")) {
    for (const f of readdirSync("messages").filter((x) => x.endsWith(".json"))) {
      try {
        out.push({ file: `messages/${f}`, text: readFileSync(`messages/${f}`, "utf8") });
      } catch {}
    }
  }
  // zentrale öffentliche Seite
  const page = "app/[locale]/page.tsx";
  if (existsSync(page)) out.push({ file: page, text: readFileSync(page, "utf8") });
  return out;
}

const sources = collectPublicTexts();
const findings = [];

for (const s of sources) {
  const low = s.text.toLowerCase();
  for (const b of BANNED) if (low.includes(b)) findings.push({ file: s.file, hit: `verbotene Phrase: "${b}"` });
  for (const p of SUSPECT_PATTERNS) if (p.re.test(s.text)) findings.push({ file: s.file, hit: p.name });
}

console.log(C.bold("\n🧾 Slotfill · No-Fake-Claims Guard"));
console.log(C.dim(`  geprüfte öffentliche Quellen: ${sources.length}`));

if (findings.length === 0) {
  console.log(C.green("  ✓ Keine Fake-Claims / verbotenen Versprechen gefunden.\n"));
  process.exit(0);
}
console.log(C.red("  ✗ Verbotene/auffällige Aussagen gefunden:"));
findings.forEach((f) => console.log(C.red(`    • ${f.file} → ${f.hit}`)));
console.log("");
process.exit(1);
