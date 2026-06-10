# CEO Delegated Launch Operations

Stand: Juni 2026 | Phase 16 | Nur für internen Admin-Zugang

---

## Warum dieses Modul existiert

Der Betreiber von ClinicSlotHub ist beschäftigt und arbeitet an mehreren Projekten.
Das System soll ihm Arbeit abnehmen – nicht andersrum.

Dieses Modul übernimmt alle Vorbereitungsaufgaben rund um den öffentlichen Launch:
- Statusüberwachung
- Aufgaben-Priorisierung
- Outreach-Textvorbereitung
- Lead-Tracking
- Compliance-Checks

Der Betreiber sieht täglich maximal 3 Aufgaben und entscheidet nur noch:
**Prüfen / Freigeben / Nicht freigeben.**

---

## Zugangspunkt

**URL:** `https://clinicslothub.com/admin/ceo-launch`

Nur für Admin sichtbar. Zugang via `requireAdmin()` / `getAdminContext()`.

---

## Abteilungen und ihre Aufgaben

| Abteilung | Zuständigkeit | Automatisch? | Betreiber-Freigabe? |
|-----------|---------------|-------------|----------------------|
| CEO Control | Tägliches Briefing lesen, max. 3 Aufgaben freigeben | Nein | Ja |
| Product QA | Launch-Seiten auf 200 OK prüfen (Button) | Ja (per Klick) | Nein |
| SEO & Indexing | Sitemap/robots prüfen, Google/Bing manuell eintragen | Teilweise | Ja (Google/Bing) |
| Website Launch | Launch-Seiten optisch prüfen | Nein | Nein |
| Outreach Preparation | Texte vorbereiten und bereitstellen | Nein | Ja (Versand) |
| Lead Handling | Neue echte Leads anzeigen, Antwortvorlagen | Nein | Ja (Antworten) |
| Compliance & Trust | Ehrlichkeits-Checkliste prüfen | Nein | Nein |
| Analytics / Reporting | Lead-Zahlen anzeigen, optionales Setup | Nein | Ja (Analytics) |

---

## Was automatisch geprüft wird

### Product QA (POST /api/admin/ceo-launch/qa-check)
Per Klick auf den Button werden folgende URLs live geprüft:
- `/de/launch` → HTTP 200
- `/en/launch` → HTTP 200
- `/de/share` → HTTP 200
- `/en/share` → HTTP 200
- `/de/public-launch` → HTTP 200
- `/book/testpraxis-delta` → HTTP 200
- `/sitemap.xml` → HTTP 200
- `/robots.txt` → HTTP 200
- `/de` (Homepage) → HTTP 200
- `/en` (Homepage) → HTTP 200
- `/dashboard` → NICHT 200 (geschützt)

Ergebnis: Grün / Gelb / Rot je Check. Kein Auto-Versand. Reine Leseprüfung.

### Lead-Statistiken (GET /api/admin/ceo-launch)
- Echte vs. Test-Leads aus DB (contact_messages, booking_requests)
- Letzter Zeitpunkt einer echten Anfrage
- Anzeige der 5 letzten echten Leads für Lead Handling

---

## Was nur vorbereitet wird (kein Auto-Versand)

### Outreach-Texte
- 5 kurze DE-Texte (Social, Community, WhatsApp/Signal, E-Mail)
- 5 kurze EN-Texte
- 1 langer DE-E-Mail-Text
- 1 langer EN-E-Mail-Text

**Nur Kopieren. Kein Versand-Button. Keine automatische Zustellung.**
Jeder Text wird vom Betreiber selbst manuell weitergeleitet.

### Antwortvorlagen für Leads
- DE-Vorlage: Schriftliche Anforderungsklärung, kein Telefon
- EN-Vorlage: Same in English

**Keine automatische Antwort. Nur Copy-Button.**

---

## Was NIEMALS automatisch passiert

- ❌ Kein automatischer E-Mail-Versand an Interessenten
- ❌ Kein SMS/WhatsApp-Versand ohne Aktivierung
- ❌ Keine automatische Kaltakquise
- ❌ Keine automatische Registrierung in Verzeichnissen
- ❌ Keine Fake-Kunden oder Fake-Umsätze
- ❌ Keine Social-Media-Posts ohne Betreiber-Freigabe
- ❌ Keine bezahlten Anzeigen automatisch schalten
- ❌ Keine Löschung oder Veränderung von Kundendaten

---

## Wie der Betreiber mit wenig Zeit arbeitet

### Maximal-3-Aufgaben-Regel

Das Daily CEO Briefing zeigt täglich exakt **3 Aufgaben**, nicht mehr:

1. **Immer:** Launch-Seite DE öffnen und optisch prüfen (5 Min.)
2. **Wenn Leads vorhanden:** Anfragen lesen und Antwortvorlage kopieren
   **Wenn keine Leads:** Einen Kurztext kopieren und manuell an 1 Kontakt senden
3. **Abwechselnd:** Google Search Console prüfen ODER Product QA-Check starten

### Zeitaufwand pro Tag: ca. 10–20 Minuten

Alles, was nicht in den 3 Aufgaben steht, ist dokumentiert und wartet.
Das System verliert nichts, der Betreiber muss sich nicht merken.

---

## SEO & Indexing – Manuelle Schritte (einmalig)

Diese Schritte führt der Betreiber einmalig durch (nicht automatisierbar):

1. **Google Search Console:**
   - → https://search.google.com/search-console
   - Domain `clinicslothub.com` hinzufügen (DNS-Verifizierung)
   - Sitemap eintragen: `https://clinicslothub.com/sitemap.xml`

2. **Bing Webmaster Tools:**
   - → https://www.bing.com/webmasters
   - Domain `clinicslothub.com` hinzufügen

Die SEO-Checkliste im Dashboard (Abschnitt D) zeigt den Status und ist lokal speicherbar.

---

## Lead-Handling-Prinzipien

- **Kein Telefon zuerst:** Schriftlich klären, dann entscheiden
- **Keine Patientendaten anfordern:** Nur allgemeine Praxis-Infos
- **Keine medizinische Beratung:** ClinicSlotHub ist Software, kein Medizinprodukt
- **Kein Fake-Interesse simulieren:** Nur echte Reaktionen auf echte Anfragen
- **Echter Interessent → als Lead markieren** (in Admin-Ansicht)

---

## Compliance-Grundsätze (unveränderlich)

- Keine Fake-Kunden, keine Fake-Testimonials, keine Fake-Umsätze
- Keine übertriebenen Versprechen
- Stripe integriert aber noch nicht aktiviert – Preisseite kommuniziert das klar
- Legal-Seiten (Impressum, Datenschutz, AGB, AVV) immer erreichbar
- Status „Öffentlicher Soft Launch, keine zahlenden Kunden" korrekt kommuniziert

---

## Technische Architektur

```
app/
  admin/
    ceo-launch/
      page.tsx              # "use client" Dashboard (READ + Copy only)
  api/
    admin/
      ceo-launch/
        route.ts            # GET – Lead-Stats + Dept-Assignments + Outreach-Texte
        qa-check/
          route.ts          # POST – URL-Checks (11 Checks, READ-ONLY)

components/
  admin-shell.tsx           # Nav-Eintrag "CEO Launch Ops" ergänzt

docs/
  CEO_DELEGATED_LAUNCH_OPERATIONS.md  # Diese Datei
```

---

*Kein Auto-Versand. Kein Spam. Kein Fake. Der Betreiber entscheidet.*
