---
name: stopp-kontrolle
description: Slotfill-Notbremse. Sofort anhalten, nichts mehr ändern/committen/pushen, aktuellen Stand sicher zusammenfassen. Nutzen, wenn der Inhaber „stopp", „stop alles", „anhalten", „nicht weiter" o. ä. sagt.
---

# Stopp-Kontrolle (Slotfill)

Wenn der Inhaber stoppen will:

1. **Sofort anhalten.** Keine weiteren Datei-Änderungen. Kein Commit. Kein Push.
   Keine externen Aktionen.

2. Laufende lokale Prozesse sauber beenden (z. B. Dev-Server), nichts löschen.

3. Aktuellen Stand sicher zeigen (ohne Secrets):
   ```bash
   npm run claude:changed-files
   ```

4. Kurz und einfach berichten:
   - Was wurde bisher geändert (Dateien + Risiko)?
   - Was ist noch offen?
   - Was wurde ausdrücklich NICHT aktiviert?
   - Empfohlene nächste sichere Schritte.

5. Auf weitere Anweisung warten. Nichts committen/pushen ohne ausdrückliche Freigabe.
