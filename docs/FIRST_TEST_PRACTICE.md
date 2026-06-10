# Erste Test-Praxis: Ablauf & Checkliste

> **Wichtig:** Dieses Dokument beschreibt die manuelle Vorbereitung der ersten Test-Praxis.  
> Keine automatische Kaltakquise. Keine automatischen SMS/WhatsApp.  
> Erster Kontakt ausschließlich persönlich und mit Einverständnis der Praxis.

---

## Zweck

Bevor ClinicSlotHub für weitere Praxen geöffnet wird, soll eine einzige, sorgfältig ausgewählte
Test-Praxis den gesamten Ablauf manuell durchgehen. Das Ziel: Fehler früh finden,
Feedback sammeln und das Produkt verbessern – ohne echte Patienten oder echte Nachrichten zu gefährden.

---

## Schritt 1: Test-Praxis auswählen

- **Manuell auswählen**: Die erste Test-Praxis wird persönlich angesprochen.
  Keine automatische E-Mail, kein automatischer Anruf, keine Lead-Liste.
- **Geeignete Praxis**: Arzt-, Zahnarzt- oder Facharztpraxis mit aktiver Warteliste.
- **Einverständnis**: Die Praxis erklärt sich bereit, das System zu testen und
  Feedback zu geben.
- **Anforderung**: Mindestens eine verantwortliche Person in der Praxis, die den
  Ablauf aktiv begleitet.

---

## Schritt 2: Datenschutz & Einwilligung klären

> **Keine Rechtsberatung** – dieses Dokument ersetzt keine anwaltliche Prüfung.
> Vor dem echten Einsatz mit Patientendaten rechtliche Beratung einholen.

- Praxis-Leitung informieren, welche Daten gespeichert werden:
  - Name und Kontaktdaten der Praxis (für Authentifizierung)
  - Testpatienten-Daten (nur für Testzwecke, nicht für Produktion)
  - Technische Logs (anonymisiert)
- Klarstellen: **Im Testmodus werden keine echten Patienten-Nachrichten versendet.**
  Messaging ist standardmäßig deaktiviert (`MESSAGING_PROVIDER=none`).
- Klarstellen: Keine Weitergabe von Patientendaten an Dritte ohne Zustimmung.
- Schriftliche Bestätigung der Praxis für den Testbetrieb empfohlen.

---

## Schritt 3: Testpatienten anlegen

- In der ClinicSlotHub-Oberfläche unter `/dashboard/patients` Testpatienten anlegen.
- **Keine echten Patientendaten** im Testmodus verwenden.
- Eindeutige Test-Namen verwenden, z. B. "Test Patient 1", "Test Patient 2".
- Telefonnummern: Nur Test-Nummern (z. B. eigene Mobilnummer der Praxis).
- Sicherstellen, dass `MESSAGING_PROVIDER=none` oder DryRun aktiv ist
  (zu prüfen unter `/admin/messaging-setup`).

---

## Schritt 4: Terminlücke simulieren

- Unter `/dashboard/appointments` einen Termin anlegen.
- Termin als "abgesagt" markieren → Terminlücke entsteht.
- Prüfen ob die Warteliste korrekt dargestellt wird.
- Prüfen ob das Dashboard die Lücke anzeigt.

---

## Schritt 5: Warteliste testen

- Unter `/dashboard/waitlist` einen oder mehrere Testpatienten auf die Warteliste setzen.
- Prüfen ob passende Patienten für die Terminlücke vorgeschlagen werden.
- **Keine echten Benachrichtigungen im Testmodus senden.**
  - Wenn die Praxis den echten Versand testen möchte:
    1. Nur an eigene Test-Nummern senden (mit ausdrücklicher Zustimmung).
    2. Messaging-Provider manuell konfigurieren (Twilio o. ä.).
    3. Dokumentieren, wann echte Nachrichten freigeschaltet wurden.

---

## Schritt 6: Fill-Anfrage vorbereiten (optional)

- Unter `/fill/[slug]` die Bestätigungs-Seite prüfen.
- Prüfen ob Datenschutz-Hinweis korrekt angezeigt wird.
- Prüfen ob kein "DSGVO-konform"-Text vorhanden ist
  (nur "datenschutzbewusst" ist korrekt).

---

## Schritt 7: Feedback sammeln

Nach dem Testlauf Feedback von der Praxis einholen:

| Bereich | Frage |
|---------|-------|
| Registrierung | War der Anmelde-Prozess verständlich? |
| Dashboard | Waren die wichtigsten Funktionen leicht zu finden? |
| Warteliste | War die Wartelisten-Verwaltung intuitiv? |
| Termine | War die Terminverwaltung klar? |
| Messaging | War klar, dass im Testmodus keine echten Nachrichten gesendet werden? |
| Allgemein | Was hat gut funktioniert? Was war verwirrend? |

Feedback-Kanäle:
- Persönliches Gespräch (bevorzugt)
- E-Mail an Admin
- Keine automatisierten Feedback-Formulare ohne Zustimmung

---

## Wichtige Einschränkungen

| Verboten | Warum |
|----------|-------|
| Automatische SMS/WhatsApp an Testpatienten | Standardmodus ist `none` – echter Versand nur nach bewusster Konfiguration |
| Echte Patientendaten im Testmodus | Datenschutz – nur Testdaten im Testbetrieb |
| Automatische Kaltakquise an andere Praxen | Nur manuelle Ansprache |
| Versprechen von garantierten Ergebnissen | Kein Heilversprechen, kein Umsatzversprechen |
| "DSGVO-konform" als Marketing-Aussage | Nur "datenschutzbewusst" ist korrekt |

---

## Nächste Schritte nach der Test-Praxis

1. Feedback auswerten und kritische Punkte beheben.
2. Go-Live-Checkliste unter `/admin/go-live` abarbeiten.
3. Zweite Test-Praxis ebenfalls manuell auswählen.
4. Erst nach erfolgreichem Feedback: Breiteren Zugang freischalten.

---

*Erstellt im Rahmen des Go-Live-Readiness-Checks (Schritt 21).*  
*Dieses Dokument ist kein Rechtsrat und kein Garantieversprechen.*
