# ClinicSlotHub – Real Lead Operations

**Stand:** 2026-06-10  
**Zweck:** Anleitung für den Betreiber – wie echte erste Anfragen erkannt, bearbeitet und von Testdaten getrennt werden.

---

## Wo echte Anfragen eingehen

### Kontaktanfragen
- **URL:** [clinicslothub.com/admin/contact-messages](https://clinicslothub.com/admin/contact-messages)
- **Standardfilter:** "Echt" – zeigt nur echte Anfragen (is_test = false)
- **E-Mail-Benachrichtigung:** Admin-Notification geht automatisch an `ADMIN_NOTIFICATION_EMAIL` (Fallback: transl.delta@gmail.com)
- **Betreff:** `New ClinicSlotHub contact request`

### Buchungsanfragen
- **URL:** [clinicslothub.com/admin/booking-requests](https://clinicslothub.com/admin/booking-requests)
- **Standardfilter:** "Ausstehend" – zeigt alle ausstehenden Anfragen
- **Filter "Alle echten"** zeigt alle echten Anfragen über alle Statuse
- **E-Mail-Benachrichtigung:** Admin-Notification geht automatisch an `ADMIN_NOTIFICATION_EMAIL`
- **Betreff:** `New ClinicSlotHub booking request`

### Admin-Übersicht (Real Lead Status Box)
- **URL:** [clinicslothub.com/admin](https://clinicslothub.com/admin)
- Zeigt: Echte Kontaktanfragen, Echte Buchungsanfragen, Testdaten-Zähler, Letzte echte Anfrage
- Testdaten werden **getrennt** und **nicht als echte Leads gezählt**

---

## Wie Testdaten erkannt werden

Testdaten sind mit `is_test = true` markiert. In der Admin-UI erscheinen sie mit einem **TEST**-Badge (amber/orange).

**Erkennungsmerkmale der bisherigen Testdaten:**
- Name enthält "Test", "Slot Test", "Ablehnung Test", "Auto Confirm", "Brahim Test"
- E-Mail ist `transl.delta@gmail.com` mit Test-Nachricht
- Nachricht enthält "Bitte ignorieren", "Admin Notification", "Canonical-Fix"

**Echte Anfragen:**
- Kommen von unbekannten Interessenten oder Praxisbetreibern
- `is_test = false` (Standard für alle neuen Einreichungen)
- Erscheinen im Filter "Echt" / "Ausstehend"

---

## Was bei einer echten Anfrage zu tun ist

### Kontaktanfrage (echte Interessenten-Anfrage)

1. **Admin-Benachrichtigung prüfen** – E-Mail im Gmail-Posteingang mit Betreff `New ClinicSlotHub contact request`
2. **Admin-Ansicht öffnen** – Link im E-Mail-Body oder direkt `/admin/contact-messages`
3. **Innerhalb 24h antworten** – direkt via E-Mail (Klick auf E-Mail-Adresse im Admin)
4. **Status dokumentieren** (optional) – Status-Feld in der DB (z.B. "replied")
5. **Nie löschen** ohne Antwort – Datensatz bleibt als Nachweis

### Buchungsanfrage (Patient möchte Termin)

1. **Admin-Benachrichtigung prüfen** – E-Mail mit Betreff `New ClinicSlotHub booking request`
2. **Admin-Ansicht öffnen** – `/admin/booking-requests` → Filter "Ausstehend"
3. **Anfrage prüfen** – Name, E-Mail, Wunschzeitraum, Anliegen
4. **Bestätigen oder Ablehnen:**
   - "Bestätigen" → E-Mail-Bestätigung an Patienten (wenn BOOKING_EMAIL_NOTIFICATIONS_ENABLED=true)
   - "Mit Termin bestätigen" → konkreten Datum+Uhrzeit-Slot angeben
   - "Ablehnen" → Patient erhält Ablehnungs-E-Mail
5. **Interne Notiz** optional hinzufügen (nur intern sichtbar)

---

## Wie E-Mail-Benachrichtigungen funktionieren

### Admin-Benachrichtigungen (bei neuer Anfrage)
- **Auslöser:** Kontaktformular oder Buchungsformular eingereicht
- **Technologie:** Resend API (konfiguriert via `RESEND_API_KEY`)
- **Empfänger:** `ADMIN_NOTIFICATION_EMAIL` → Fallback: `CONTACT_EMAIL` → Fallback: transl.delta@gmail.com
- **Ausführung:** `await` (nicht fire-and-forget) → zuverlässig in Vercel Serverless
- **Fehlerverhalten:** DB-Eintrag wird immer gespeichert, auch wenn E-Mail fehlschlägt
- **Test:** Admin-Test-Button auf `/admin/contact-messages`

### Kunden-Eingangsbestätigung (nach Kontaktformular)
- **Auslöser:** Kontaktformular eingereicht
- **Betreff:** "Wir haben Ihre Anfrage erhalten – ClinicSlotHub"
- **Absender:** konfiguriert via `RESEND_FROM_EMAIL`
- **Footer-Link:** `https://clinicslothub.com` (fest codiert via CANONICAL_URL)

### Buchungs-Bestätigung/Ablehnung (an Patient)
- **Auslöser:** Manuelles Admin-Klicken auf "Bestätigen" oder "Ablehnen"
- **Voraussetzung:** `BOOKING_EMAIL_NOTIFICATIONS_ENABLED=true`
- **Status-Anzeige:** Direkt im Admin-UI nach der Aktion

---

## Was NICHT automatisch passiert

| Was | Warum nicht |
|-----|-------------|
| SMS/WhatsApp an Patienten | `MESSAGING_PROVIDER=none` – kein Provider konfiguriert |
| Automatische Buchungsbestätigung ohne Konfiguration | `BOOKING_EMAIL_NOTIFICATIONS_ENABLED` muss explizit `true` sein |
| Kaltakquise oder Marketing-Mails | Grundsätzlich verboten – nur Transaktional/Inbound |
| Buchungsanfrage direkt bestätigen ohne Admin-Aktion | Nur wenn Auto-Confirm konfiguriert und aktiv (opt-in) |
| Testdaten in echten Lead-Zählern | `is_test=true` Einträge werden in allen Zählern ausgefiltert |

---

## Checkliste: Erster echter Lead

```
□ Admin-Benachrichtigung in Gmail erhalten?
□ Eintrag in /admin/contact-messages (Filter: Echt) sichtbar?
□ Eintrag in /admin/booking-requests (Filter: Ausstehend) sichtbar?
□ is_test = false (kein TEST-Badge)?
□ Innerhalb 24h geantwortet?
□ Buchungsanfrage bestätigt oder mit Begründung abgelehnt?
```

---

## Offene Punkte vor organischem Launch

1. **BOOKING_EMAIL_NOTIFICATIONS_ENABLED** – derzeit `false`. Für echte Buchungs-E-Mails (Bestätigung/Ablehnung an Patienten) auf `true` setzen (Vercel Environment Variables).
2. **RESEND_FROM_EMAIL** – sicherstellen, dass eine verifizierte Domain verwendet wird (nicht `onboarding@resend.dev`) für professionellen Absender.
3. **Rechtliche Texte** – AGB/Datenschutz haben noch den Hinweis "Rechtliche Prüfung vor Produktiveinsatz ausstehend." – vor erstem Kunden prüfen lassen.
4. **Google Search Console** – Sitemap unter `https://clinicslothub.com/sitemap.xml` einreichen (falls noch nicht geschehen).

---

*Dieses Dokument wird bei jeder größeren operativen Änderung aktualisiert.*
