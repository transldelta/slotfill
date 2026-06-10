# ClinicSlotHub – SideProjectors Listing (Entwurf)

**Zweck:** Fertiger Listing-Text für SideProjectors.com  
**Status:** Entwurf – vor Veröffentlichung nochmals prüfen  
**Erstellt:** 2026-06-10

---

## LISTING-TEXT (kopierfertig)

---

### Titel

**ClinicSlotHub – Appointment Request & Waitlist SaaS for Clinics (Live MVP, Multi-Language)**

---

### Kurzbeschreibung (tagline / subtitle)

> A live, white-label-ready SaaS for clinics and medical offices to manage online appointment requests and patient waitlists – built with Next.js 14, Supabase, and Resend. 10 languages. No paying customers yet. Full admin. Full email system. Ready to grow or sell.

---

### Ausführliche Beschreibung

**What is ClinicSlotHub?**

ClinicSlotHub is a fully deployed SaaS application that helps medical offices, clinics, and healthcare providers manage:

- **Online appointment requests** – patients submit requests with preferred time, reason, and consent; the clinic confirms or declines manually
- **Patient waitlists** – manage waiting patients and notify them when a slot opens up
- **Booking administration** – a clean admin interface for accepting, declining, and annotating booking requests

**What's working right now:**

✅ Live at clinicslothub.com  
✅ Appointment request form (with email notifications to admin + patient)  
✅ Contact form (with admin + confirmation emails)  
✅ Admin panel: confirm/decline bookings, add notes, view lead stats  
✅ 5 email flows via Resend – all live-tested  
✅ Real lead tracking: test data separated from real leads (is_test column)  
✅ 8 SEO blog articles (German + English)  
✅ 10 languages (DE, EN, FR, ES, PT, ZH, HI, AR, BN, RU) – all locales live  
✅ Sitemap, robots.txt, canonical URLs, hreflang – SEO-complete  
✅ Impressum, Datenschutz, AGB, AVV – legal pages present  
✅ 347 automated tests passing  

**Honest status:**

- No paying customers yet (launched for organic soft launch)
- No real patient data stored (test data only, properly separated)
- Stripe infrastructure implemented but not activated (no Secret Key set)
- Legal texts are qualified SaaS templates – recommend legal review before onboarding paying clients
- Email sender currently onboarding@resend.dev – custom domain setup is the next step

**Tech stack:**

- Next.js 14 App Router + TypeScript (strict)
- Supabase (PostgreSQL, Auth, Row-Level Security)
- Resend (transactional email)
- Vercel (deployment, serverless)
- Tailwind CSS + shadcn/ui components
- next-intl (10 locales)
- Stripe SDK (integrated, not activated)
- Twilio SDK (integrated, not activated)

**Monthly running costs: ~€0**  
(Vercel Free + Supabase Free + Resend Free – 100 emails/day)

---

### Tech-Stack (kurze Version für Listing-Felder)

Next.js 14 · TypeScript · Supabase · Resend · Vercel · Tailwind CSS · next-intl · Stripe (not activated) · Twilio (not activated)

---

### Was ist enthalten (Assets)

- Vollständiger Quellcode (GitHub Repository, öffentlich: github.com/transldelta/slotfill)
- Live Domain: clinicslothub.com (Übertragung nach Vereinbarung)
- Vollständiges Admin-Interface
- E-Mail-System mit 5 Live-Flows
- 8 SEO-Blogartikel
- 10 Sprachen vollständig übersetzt
- Supabase-Datenbank-Schema + Migrations
- Vollständige technische Dokumentation (docs/)
- GO_LIVE_SAFETY_AUDIT.md, REAL_LEAD_OPERATIONS.md, ORGANIC_LAUNCH_CHECKLIST.md u.a.
- Stripe + Twilio als Drop-in (nur Credentials nötig)

---

### Ehrlicher Status

| Merkmal | Status |
|---------|--------|
| Live und erreichbar | ✅ clinicslothub.com |
| Zahlende Kunden | ❌ Noch keine |
| Monatlicher Umsatz (MRR) | ❌ 0 € |
| E-Mail-System getestet | ✅ Alle 5 Flows live bestätigt |
| Stripe aktiviert | ❌ Infrastruktur vorhanden, Key nicht gesetzt |
| Rechtliche Texte anwaltlich geprüft | ❌ Qualifizierte Muster, rechtliche Prüfung ausstehend |
| SEO eingereicht | ✅ Google Search Console + Bing |
| Tests | ✅ 347/347 grün |

---

### Mögliche Käufer-Zielgruppe

1. **Entwickler / Indie Hacker** – möchten ein fertiges SaaS-Fundament kaufen und nicht von null beginnen
2. **Healthcare-Agenturen** – suchen ein White-Label-Produkt für Klinik-Kunden
3. **Praxis-Software-Anbieter** – möchten einen Terminbuchungs-Baustein integrieren
4. **SaaS-Käufer auf Micro-Acquire / Flippa** – suchen ein Multi-Language-SaaS mit sauberem Code

---

### Monetarisierungsidee

Das Produkt ist für **SaaS-Subscription** ausgelegt:

- Starter: ~29 €/Monat (Infrastruktur vorhanden)
- Professional: ~79 €/Monat
- Praxis Plus: ~149 €/Monat

Stripe-Checkout-Infrastruktur ist vollständig implementiert – nur Credentials müssen gesetzt werden.

Alternativ: **White-Label-Lizenz** an Praxis-Software-Anbieter oder Agenturen.

---

### Preisstrategie (Diskussionsbasis)

Kein garantierter Verkaufspreis. Orientierung an:

- **Entwicklungsaufwand** – mehrere Monate professionelle Next.js/Supabase-Entwicklung
- **Vergleichswerte** – ähnliche Live-MVPs auf SideProjectors / MicroAcquire ohne Umsatz: typisch €500–€5.000
- **Wertkomponenten**: Domain clinicslothub.com, 10 Locales, E-Mail-System, Admin, SEO, 8 Blog-Artikel, Docs

> **Hinweis:** Kein Umsatz, keine zahlenden Kunden. Preis spiegelt Entwicklungsarbeit und technische Fertigstellung wider, nicht Umsatzmultiple.

---

### Sicherheits- und Ehrlichkeits-Hinweise für Käufer

1. **Keine echten Patientendaten** vorhanden – alle bisherigen Einträge sind Testdaten (`is_test=true`)
2. **Keine automatische Kaltakquise** – das Produkt ist inbound-only
3. **Rechtliche Texte** sind SaaS-Muster – vor Produktiveinsatz anwaltlich prüfen lassen
4. **Stripe** funktioniert sobald STRIPE_SECRET_KEY und Price IDs gesetzt sind – keine weitere Entwicklung nötig
5. **E-Mail-Absender** sollte auf verifizierte Domain umgestellt werden (`no-reply@clinicslothub.com`)
6. **White-Label-Ready** – nur `BRAND_NAME` in `lib/brand.ts` ändern, alle Seiten und Mails folgen

---

*Dieses Listing ist ein Entwurf. Vor der Veröffentlichung bitte alle Angaben nochmals prüfen.*
