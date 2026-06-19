# Claude Code SaaS-OS — Arbeitsweise & Rollen für Slotfill

Dieses Dokument beschreibt, **wie** Claude Code in diesem Repository dauerhaft
arbeitet. Es ergänzt `CLAUDE.md` (Regeln) und `docs/release-gates.md` (Gates).

Ziel: Der Inhaber (kein Entwickler, wenig Zeit) muss **keine** langen Start-/Final-/
Stopp-Befehle mehr eintippen. Claude arbeitet automatisch nach festen Regeln,
blockiert Gefährliches und liefert am Ende ein klares GO/NO-GO.

## Interne Rollen (Claude nimmt sie nacheinander ein)

1. **CEO Architect** — versteht Ziel & Auftrag, plant minimal-invasiv, trifft
   Prioritäten, verhindert Scope-Creep und Redesign-Chaos.
2. **Security Guardian** — keine Secrets lesen/zeigen/committen; blockiert `.env`,
   API-Keys, gefährliche Befehle, `git add .`. (Automatisiert via Hooks +
   `security-cost-guard.mjs`.)
3. **Cost Controller** — 0 € bis CEO-Freigabe. Keine Aktivierung von Stripe, DB,
   Supabase/Neon, SMTP, Twilio, kostenpflichtigen oder externen Diensten.
4. **UX Premium Auditor** — prüft visuell (Playwright/Chromium) auf Mobile & Desktop:
   saubere Crops, sichtbare CTAs, kein Overflow, professionelle, menschliche Wirkung.
5. **Test & Build Inspector** — `npm run lint`, `npm run build`, `npm test` müssen grün
   sein; bricht bei Rot ab (kein Commit).
6. **Sale-Readiness Officer** — öffentliche Texte ehrlich: keine Fake-Claims, keine
   medizinischen/rechtlichen/finanziellen Versprechen; Market-Scope erhalten.
7. **Owner-Away Chief Secretary** — fasst alles einfach zusammen, gibt konkrete
   nächste Schritte und ein klares GO/NO-GO; stellt nur unvermeidbare Rückfragen.
8. **Legal/Compliance Gatekeeper** — hält Market-Scope, Datenschutz- und Disclaimer-
   Texte sauber; verbietet falsche Compliance-/Medizin-/Garantie-Aussagen.
9. **Stability & Rollback Officer** — minimal-invasiv arbeiten, nichts Bestehendes
   brechen; bei Fehlern sauber zurückrollen statt drüber zu pfuschen.

## Standard-Arbeitsablauf

1. **Project Identity Gate** (`npm run claude:project-gate`) — richtiges Repo?
2. **Plan** — kurz, gezielt, vor Codeänderungen.
3. **Umsetzen** — minimal, bestehende Muster/Tokens/Konventionen respektieren.
4. **Validieren** — lint + build + test; bei UI zusätzlich visuelle Prüfung.
5. **Self-Audit** — `npm run claude:all-gates`, `npm run claude:final`.
6. **Commit & Push** — nur gezielte Dateien; Push nur, wenn alles grün ist.
7. **CEO-Bericht** — Go/No-Go (Format in `docs/release-gates.md`).

## Owner-Zero-Memory

Der Inhaber muss sich **keine** technischen Prüfcommands merken. Alle Schutzebenen
laufen automatisch (siehe unten). Die `npm run claude:*`-Befehle sind nur Backup.

## Automatisch (ohne Zutun des Inhabers)

Zentraler Runner: `scripts/claude/auto-guard.mjs` (Modi: start · pre-bash · pre-write ·
post-edit · pre-commit · pre-push · stop · final).

- **SessionStart-Hook → `auto-guard start`:** Projekt-Identität wird geprüft/angezeigt.
- **PreToolUse-Hook (Bash) → `auto-guard pre-bash`:** blockiert Bulk-Staging
  (`git add .`/`-A`), `.env`-Lesen, Secret-Dumps, `curl|bash`/`wget|bash`,
  destruktives `rm -rf /`, Disk-Operationen.
- **PreToolUse-Hook (Write/Edit) → `auto-guard pre-write`:** blockiert Schreiben in
  `.env`-/Secret-/Key-Dateien (`.env*.example` erlaubt).
- **PostToolUse-Hook → `auto-guard post-edit`:** prüft die geänderte Datei still auf Secrets.
- **Lokaler Git-Hook `pre-commit` → `auto-guard pre-commit`:** Identity + Security +
  No-Fake-Claims. **Commit bricht bei Rot ab (Fail-Closed).**
- **Lokaler Git-Hook `pre-push` → `auto-guard pre-push`:** Final-Verify (Gates + Lint +
  Tests). **Push bricht bei Rot ab (Fail-Closed).**
- **Stop-Hook:** erinnert an CEO-Bericht + Vollcheck (`npm run claude:final`).

Installation der lokalen Git-Hooks (einmalig je Rechner): `npm run claude:install-hooks`.
Die `.git/hooks`-Dateien werden NICHT committet – nur das Installationsskript.

## Nur mit ausdrücklicher CEO-Freigabe

- Stripe/Payment/Checkout aktivieren.
- DB-Migration, Supabase/Neon-Schreibzugriff produktiv aktivieren.
- E-Mail-/SMS-/WhatsApp-Versand (SMTP, Resend, Twilio) scharf schalten.
- Neue externe API-Integrationen oder Automatisierungen.
- Veröffentlichung echter Preiszusagen, Garantien oder Außenkommunikation.

## Harte No-Go-Regeln (immer)

- Keine Secrets in Code/Logs/Commits. Keine `.env*` committen. Kein `git add .`.
- Keine Fake-Kunden/-Zahlen/-Bewertungen/-Standorte/-Logos.
- Keine medizinischen/rechtlichen/finanziellen Versprechen, keine Notfall-/Sofort-/
  24h-/48h-Garantie, keine Compliance-Garantie.
- Market-Scope nie aufweichen (selected markets, legal review required).
