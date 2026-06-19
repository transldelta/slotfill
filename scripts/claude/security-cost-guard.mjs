#!/usr/bin/env node
/**
 * Security & Cost Guard
 *
 * Zwei Rollen:
 *  1) HOOK-MODUS (PreToolUse) – blockiert gefährliche Aktionen, bevor sie laufen:
 *        node scripts/claude/security-cost-guard.mjs --hook bash    (prüft Bash-Kommando)
 *        node scripts/claude/security-cost-guard.mjs --hook write   (prüft Datei-Schreibziel)
 *     Eingabe = Hook-JSON via stdin. Blockt mit Exit-Code 2 + Begründung.
 *
 *  2) SCAN-MODUS (CLI) – durchsucht den Arbeitsstand nach Secrets / kostenpflichtiger
 *     Dienst-Aktivierung:
 *        node scripts/claude/security-cost-guard.mjs            (Exit 1 bei Fund)
 *
 * Regeln: keine Secrets ausgeben, kein git add ., keine externen Dienste ohne
 * CEO-Freigabe, 0 € Kosten, keine Netzwerkzugriffe.
 */
import { readFileSync } from "node:fs";
import { readHookInput, sh, C, blockTool, allowTool } from "./_lib.mjs";

const mode = process.argv[2] === "--hook" ? process.argv[3] : "scan";

// ── Gefährliche Bash-Muster (deterministisch, eng gefasst → keine Fehlalarme) ──
const BASH_BLOCKS = [
  { re: /\bgit\s+add\s+(\.|-A\b|--all\b|:\/|\*)/, why: "Pauschales 'git add .' ist verboten – bitte nur gezielte Dateien adden." },
  { re: /\bgit\s+commit\s+(-a\b|--all\b)/, why: "'git commit -a' fügt alle Änderungen hinzu – bitte nur gezielte Dateien committen." },
  // Lesen/Anzeigen echter .env-/Secret-Dateien (.example ist erlaubt)
  {
    re: /\b(cat|less|more|head|tail|bat|nl|xxd|od|strings|nano|vim?|code|open|grep|awk|sed|print)\b[^|;&\n]*\.env(\.local|\.production|\.development)?\b(?![\w.]*\.example)/,
    why: "Anzeigen/Lesen von .env-Dateien ist blockiert (Secrets). .env*.example ist erlaubt.",
  },
  { re: /\bprintenv\b|\benv\s*$|\benv\s*\|/, why: "Vollständiges Environment-Dump ist blockiert (kann Secrets enthalten)." },
  {
    re: /echo\s+["']?\$\{?[A-Z_]*?(KEY|SECRET|TOKEN|PASSWORD|PASSWD|SUPABASE|STRIPE|TWILIO|RESEND|SMTP|API_KEY|SERVICE_ROLE)[A-Z_]*\}?/i,
    why: "Ausgeben von Secret-Umgebungsvariablen ist blockiert.",
  },
  { re: /\b(curl|wget)\b[^|\n]*\|\s*(sudo\s+)?(bash|sh|zsh)\b/, why: "Pipe-to-Shell (curl|bash) ist blockiert (Remote-Code-Ausführung)." },
  { re: /\brm\s+-[rf]{1,2}\s+(\/|~|\$HOME|\/\*|\*)\s*($|\s)/, why: "Destruktives 'rm -rf' auf Root/Home ist blockiert." },
  { re: /:\(\)\s*\{\s*:\|:&\s*\}\s*;:/, why: "Fork-Bomb ist blockiert." },
  { re: /\b(mkfs|dd\s+if=)/, why: "Datenträger-Operation (mkfs/dd) ist blockiert." },
  // Versehentliches Veröffentlichen von Secrets / Downloads / Screenshots
  { re: /\bgit\s+add\b[^\n]*\.(env|pem|key|p12|pfx)\b/, why: "Secret-/Schlüsseldateien dürfen nicht committet werden." },
];

// ── Datei-Schreibziele, die blockiert werden ──
const WRITE_BLOCKS = [
  { re: /(^|\/)\.env(\.[A-Za-z0-9_-]+)?$/, allow: /\.example$/, why: ".env-/Secret-Dateien dürfen nicht von Claude geschrieben werden." },
  { re: /(^|\/)(secrets?|credentials?)\.(json|ya?ml|env|txt)$/i, why: "Credential-/Secret-Dateien dürfen nicht geschrieben werden." },
  { re: /(^|\/)id_(rsa|ed25519)\b|\.(pem|p12|pfx)$/i, why: "Private-Key-Dateien dürfen nicht geschrieben werden." },
];

/**
 * Entfernt Heredoc-Körper und Commit-Message-Texte aus dem Kommando, bevor wir
 * nach gefährlichen Mustern suchen. So lösen z. B. Commit-Nachrichten, die
 * "git add ." nur ERWÄHNEN, keinen Fehlalarm aus – echte gefährliche Kommandos
 * stehen nie in einem Heredoc oder in einer -m-Nachricht.
 */
function stripForScan(cmd) {
  let s = cmd;
  // Heredoc-Blöcke: <<EOF ... EOF  /  <<'EOF' ... EOF  /  <<-EOF ... EOF
  s = s.replace(/<<-?\s*['"]?([A-Za-z_][A-Za-z0-9_]*)['"]?[\s\S]*?\n[ \t]*\1\b/g, " <<heredoc>> ");
  // Commit-/Tag-Nachrichten:  -m "..."  /  -m '...'  /  --message=...
  s = s.replace(/(-m|--message)\s*=?\s*"(?:[^"\\]|\\.)*"/g, " -m <msg> ");
  s = s.replace(/(-m|--message)\s*=?\s*'(?:[^'])*'/g, " -m <msg> ");
  return s;
}

function hookBash() {
  const data = readHookInput();
  const cmd = data?.tool_input?.command || "";
  const scan = stripForScan(cmd);
  for (const rule of BASH_BLOCKS) {
    if (rule.re.test(scan)) blockTool(rule.why + "\n  Kommando: " + cmd.slice(0, 200));
  }
  allowTool();
}

function hookWrite() {
  const data = readHookInput();
  const fp = data?.tool_input?.file_path || data?.tool_input?.path || "";
  for (const rule of WRITE_BLOCKS) {
    if (rule.re.test(fp) && !(rule.allow && rule.allow.test(fp))) {
      blockTool(rule.why + "\n  Ziel: " + fp);
    }
  }
  allowTool();
}

// ── SCAN-MODUS ──────────────────────────────────────────────────────────────
// Secret-Muster (nur Fundmeldung – Werte werden NICHT ausgegeben).
const SECRET_PATTERNS = [
  { re: /sk_live_[A-Za-z0-9]{16,}/, name: "Stripe Live Secret Key" },
  { re: /sk_test_[A-Za-z0-9]{16,}/, name: "Stripe Test Secret Key" },
  { re: /rk_live_[A-Za-z0-9]{16,}/, name: "Stripe Restricted Key" },
  { re: /AIza[0-9A-Za-z_\-]{30,}/, name: "Google API Key" },
  { re: /AKIA[0-9A-Z]{16}/, name: "AWS Access Key ID" },
  { re: /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/, name: "JWT / Supabase service_role token" },
  { re: /SG\.[A-Za-z0-9_\-]{20,}\.[A-Za-z0-9_\-]{20,}/, name: "SendGrid Key" },
  { re: /re_[A-Za-z0-9]{20,}/, name: "Resend API Key" },
  { re: /(AC|SK)[0-9a-fA-F]{32}/, name: "Twilio SID/Key" },
  { re: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/, name: "Private Key" },
];

// Hinweise auf kostenpflichtige / externe Dienst-Aktivierung in NEUEM Code.
const SERVICE_ACTIVATION = [
  { re: /new\s+Stripe\(|stripe\.checkout\.sessions\.create/, name: "Stripe-Checkout-Aktivierung" },
  { re: /createTransport\(|nodemailer/, name: "SMTP-Versand (nodemailer)" },
  { re: /new\s+Resend\(/, name: "Resend-Mailversand-Aktivierung" },
  { re: /twilio\(|new\s+twilio/, name: "Twilio-Versand-Aktivierung" },
];

function listTrackedFiles() {
  const r = sh("git ls-files");
  if (!r.ok) return [];
  return r.out
    .split("\n")
    .filter(Boolean)
    .filter((f) => !/\.(png|jpe?g|webp|avif|gif|ico|pdf|lock)$/i.test(f))
    .filter((f) => !/package-lock\.json$|tsconfig\.tsbuildinfo$/.test(f));
}

function scan() {
  const files = listTrackedFiles();
  const findings = [];
  const serviceFindings = [];

  for (const f of files) {
    let txt = "";
    try {
      txt = readFileSync(f, "utf8");
    } catch {
      continue;
    }
    // .env*.example dürfen Platzhalter enthalten – Secrets dort ignorieren.
    const isEnvExample = /\.env.*\.example$/.test(f);
    if (!isEnvExample) {
      for (const p of SECRET_PATTERNS) {
        if (p.re.test(txt)) findings.push({ file: f, name: p.name });
      }
    }
    // Dienst-Aktivierung nur in App-/Lib-Code melden (Tests/Doku ausgenommen).
    if (/^(app|lib|components|scripts)\//.test(f) && !/\.test\.[tj]s$/.test(f)) {
      for (const s of SERVICE_ACTIVATION) {
        if (s.re.test(txt)) serviceFindings.push({ file: f, name: s.name });
      }
    }
  }

  console.log(C.bold("\n🔐 Slotfill · Security & Cost Scan"));
  console.log(C.dim(`  geprüfte getrackte Dateien: ${files.length}`));

  if (findings.length === 0) {
    console.log(C.green("  ✓ Keine Secrets im getrackten Code gefunden."));
  } else {
    console.log(C.red("  ✗ Mögliche Secrets gefunden (Werte werden NICHT angezeigt):"));
    findings.forEach((x) => console.log(C.red(`    • ${x.file} → ${x.name}`)));
  }

  if (serviceFindings.length > 0) {
    console.log(C.yellow("  ⚠ Hinweise auf externe/kostenpflichtige Dienst-Aktivierung (nur mit CEO-Freigabe erlaubt):"));
    serviceFindings.forEach((x) => console.log(C.yellow(`    • ${x.file} → ${x.name}`)));
  } else {
    console.log(C.green("  ✓ Keine neue Stripe-/SMTP-/Twilio-Aktivierung erkannt."));
  }

  console.log("");
  process.exit(findings.length > 0 ? 1 : 0);
}

// PostToolUse: prüft NUR die gerade geänderte Datei (schnell, leise) – blockiert nie.
function hookPostWrite() {
  const data = readHookInput();
  const fp = data?.tool_input?.file_path || data?.tool_input?.path || "";
  if (!fp || /\.env.*\.example$/.test(fp)) process.exit(0);
  let txt = "";
  try {
    txt = readFileSync(fp, "utf8");
  } catch {
    process.exit(0);
  }
  const hits = SECRET_PATTERNS.filter((p) => p.re.test(txt)).map((p) => p.name);
  if (hits.length) {
    process.stderr.write(`\n⚠ SLOTFILL-GUARD: mögliche Secrets in ${fp}: ${hits.join(", ")} – bitte NICHT committen.\n`);
  }
  process.exit(0);
}

if (mode === "bash") hookBash();
else if (mode === "write") hookWrite();
else if (mode === "posttooluse") hookPostWrite();
else scan();
