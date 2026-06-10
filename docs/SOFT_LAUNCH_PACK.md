# ClinicSlotHub – Soft Launch Pack

**Stand:** 2026-06-10  
**Zweck:** Ehrliche, vollständige Produktbeschreibung für Soft Launch, Listings und erste Gespräche.

---

## Was ist ClinicSlotHub?

ClinicSlotHub ist ein webbasiertes SaaS-Tool für Arztpraxen, Therapiepraxen, Kliniken und Healthcare Provider, das dabei hilft:

- **Terminanfragen online entgegenzunehmen** – Patienten stellen Anfragen, die Praxis bestätigt manuell
- **Wartelisten zu verwalten** – Patienten auf einer digitalen Warteliste pflegen
- **Terminlücken zu füllen** – bei Ausfällen werden passende Patienten aus der Warteliste benachrichtigt
- **Buchungsanfragen zu verarbeiten** – Admin-Interface für Bestätigung, Ablehnung, interne Notizen

---

## Für wen ist es?

- Arztpraxen und Therapiepraxen (Einzel- und Gruppenpraxen)
- Kleinere Kliniken und Healthcare-Teams
- Healthcare-Anbieter, die Online-Anfragen strukturiert verwalten möchten
- Entwickler oder Agenturen, die ein White-Label-SaaS kaufen und weiterentwickeln möchten

---

## Was funktioniert bereits (live, getestet)

| Feature | Status |
|---------|--------|
| Öffentliche Landing Page (10 Sprachen) | ✅ Live |
| Online-Terminanfrage-Formular | ✅ Live + E-Mail-Benachrichtigung |
| Kontaktformular | ✅ Live + Admin- und Kunden-E-Mail |
| Admin-Interface: Buchungsanfragen bestätigen/ablehnen | ✅ Live |
| Admin-Interface: Kontaktnachrichten verwalten | ✅ Live |
| E-Mail-System (Resend): 5 Flows | ✅ Live, alle getestet |
| Lead-Trennung: Testdaten vs. echte Leads | ✅ via is_test=true |
| SEO-Grundlage: Canonical, hreflang, Sitemap, robots.txt | ✅ Vollständig |
| Blog: 8 SEO-Artikel (Deutsch + Englisch) | ✅ Live |
| Rechtliche Seiten: Impressum, Datenschutz, AGB, AVV | ✅ Vorhanden |
| Mehrsprachig: 10 Locales (DE, EN, FR, ES, PT, ZH, HI, AR, BN, RU) | ✅ |
| Wartelisten-System (Praxis-Dashboard) | ✅ Code vorhanden, Demo-Modus |
| SMS/WhatsApp (Twilio) | ⚙️ Konfigurierbar, aber nicht aktiviert |
| Stripe-Zahlungen | ⚙️ Infrastruktur vorhanden, nicht aktiviert |

---

## Aktueller Status (ehrlich)

**Live-MVP / Soft-Launch-ready.**

- **Kein zahlender Kunde** bisher – das Produkt ist neu auf dem Markt
- **Keine echten Patientendaten** gespeichert – nur Testdaten mit `is_test=true`
- **Stripe nicht aktiv** – Zahlungs-Infrastruktur ist implementiert, aber STRIPE_SECRET_KEY nicht gesetzt
- **Rechtliche Texte** liegen als qualifizierte SaaS-Muster vor, noch nicht anwaltlich final geprüft
- **E-Mail-Absender** aktuell `onboarding@resend.dev` (Resend-Standard) – funktional für Soft Launch

---

## Warum trotzdem soft-launch-ready?

1. **Voll funktionsfähiger Lead-Capture-Prozess** – Interessenten können Kontakt aufnehmen und Anfragen stellen, alle Mails kommen an
2. **Admin-System vollständig** – erste echte Leads können sofort bearbeitet werden
3. **Professionelle Außenwirkung** – clinicslothub.com, saubere SEO, ClinicSlotHub-Branding überall
4. **Keine offenen Fehler** – lint ✅, build ✅ 237 Seiten, tests ✅ 347/347
5. **E-Mail-System live getestet** – alle 5 Flows funktionieren mit echten Empfängern
6. **Internationalisierung vollständig** – 10 Locales, bereit für internationale Interessenten
7. **Dokumentation vollständig** – GO_LIVE_SAFETY_AUDIT.md, REAL_LEAD_OPERATIONS.md, technische Doku

---

## Kostenstatus

| Dienst | Plan | Kosten |
|--------|------|--------|
| Domain clinicslothub.com | — | einmalig/jährlich |
| Vercel | Free Tier | 0 €/Monat |
| Supabase | Free Tier | 0 €/Monat |
| Resend | Free Tier (100 E-Mails/Tag) | 0 €/Monat |
| Twilio (SMS/WhatsApp) | Nicht aktiviert | 0 €/Monat |
| Stripe | Nicht aktiviert | 0 €/Monat |
| **Gesamt laufend** | | **~0 €/Monat** |

---

## Was noch offen ist (vor erstem zahlenden Kunden)

1. Rechtliche Texte anwaltlich prüfen und freigeben lassen
2. Stripe aktivieren (STRIPE_SECRET_KEY + Price IDs konfigurieren)
3. Verifizierte E-Mail-Domain einrichten (`no-reply@clinicslothub.com`)
4. LEGAL_REVIEW_APPROVED=true in Vercel setzen (entfernt Draft-Banner)

---

## Was dieses Produkt nicht ist

- **Kein medizinisches Beratungstool** – keine Diagnosen, keine Behandlungsempfehlungen
- **Kein automatisches Kaltakquise-System** – alle Kommunikation ist Inbound oder manuell ausgelöst
- **Keine WhatsApp-/SMS-Massenversendung** – Messaging ist opt-in und erfordert explizite Konfiguration
- **Kein Datenschutz-Versprechen ohne rechtliche Prüfung** – DSGVO-bewusster Prozess, aber kein Rechtsgutachten

---

*Dieses Dokument ersetzt keine Rechtsberatung. Es dokumentiert ehrlich den Stand des Produkts.*
