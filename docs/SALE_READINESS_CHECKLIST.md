# PraxisFlow – Sale Readiness Checklist

> **Bewertung der Verkaufsreife des White-Label-SaaS.**  
> Stand: automatisch generiert. Vor Verkauf manuell aktualisieren.

---

## Gesamtbewertung

| Bereich | Status | Bewertung |
|---|---|---|
| Branding | ✅ | Produktionsbereit – White-Label-fähig |
| Landingpage | ✅ | Funktional, professionell |
| Admin-Bereich | ✅ | Vollständig, inkl. Go-Live-Agent |
| Buchungsflow | ✅ | Produktiv, Auto-Confirm implementiert |
| E-Mail-Flow | ⚠️ | Funktional, benötigt Resend-Domain |
| Rechtstexte | ✅ | Vollständig, Entwurf-Modus aktiv |
| Datenschutz | ✅ | DSGVO-bewusst umgesetzt |
| Dokumentation | ✅ | Käufer-Übergabe dokumentiert |
| Deployment | ✅ | Vercel, kostenfrei einsatzbereit |
| Demo-Fähigkeit | ✅ | Live unter slotfill-pi.vercel.app |
| Käufer-Übergabe | ✅ | BUYER_HANDOVER.md vorhanden |

---

## 1. Branding ✅

- [x] Zentrales Brand-Konfigurationsfile: `lib/brand.ts`
- [x] Produktname: **PraxisFlow** (via `BRAND_NAME`)
- [x] Team-Absender: **PraxisFlow Team** (via `BRAND_TEAM_NAME`)
- [x] Logo: Professionelles inline SVG – kein externes Bild, kein Emoji
- [x] Keine alten Branding-Reste (SlotFill, Clentra) auf öffentlichen Seiten
- [x] White-Label-fähig: 1 Datei ändern = gesamtes Produkt rebrandet
- [x] Impressum mit echten Betreiberdaten (Brahim Ben Abla)
- [x] Technischer Projektname dokumentiert: `slotfill` (GitHub/Vercel/Ordner)

**Risiko:** Niedrig  
**Nächster Schritt:** Käufer aktualisiert `lib/brand.ts` nach Kauf

> **Info:** Der technische Name im GitHub-Repository, im Vercel-Dashboard und als Ordnername lautet `slotfill` – das ist der ursprüngliche Entwicklungsname. Der öffentliche Produktname `PraxisFlow` ist davon unabhängig und kann jederzeit geändert werden. Das Projekt kann nach Kauf mit jeder eigenen Domain verbunden werden.

---

## 2. Landingpage ✅

- [x] Startseite `/de` und `/en` sauber, keine Platzhalter
- [x] Hero-Text klar und produktbeschreibend
- [x] Feature-Sektion vorhanden (4 Kernfunktionen)
- [x] Preisseite vorhanden (3 Pläne: Starter, Professional, Praxis Plus)
- [x] Blog vorhanden (3 Artikel, inhaltlich korrekt)
- [x] Kontaktformular funktionsfähig
- [x] Mehrsprachigkeit aktiv (10 Locales)
- [x] Keine Lorem Ipsum, keine Demo-Texte

**Risiko:** Niedrig  
**Nächster Schritt für höheren Wert:** Echte Praxis-Screenshots ergänzen

---

## 3. Admin-Bereich ✅

- [x] Dashboard übersichtlich
- [x] Go-Live-Readiness-Agent implementiert (Abschnitte A–J)
- [x] Booking-Settings (Öffnungszeiten, Pufferzeiten)
- [x] Buchungsanfragen-Verwaltung
- [x] Feedback-Auswertung
- [x] Messaging-Setup (Twilio-Test)
- [x] E-Mail-Setup-Prüfung
- [x] Keine Debug-Ausgaben öffentlich sichtbar

**Risiko:** Niedrig  
**Nächster Schritt:** Demo-Admin-Zugangsdaten für Käufer-Präsentation anlegen

---

## 4. Buchungsflow ✅

- [x] Öffentliche Buchungsseite: `/[locale]/termin-buchen`
- [x] Buchungsformular validiert (Zod)
- [x] Automatische Bestätigung (`auto_confirm_bookings`) implementiert
- [x] Buchungsregeln (`booking_availability_rules`) konfigurierbar
- [x] Blockzeiten (`booking_blocked_times`) implementiert
- [x] Slot-Generator (`lib/booking-slots.ts`) funktioniert
- [x] Konflikt-Prüfung bei Auto-Confirm

**Risiko:** Niedrig  
**Nächster Schritt:** Demo-Buchung für Käufer-Präsentation vorbereiten

---

## 5. E-Mail-Flow ⚠️

- [x] E-Mail-Templates vollständig (4 Templates)
- [x] Resend-Integration implementiert
- [x] Fehler-Handling: Fallback auf DB-Speicherung wenn kein API-Key
- [x] Kein persönlicher Name in automatischen E-Mails
- [ ] **Resend-Domain noch nicht verifiziert** – E-Mails gehen an Resend-Test-Adresse
- [ ] Absender-E-Mail noch Fallback (`transl.delta@gmail.com`)

**Risiko:** Mittel – E-Mail-Versand funktioniert, aber mit eingeschränkter Absender-Domain  
**Nächster Schritt:** Resend-Account mit verifizierter Domain einrichten

---

## 6. Rechtstexte ✅

- [x] Impressum (§ 5 DDG): vollständig mit Betreiberdaten
- [x] Datenschutzerklärung: vollständig, SaaS-spezifisch
- [x] AGB: vollständig, B2B-orientiert, 11 Paragraphen
- [x] AVV (Auftragsverarbeitung): vollständig, DSGVO-konform
- [x] Alle 10 Locales mit rechtlichen Hinweisen
- [x] `isLegalDraft()` Flag für Übergangshinweis

**Risiko:** Mittel – Entwurfsmodus aktiv; vor Produktivbetrieb Anwalt einschalten  
**Nächster Schritt:** Rechtsanwalt Datenschutz/IT-Recht prüfen lassen, dann `LEGAL_REVIEW_APPROVED=true`

---

## 7. Datenschutz ✅

- [x] Keine echten Patientendaten im Repository
- [x] Opt-in-basierter Kontakt (kein automatischer Massenversand)
- [x] Keine SMS/WhatsApp ohne explizite Aktivierung
- [x] Supabase EU-Region (iad1 – USA; **Hinweis: auf EU-Region umstellen empfohlen**)
- [x] Keine externen Tracker im Frontend
- [x] Keine Fake-Testimonials, keine erfundenen Zertifikate

**Risiko:** Mittel – Supabase-Region und Hosting-Details für DSGVO prüfen  
**Nächster Schritt:** Hosting-Kette für Datenschutzerklärung dokumentieren

---

## 8. Dokumentation ✅

- [x] `docs/BUYER_HANDOVER.md` – vollständige Käufer-Übergabe
- [x] `docs/SALE_READINESS_CHECKLIST.md` – dieses Dokument
- [x] `README.md` – technische Basis
- [x] `.env.local.example` – alle Variables dokumentiert
- [x] `env-documentation.md` – ENV-Variablen mit Beschreibung
- [x] Migrations-Skripte vorhanden

---

## 9. Deployment ✅

- [x] Vercel kostenfrei einsatzbereit (Hobby-Plan)
- [x] Automatisches Deployment bei GitHub-Push auf `main`
- [x] Cron-Jobs konfiguriert (Trial-Reminder, Maintenance)
- [x] `vercel.json` ohne Domain-Abhängigkeiten
- [x] `NEXT_PUBLIC_APP_URL` env-getrieben

**Nächster Schritt:** `NEXT_PUBLIC_APP_URL=https://slotfill-pi.vercel.app` in Vercel setzen

---

## 10. Demo-Fähigkeit ✅

- [x] Live-URL: **https://slotfill-pi.vercel.app**
- [x] Öffentliche Seiten funktionieren ohne Auth
- [x] Admin-Bereich mit eigenem Login erreichbar
- [x] Buchungsformular öffentlich testbar

**Nächster Schritt für Demo:** Demo-Praxis anlegen, Demo-Admin-Account erstellen

---

## 11. Käufer-Übergabe ✅

- [x] `docs/BUYER_HANDOVER.md` vorhanden
- [x] White-Label-Anleitung dokumentiert
- [x] ENV-Variablen vollständig dokumentiert
- [x] Migrations-Skripte vorhanden
- [x] Bekannte Einschränkungen dokumentiert

---

## Offene Risiken

| Risiko | Priorität | Maßnahme |
|---|---|---|
| Resend-Domain nicht verifiziert | Mittel | Resend-Account + Domain einrichten |
| Rechtstexte im Entwurf-Modus | Mittel | Anwalt prüfen, `LEGAL_REVIEW_APPROVED=true` |
| Supabase-Region USA (kein EU) | Mittel | EU-Region bei Neueinrichtung wählen |
| Stripe nicht konfiguriert | Hoch | Stripe-Produkte anlegen |
| Kein Demo-Admin-Account | Niedrig | Test-Praxis und Admin-Account anlegen |

---

## 5 wichtigste Schritte vor dem Verkauf

1. **Stripe konfigurieren** – Produkte und Preise anlegen; ohne Stripe keine kostenpflichtigen Abos
2. **Resend-Domain verifizieren** – E-Mail-Versand mit eigenem Absender ermöglichen
3. **Demo-Umgebung einrichten** – Test-Praxis, Test-Patient, Demo-Buchung für Käufer-Präsentation
4. **Rechtstexte prüfen** – Anwalt Datenschutz/IT-Recht, dann Draft-Modus deaktivieren
5. **Verkaufsseite vorbereiten** – kurzes Pitch-Video (Screencast), Screenshots, Listing auf Flippa/MicroAcquire

---

## Verkaufspreis-Einschätzung (grob)

| Faktor | Bewertung |
|---|---|
| Codequalität | Hoch – TypeScript, Tests, sauber strukturiert |
| Funktionsumfang | Mittel-Hoch – Buchung, Warteliste, E-Mail, Stripe, i18n |
| Marktpotenzial | Mittel – Nische DE-Arztpraxen, globalisierbar |
| Betriebskosten | Niedrig – Vercel kostenlos, Supabase kostenlos |
| Wartungsaufwand | Niedrig-Mittel – stabile Dependencies |
| Richtwert | **2.000–8.000 € einmaliger Verkaufserlös** (ohne laufende Kundenbasis) |

---

*Stand: Feature-Branch `feature/finalize-praxisflow-branding` · PraxisFlow White-Label SaaS · Technischer Projektname: slotfill*
