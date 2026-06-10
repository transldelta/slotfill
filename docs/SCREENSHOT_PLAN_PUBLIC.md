# Screenshot-Plan – Öffentliche Launch-Assets

Stand: Juni 2026 | ClinicSlotHub | Nur öffentliche, datenschutzkonforme Screenshots

Regel: Keine privaten Daten, keine Admin-Oberflächen, keine internen Tools.

---

## ✅ Erlaubte Screenshots (für öffentliche Verwendung)

### 1. Startseite Hero – `/de`
- **Was zeigen:** Hero-Bereich mit Headline, Subheadline und CTA-Button
- **Fokus:** Wert-Proposition auf einen Blick
- **Hinweis:** Falls Demoinhalte sichtbar sind: Placeholder-Text sicherstellen
- **Device:** Desktop (1280×800 oder 1440×900)
- **Dateiname:** `screenshot-hero-de.png`

### 2. Features-Bereich – `/de`
- **Was zeigen:** Feature-Übersicht (z. B. Warteliste, Benachrichtigung, Mehrsprachigkeit)
- **Fokus:** 3–4 Feature-Cards oder Feature-Liste
- **Hinweis:** Kein Preis, kein Umsatz sichtbar
- **Device:** Desktop
- **Dateiname:** `screenshot-features-de.png`

### 3. Buchungsformular (leer) – `/de/termin-buchen` oder Direktlink einer Demo-Praxis
- **Was zeigen:** Leeres, ausgefülltes Beispiel-Buchungsformular (kein echter Patient)
- **Fokus:** Einfachheit des Formulars für Patienten
- **Wichtig:** Keine echten Patientendaten. Nur Placeholder oder Demo-Daten wie "Muster, Max".
- **Hinweis:** Buchungslinks sind public – kein Login nötig
- **Device:** Desktop + Mobile
- **Dateiname:** `screenshot-booking-form-de.png`, `screenshot-booking-form-mobile.png`

### 4. Pricing-Seite – `/de/pricing`
- **Was zeigen:** Preisübersicht mit den drei Plänen
- **Fokus:** Übersichtlichkeit, Trial-Hinweis ("14 Tage kostenlos")
- **Hinweis:** CTA führt aktuell zu /kontakt (Stripe nicht aktiviert) – das ist korrekt so
- **Device:** Desktop
- **Dateiname:** `screenshot-pricing-de.png`

### 5. Blog-Übersicht – `/de/blog`
- **Was zeigen:** Blog-Listenansicht mit Artikelkarten
- **Fokus:** Fachkompetenz, SEO-Content, Vertrauensaufbau
- **Hinweis:** Kein Artikel mit falschen Fakten oder Behauptungen vor Screenshot prüfen
- **Device:** Desktop
- **Dateiname:** `screenshot-blog-de.png`

### 6. Startseite Englisch – `/en`
- **Was zeigen:** Hero-Bereich auf Englisch
- **Fokus:** Zeigt internationale Ausrichtung der Plattform
- **Device:** Desktop
- **Dateiname:** `screenshot-hero-en.png`

### 7. Mobile Ansicht – `/de` oder `/de/termin-buchen`
- **Was zeigen:** Mobile-optimierte Ansicht (Smartphone-Viewport, 375×812 oder 390×844)
- **Fokus:** Responsive Design, Bedienbarkeit auf kleinen Bildschirmen
- **Device:** iPhone 14 Pro Simulation oder Browser DevTools Mobile Emulation
- **Dateiname:** `screenshot-mobile-de.png`

### 8. Sprachauswahl (optional, bonus)
- **Was zeigen:** Language Switcher mit Sprachoptionen aufgeklappt
- **Fokus:** 10 Sprachen verfügbar
- **Device:** Desktop
- **Dateiname:** `screenshot-language-switcher.png`

---

## ❌ Nicht verwenden (für Marketing-Screenshots)

| Was | Warum |
|---|---|
| Admin-Dashboard mit echten Patientendaten | Datenschutz: personenbezogene Daten |
| Supabase Dashboard | Internes Tool, keine Relevanz für Nutzer |
| Vercel Dashboard / Deployment-Logs | Interne Infrastruktur |
| Resend Dashboard / E-Mail-Logs | Transaktionsdaten, intern |
| Gmail / E-Mail-Client | Enthält potenzielle personenbezogene Daten |
| Impressum als Marketing-Screenshot | Enthält private Adresse und Steuernummer |
| Datenschutzerklärung als Marketing-Screenshot | Kein visueller Mehrwert für Marketing |
| AGB als Marketing-Screenshot | Kein visueller Mehrwert für Marketing |
| AVV als Marketing-Screenshot | Nur relevant für Vertragsabschluss |
| Stripe Dashboard | Keine Aktivität, interne Infrastruktur |

---

## Screenshot-Werkzeuge (kostenlos)

| Tool | Verwendung |
|---|---|
| Browser DevTools | Mobile Simulation (F12 → Device Toolbar) |
| macOS Screenshot (Cmd+Shift+4) | Präziser Bereich auf Desktop |
| Cleanshot X / Shottr | Professionelle Annotationen (optional, kostenpflichtig) |
| Screely.com | Schöner Rahmen / Browser-Mockup (kostenlos) |
| Mockuphone.com | Smartphone-Mockup-Rahmen (kostenlos) |

---

## Empfohlener Datei-Ablageort

```
/assets/screenshots/
  screenshot-hero-de.png
  screenshot-features-de.png
  screenshot-booking-form-de.png
  screenshot-booking-form-mobile.png
  screenshot-pricing-de.png
  screenshot-blog-de.png
  screenshot-hero-en.png
  screenshot-mobile-de.png
  screenshot-language-switcher.png
```

Dieser Ordner ist nicht im Repo versioniert – Screenshots lokal speichern oder in einem separaten Drive-Ordner ablegen.

---

## Verwendungszwecke

| Screenshot | Verwendung |
|---|---|
| Hero DE / EN | LinkedIn-Post, Community-Post, Projektseite |
| Features | Produktbeschreibung, Pitch, Demo-Material |
| Buchungsformular | "So sehen Patienten das" – zeigt UX |
| Pricing | Bei Fragen zur Preisgestaltung |
| Blog | Content-Marketing, SEO-Nachweis |
| Mobile | LinkedIn-Post mit "responsive" Aussage |
| Language Switcher | Internationale Positionierung |

---

*Datenschutzhinweis: Vor dem Erstellen von Screenshots mit Demo-Praxis-Daten sicherstellen, dass keine echten Patientendaten sichtbar sind. Im Zweifel: frisches Testkonto ohne Echtdaten verwenden.*
