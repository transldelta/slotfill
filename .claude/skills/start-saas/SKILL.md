---
name: start-saas
description: Slotfill-Arbeitsstart. Prüft Projekt-Identität, lädt die Projektregeln (CLAUDE.md, release-gates) und richtet den sicheren Arbeitsmodus ein. Nutzen, wenn der Inhaber „start", „los", „arbeite an Slotfill" o. ä. sagt.
---

# Start SaaS (Slotfill)

Backup zum automatischen SessionStart-Hook. Führe der Reihe nach aus:

1. Projekt-Identität prüfen:
   ```bash
   npm run claude:project-gate
   ```
   Bei Mismatch (falsches Repo) SOFORT stoppen und melden.

2. Regeln beachten: `CLAUDE.md`, `docs/release-gates.md`, `docs/claude-code-saas-os.md`.

3. Status sichten:
   ```bash
   git status --short && git log --oneline -3
   ```

4. Kurzen, gezielten Plan formulieren, dann minimal-invasiv arbeiten.

Erinnerung: 0 € ohne Freigabe · keine Secrets · kein `git add .` · keine externen
Dienste aktivieren · keine Fake-Claims · Market-Scope erhalten.
