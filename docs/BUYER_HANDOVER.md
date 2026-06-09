# PraxisFlow – Käufer-Übergabe-Dokumentation

> **White-Label-fähiges SaaS für Termin- und Wartelistenverwaltung in Arzt- und Facharztpraxen.**  
> Produktname, Logo und Domain können nach Kauf in wenigen Minuten geändert werden.

---

## Was ist PraxisFlow?

PraxisFlow ist ein vollständiges B2B-SaaS-Produkt für die digitale Verwaltung von Patientenwartelisten und Terminbuchungen. Es hilft Arzt- und Facharztpraxen, kurzfristige Terminlücken effizient zu füllen: Fällt ein Termin aus, bereitet das System passende Patienten aus der Warteliste vor. Die Praxis entscheidet selbst, wer kontaktiert wird – ohne automatischen Massenversand.

**Zielgruppe:** Einzelpraxen, Gemeinschaftspraxen, MVZ, Zahnarztpraxen, Therapiepraxen, Fachpraxen (DE-Markt, multilingual erweiterbar).

---

## Hauptfunktionen

| Funktion | Status |
|---|---|
| Wartelisten-Verwaltung | ✅ Produktiv |
| Online-Terminbuchung (Buchungsformular) | ✅ Produktiv |
| Automatische Terminbestätigung | ✅ Produktiv |
| E-Mail-Benachrichtigungen (Resend) | ✅ Produktiv |
| Admin-Dashboard | ✅ Produktiv |
| Feedback-Modul (Bewertungen) | ✅ Produktiv |
| Mehrsprachigkeit (10 Sprachen) | ✅ Produktiv |
| Stripe-Abonnements (3 Pläne) | ✅ Integriert |
| SMS/WhatsApp via Twilio | ✅ Optional (Dry-Run-Modus) |
| Blog (3 statische Artikel) | ✅ Produktiv |
| Go-Live-Readiness-Agent | ✅ Admin-Tool |
| Datenschutz/AGB/AVV/Impressum (DE) | ✅ Vollständig |

---

## Tech Stack

| Technologie | Version/Details |
|---|---|
| Framework | Next.js 14, App Router |
| Sprache | TypeScript |
| Styling | Tailwind CSS |
| Datenbank | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| E-Mail | Resend |
| Zahlung | Stripe |
| Deployment | Vercel (kostenloses Tier reicht für Start) |
| Messaging (optional) | Twilio SMS/WhatsApp |
| i18n | next-intl (10 Locales) |
| Tests | Node.js native test runner (347 Tests) |

---

## Live-URL

```
https://slotfill-pi.vercel.app
```

> Kostenlos über Vercel Hobby-Plan. Keine Domain-Kosten nötig für den Start.

---

## Technischer Projektname

| Bereich | Name |
|---|---|
| Öffentlicher Produktname | **PraxisFlow** |
| GitHub-Repository | `slotfill` (technischer Ursprungsname) |
| Vercel-Projektname | `slotfill` |
| Lokaler Ordnername | `slotfill/` |
| Live-URL (aktuell) | `https://slotfill-pi.vercel.app` |

> **Hinweis für Käufer:** Der technische Projektname im GitHub-Repository, im Vercel-Dashboard und als Ordnername lautet `slotfill`. Das ist der ursprüngliche technische Name und hat keinen Einfluss auf den öffentlichen Produktnamen. Der öffentliche Markenname `PraxisFlow` kann nach Kauf jederzeit in eine neue Marke umbenannt werden (nur `lib/brand.ts` ändern). Das Projekt kann mit einer eigenen Domain verbunden werden, indem `NEXT_PUBLIC_APP_URL` in den Vercel-Einstellungen gesetzt wird.

---

## Admin-Bereich

| Route | Funktion |
|---|---|
| `/admin` | Übersicht, Go-Live-Status |
| `/admin/go-live` | Schritt-für-Schritt Readiness-Checkliste |
| `/admin/booking-settings` | Praxis-Buchungszeiten konfigurieren |
| `/admin/booking-requests` | Eingehende Buchungsanfragen |
| `/admin/feedback` | Patientenfeedback |
| `/admin/messaging-setup` | Twilio-Konfiguration und Test |
| `/admin/email-setup` | Resend-E-Mail-Prüfung |
| `/admin/communication` | Kommunikationsstatus |

---

## Terminbuchung

- Öffentliche Buchungsseite: `/[locale]/termin-buchen`
- Buchungsformular: Name, E-Mail, Telefon, gewünschte Zeit, Nachricht
- Automatische Bestätigung: konfigurierbar über `booking_availability_rules`
- Buchungs-Blockzeiten: `booking_blocked_times`

---

## Warteliste

- Patientenprofile mit Kontaktdaten und Einwilligung
- Filterung nach Diagnose/Kategorie (erweiterbar)
- Standard: manueller Versand (kein automatischer Massenversand)
- Opt-in-basiert: Kontakt nur mit expliziter Einwilligung

---

## E-Mail-System

**Provider:** Resend (resend.com)

| Variable | Beschreibung |
|---|---|
| `RESEND_API_KEY` | Resend API Key |
| `RESEND_FROM_EMAIL` | Absender, z. B. `PraxisFlow <noreply@yourdomain.com>` |
| `SUPPORT_EMAIL` | Fallback: Betreiber-E-Mail für Support-Antworten |
| `CONTACT_EMAIL` | Empfänger für Kontaktformular-Eingänge |

E-Mail-Templates: `lib/email/templates.ts`
- Eingangsbestätigung (Kontakt)
- Trial-Willkommen
- Test-Praxis-Aktivierung
- Passwort-Reset

---

## Supabase-Datenbank

**Tabellen (wichtigste):**

| Tabelle | Funktion |
|---|---|
| `practices` | Praxis-Profile inkl. Buchungseinstellungen |
| `patients` | Patienten mit Wartelisten-Einträgen |
| `appointments` | Terminverwaltung |
| `booking_requests` | Eingehende Online-Buchungsanfragen |
| `booking_availability_rules` | Öffnungszeiten-Regeln |
| `booking_blocked_times` | Sperrzeiten |
| `feedback_submissions` | Patientenfeedback |
| `subscriptions` | Stripe-Abonnements |
| `contact_messages` | Kontaktformular-Fallback (kein E-Mail-Versand) |

**Migrations-Skripte:** `supabase/migrations/`

---

## Vercel Deployment

1. Repository in GitHub forken
2. Neues Vercel-Projekt aus GitHub-Repository erstellen
3. Environment Variables setzen (s. u.)
4. `main`-Branch wird automatisch deployed

---

## Environment Variables

```env
# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# App-URL (Vercel-Domain oder Custom Domain)
NEXT_PUBLIC_APP_URL=https://slotfill-pi.vercel.app

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PROFESSIONAL=price_...
STRIPE_PRICE_PRAXIS_PLUS=price_...

# E-Mail (Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=PraxisFlow <noreply@yourdomain.com>
SUPPORT_EMAIL=support@yourdomain.com
CONTACT_EMAIL=contact@yourdomain.com

# Admin-Zugänge (kommagetrennt)
ADMIN_EMAILS=your@email.com

# Messaging (optional)
MESSAGING_PROVIDER=none  # oder: twilio_sms, twilio_whatsapp
MESSAGING_DRY_RUN=true
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_SMS_FROM=+49...
TWILIO_WHATSAPP_FROM=+14155238886
TWILIO_WHATSAPP_CONTENT_SID=...

# Cron
CRON_SECRET=...

# Go-Live
LEGAL_REVIEW_APPROVED=true
```

---

## Resend Setup

1. Konto bei [resend.com](https://resend.com) anlegen (kostenloser Plan reicht für Start)
2. Domain verifizieren (DNS-Einträge setzen)
3. API-Key erstellen → `RESEND_API_KEY`
4. Absender-Domain eintragen → `RESEND_FROM_EMAIL`

---

## Optionale Twilio-Erweiterung

- SMS: `MESSAGING_PROVIDER=twilio_sms`
- WhatsApp: `MESSAGING_PROVIDER=twilio_whatsapp` + WhatsApp-Business-Account
- Im Dry-Run-Modus: Nachrichten werden vorbereitet, aber nicht versendet
- Ohne Twilio funktioniert alles außer SMS/WhatsApp

---

## Bekannte Einschränkungen

| Punkt | Details |
|---|---|
| E-Mail-Versand | Benötigt verifizierten Resend-Account + Domain |
| Stripe | Benötigt Stripe-Konto für Zahlungsabwicklung |
| SMS/WhatsApp | Optional – ohne Twilio weiterhin funktionsfähig |
| Mehrsprachigkeit | 10 Sprachen im Kern; weitere Locales einfach hinzufügbar |
| Testphase aktuell | 14-tägige kostenlose Testphase (Stripe-Produkte konfigurieren) |

---

## Nächste Ausbaustufen

1. **Kalenderintegration:** Google Calendar / Outlook-Sync
2. **Patienten-App:** Mobile-App oder Progressive Web App
3. **Erweiterte Analytik:** Auslastungsstatistiken, No-Show-Tracking
4. **Multi-Praxis-Mandanten:** Mehrere Praxen unter einem Account
5. **KI-gestützte Empfehlungen:** Wartelisten-Priorität nach Kriterien
6. **Marktplatz-Listing:** Eintrag in DoctoLib-ähnliche Verzeichnisse

---

## Käufer-Übergabe-Checkliste

### Technisch
- [ ] GitHub-Repository auf eigenen Account übertragen (Fork/Transfer)
- [ ] Vercel-Projekt neu verbinden mit eigenem GitHub-Account
- [ ] Neues Supabase-Projekt erstellen, Migrations ausführen
- [ ] Environment Variables in Vercel setzen
- [ ] Eigene Resend-Domain verifizieren
- [ ] Stripe-Produkte und Preise erstellen

### Branding (White-Label)
- [ ] `lib/brand.ts`: `BRAND_NAME` auf neuen Produktnamen ändern
- [ ] `lib/brand.ts`: `BRAND_TEAM_NAME` anpassen
- [ ] Impressum: Betreiberdaten in `components/legal/ImpressumContent.tsx` aktualisieren
- [ ] Domain konfigurieren (`NEXT_PUBLIC_APP_URL` setzen)
- [ ] Ggf. `app/icon.svg` und `public/brand/` Logos anpassen

### Legal
- [ ] Impressum mit eigenen Betreiberdaten aktualisieren
- [ ] Datenschutzerklärung von einem Anwalt prüfen lassen
- [ ] AGB anpassen (Preise, Laufzeiten, Zahlungsbedingungen)
- [ ] AVV (Auftragsverarbeitungsvertrag) mit Kunden abschließen

### Go-Live
- [ ] `/admin/go-live` Checkliste in Admin durcharbeiten
- [ ] LEGAL_REVIEW_APPROVED=true setzen nach rechtlicher Prüfung
- [ ] Test-Buchung und Test-E-Mail durchführen
- [ ] Stripe Test-Zahlung durchführen

---

## Wie Name, Logo und Domain geändert werden

### Produktname
```typescript
// lib/brand.ts – einzige Datei, die geändert werden muss:
export const BRAND_NAME = "IhrNeuerName" as const;
export const BRAND_TEAM_NAME = "IhrNeuerName Team" as const;
```
→ Alle Seiten, E-Mails, Metadaten und der Header übernehmen den neuen Namen automatisch.

### Logo (Icon)
```tsx
// components/ui/SlotFillLogo.tsx
// Das Logo-Icon ist reines inline SVG – keine externe Datei nötig.
// Farben und Form direkt im SVG-Code anpassen oder durch eigenes SVG ersetzen.
```

### Domain
```env
# Vercel Environment Variables:
NEXT_PUBLIC_APP_URL=https://www.ihredomain.de
```
→ Canonical-URLs, Sitemap, Robots.txt und E-Mail-Links passen sich automatisch an.

---

*Erstellt mit Claude Code · White-Label-Paket*
