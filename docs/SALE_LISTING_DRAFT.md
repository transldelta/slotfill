# PraxisFlow – Verkaufslisting-Entwurf

> Dieser Text ist ein Entwurf für ein Verkaufsportal (z. B. Flippa, MicroAcquire/Acquire.com, Indie Hackers).  
> Keine Umsatzgarantien. Keine erfundenen Kundenzahlen. Ehrliche Darstellung als SaaS-Prototyp / MVP.

---

## Titel (Kurzform für Listing-Portale)

**PraxisFlow – White-Label SaaS für Terminmanagement in Arztpraxen | Vollständiger MVP | Next.js 14 + Supabase + Stripe**

---

## Kurzbeschreibung (für Listing-Übersicht)

Fertig entwickelter SaaS-Prototyp für die digitale Verwaltung von Patientenwartelisten und Terminbuchungen in Arzt- und Therapiepraxen. 10 Sprachen, Stripe-Abonnements, E-Mail-Automatisierung, Admin-Panel, vollständige Rechtstexte (DE). White-Label-fähig: Produktname in einer Datei änderbar. Keine laufenden Kunden, kein Umsatz – ehrlicher MVP.

---

## Ausführliche Beschreibung

### Was ist PraxisFlow?

PraxisFlow ist ein vollständig entwickelter SaaS-Prototyp für die digitale Terminverwaltung in Arzt- und Therapiepraxen. Das System löst ein konkretes Problem: Fällt ein Termin kurzfristig aus, haben Praxen oft keine einfache Möglichkeit, einen passenden Patienten von der Warteliste zu benachrichtigen. PraxisFlow schließt diese Lücke.

Patienten können sich über ein öffentliches Buchungsformular für einen Termin bewerben. Die Praxis kann Anfragen manuell bestätigen oder automatische Bestätigung aktivieren (wenn ein freier Slot verfügbar ist). Die gesamte Kommunikation läuft über E-Mail (Resend), optional auch per SMS/WhatsApp (Twilio).

### Was ist enthalten?

Das Produkt ist ein fertig entwickelter, deploymentbereiter Codebase auf GitHub. Es ist kein laufendes Unternehmen mit Kunden oder Umsatz – sondern ein technisch vollständiger Prototyp (MVP), der sofort von einem Käufer weiterentwickelt und vermarktet werden kann.

---

## Zielgruppe des Produkts (nach Kauf)

- Einzelentwickler oder Agenturen, die ein fertiges Nischen-SaaS kaufen und vermarkten wollen
- Digitale Gesundheitsdienstleister, die ein eigenes Produkt für den DE-Markt suchen
- White-Label-Käufer, die das Produkt unter eigenem Namen betreiben wollen
- Investoren in Nischen-SaaS für Healthcare Digitalisierung (DACH-Markt)

**Endkunden des Produkts (nach Kauf und Vermarktung):**
- Arztpraxen (Allgemeinmedizin, Fachärzte)
- Therapiepraxen (Physiotherapie, Psychotherapie)
- Zahnarztpraxen
- MVZ (Medizinische Versorgungszentren)
- Kliniken mit Ambulanzen

---

## Hauptfunktionen

| Funktion | Status |
|---|---|
| Öffentliches Online-Buchungsformular | ✅ Produktiv |
| Automatische Terminbestätigung (Auto-Confirm) | ✅ Produktiv |
| Manuelle Bestätigung/Ablehnung im Admin | ✅ Produktiv |
| Wartelisten-Verwaltung | ✅ Produktiv |
| E-Mail-Benachrichtigungen (Resend) | ✅ Vorbereitet |
| Admin-Dashboard (Statistiken, Praxen, Fehler) | ✅ Produktiv |
| Booking-Settings (Öffnungszeiten, Auto-Confirm) | ✅ Produktiv |
| Stripe-Abonnements (3 Pläne) | ✅ Integriert |
| 14-Tage-Testphase (Trial) | ✅ Integriert |
| SMS/WhatsApp via Twilio | ✅ Optional (Dry-Run-Modus) |
| Blog (3 statische Artikel) | ✅ Produktiv |
| Mehrsprachigkeit (10 Sprachen) | ✅ Produktiv |
| Feedback-Modul (Bewertungen) | ✅ Produktiv |
| Rechtstexte DE (Impressum/Datenschutz/AGB/AVV) | ✅ Vorbereitet |
| Go-Live-Readiness-Agent im Admin | ✅ Produktiv |
| White-Label: Name/Logo/Domain in 1 Datei änderbar | ✅ Implementiert |
| SEO-Grundstruktur (Schema.org, Sitemap, Robots) | ✅ Produktiv |
| Dark Mode | ✅ Produktiv |

---

## Tech Stack

| Technologie | Details |
|---|---|
| Framework | Next.js 14, App Router, TypeScript |
| Styling | Tailwind CSS |
| Datenbank | Supabase (PostgreSQL, Row Level Security) |
| Auth | Supabase Auth |
| E-Mail | Resend |
| Zahlung | Stripe (Subscriptions + Webhooks) |
| Messaging (optional) | Twilio (SMS / WhatsApp) |
| Deployment | Vercel (Hobby-Plan reicht für Start) |
| i18n | next-intl (10 Locales: DE, EN, FR, ES, AR, PT, RU, ZH, HI, BN) |
| Tests | Node.js native test runner (347 Tests) |
| CI/CD | GitHub + Vercel Auto-Deploy |

---

## Was ist im Verkauf enthalten?

- ✅ Vollständiger Quellcode (GitHub-Repository: `slotfill`)
- ✅ Alle Datenbankmigrationen (Supabase SQL)
- ✅ Vollständige `.env`-Dokumentation
- ✅ Käufer-Übergabe-Dokumentation (`docs/BUYER_HANDOVER.md`)
- ✅ Sale-Readiness-Checkliste (`docs/SALE_READINESS_CHECKLIST.md`)
- ✅ 347 automatisierte Tests
- ✅ White-Label-Konfiguration (`lib/brand.ts`)
- ✅ Vorbereitete Rechtstexte (DE) als Muster
- ✅ Live-Demo unter `https://slotfill-pi.vercel.app`
- ✅ Admin-Panel mit Go-Live-Readiness-Agent

**Nicht enthalten:**
- ❌ Laufende Kunden oder Umsatz
- ❌ Stripe-Account (wird separat eingerichtet)
- ❌ Resend-Account oder verifizierte Domain
- ❌ Supabase-Datenbankinstanz (wird neu eingerichtet)
- ❌ Vercel-Account (wird neu eingerichtet)
- ❌ Rechtlich geprüfte Rechtstexte (Käufer muss Anwalt einschalten)

---

## Was noch offen ist (ehrlich)

| Punkt | Details |
|---|---|
| Rechtstexte | Vorbereitet als Muster – Anwalt erforderlich vor Produktivbetrieb |
| Resend-Domain | Käufer muss eigene Domain verifizieren |
| Stripe-Produkte | Käufer muss Pläne und Preise anlegen |
| Demo-/Testdaten | Vor Übergabe aus DB löschen oder neue DB aufsetzen |
| Supabase-Region | EU-Region (Frankfurt) für DSGVO empfohlen |
| Echte Kundenbasis | Nicht vorhanden – MVP ohne Kunden |

---

## Ehrliche Einschränkungen

- **Kein laufendes Unternehmen:** Dies ist ein technischer Prototyp / MVP ohne Kundenbasis und ohne Umsatz.
- **Keine Umsatzgarantie:** Weder Umsatz noch Wachstum werden versprochen.
- **Kein Alleinstellungsmerkmal gegenüber DoctoLib etc.:** Positionierung als kostengünstiges White-Label-Tool für kleinere Praxen.
- **Rechtstexte sind Muster:** Vor dem Betrieb mit echten Patienten ist ein Anwalt nötig.
- **DSGVO-Hosting:** Supabase und Vercel haben primär US-Rechenzentren – EU-Region einrichtbar, aber nicht automatisch aktiv.
- **Kein Vertrieb inklusive:** Der Käufer muss selbst Kunden gewinnen.

---

## Warum hat dieses Projekt Wert?

1. **Fertig entwickelt, sofort deploybar:** Kein Aufbau von Null. Kompletter Next.js-Stack mit Auth, DB, Stripe, E-Mail, i18n.
2. **Nische mit klarem Bedarf:** Praxen leiden unter Terminausfällen. Eine einfache SaaS-Lösung für diesen Pain Point hat nachweislich Nachfrage.
3. **White-Label in einer Datei:** Käufer kann eigene Marke in Minuten setzen – keine Codeänderungen auf hundert Dateien.
4. **10 Sprachen von Beginn:** Globale Vermarktung ohne Mehraufwand möglich.
5. **Verkaufsfähige Struktur:** Stripe-Integration, Testphase, Admin-Panel und Dokumentation sind bereits vorhanden.
6. **Niedrige Betriebskosten:** Vercel kostenlos, Supabase kostenlos, Resend kostenlos – Gesamtkosten für MVP-Betrieb nahe Null.
7. **347 Tests:** Qualitätsbewusstsein zeigt sich im Code; geringer Wartungsaufwand.

---

## Mögliche nächste Ausbaustufen

1. **Kalenderintegration:** Google Calendar / Outlook-Sync
2. **Patienten-App / PWA:** Mobile Buchungserfahrung
3. **Erweiterte Analytik:** No-Show-Tracking, Auslastungsstatistiken
4. **Multi-Praxis-Mandanten:** Mehrere Praxen unter einem Konto
5. **KI-Wartelisten-Priorisierung:** Automatische Ranking-Vorschläge
6. **Marktplatz-Listing:** Integration in Ärzteportale
7. **Videosprechstunde-Link:** Integration mit Zoom/Teams

---

## Preiseinschätzung (grob, keine Garantie)

| Faktor | Bewertung |
|---|---|
| Technische Umsetzungsqualität | Hoch |
| Funktionsumfang für MVP | Mittel-Hoch |
| Marktpotenzial | Mittel (Nische DE, globalisierbar) |
| Betriebskosten | Sehr niedrig |
| Aktuelle Kundenbasis | Keine |
| Ungefährer Marktwert | **2.000–8.000 € einmalig** (ohne laufende Kunden) |

> Preisangabe ist eine grobe Orientierung, keine Garantie. Tatsächlicher Verkaufserlös hängt von Verhandlung, Plattform und Käufer ab.

---

## Kontakt für Kaufinteresse

**Betreiber:** Brahim Ben Abla  
**E-Mail:** transl.delta@gmail.com  
**Live-Demo:** https://slotfill-pi.vercel.app

---

*Erstellt mit Claude Code · PraxisFlow White-Label SaaS Prototyp*
