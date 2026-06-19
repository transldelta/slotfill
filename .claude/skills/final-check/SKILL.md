---
name: final-check
description: Slotfill-Abschlussprüfung mit CEO Go/No-Go. Führt Gates, Lint, Build und Tests zusammen und liefert eine einfache GO/NO-GO-Empfehlung. Nutzen, wenn der Inhaber „fertig", „final", „prüfen", „abschließen" o. ä. sagt.
---

# Final Check (Slotfill)

Backup zum Stop-Hook. Führe aus:

1. Vollständige Kontrolle:
   ```bash
   npm run claude:final
   ```
   (Für inkl. Production-Build: `node scripts/claude/final-verify.mjs --full`.)

2. Bei UI-Änderungen zusätzlich visuell prüfen (Playwright/Chromium):
   - Mobile 360/375/390/430 + Desktop 1280/1440
   - 0 Console-/Hydration-Fehler, 0 broken images, 0 Overflow
   - `/book/testpraxis-delta` = HTTP 200, CTAs klickbar

3. CEO-Bericht im Format aus `docs/release-gates.md` liefern (Go/No-Go).

4. Nur bei GO: gezielt committen (kein `git add .`), dann pushen.

NO-GO, wenn Lint/Build/Tests rot sind, Secrets/Fake-Claims auftauchen oder ein
Button/Bild/Layout kaputt ist.
