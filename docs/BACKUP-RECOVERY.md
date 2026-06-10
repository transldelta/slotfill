# Backup & Recovery – ClinicSlotHub

Diese Checkliste ist eine Empfehlung. ClinicSlotHub führt **keine** automatische
Backup-Wiederherstellung aus und erzeugt **keine** Datenbank-Dumps.

## Vor dem Produktivstart

- [ ] Supabase-Projekt prüfen (richtige Region, korrektes Projekt).
- [ ] Backup-Plan im Supabase-Dashboard prüfen
      (Project → Database → Backups; Point-in-Time Recovery je nach Plan).
- [ ] Eine Wiederherstellung **testweise** durchführen, **bevor** echte
      Kundendaten verarbeitet werden.

## Vor größeren Änderungen

- [ ] Vor dem Einspielen neuer Migrationen ein aktuelles Backup sicherstellen.
- [ ] Migrationen zuerst auf einer Testumgebung/Branch-DB ausführen.

## Datenschutz

- Keine Kundendaten manuell exportieren ohne sicheren, berechtigten Zweck.
- Exporte/Löschungen dokumentieren.

## Hinweise

- Der Operations-/Security-Agent kann den Backup-Status nicht zuverlässig über
  eine API auslesen und zeigt daher eine **manuelle** Aufgabe an:
  „Supabase-Backup- und Wiederherstellungsstrategie prüfen."
- Empfehlung: vor jeder größeren Änderung die Datenbank sichern.
