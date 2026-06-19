# ClinicSlotHub — Visibility & SEO Foundation

Interne Grundlage für organische Auffindbarkeit. **Kein** Keyword-Spam, **keine**
Fake-/Compliance-Versprechen, **keine** Zielmarktwerbung für hochregulierte Märkte
(EU/DE/USA/Kanada/UK/Australien/Neuseeland). ClinicSlotHub bleibt für **ausgewählte
internationale Märkte**; Aktivierung nach Markt-/Rechtsprüfung.

## Positionierung in einem Satz

ClinicSlotHub ist ein Healthcare-Booking-SaaS: Praxen, Kliniken und Gesundheitszentren
erhalten Terminanfragen online und verwalten/bestätigen sie manuell. **Patienten zahlen
nicht auf der Website.** Pakete ab 29 / 79 / 149 € / Monat (Orientierungspreise,
Aktivierung nach Prüfung).

## Technische SEO-Basis (Ist-Stand)

- `app/robots.ts`: erlaubt `/`, blockiert `/dashboard /admin /api /auth` (alle Locales),
  referenziert die Sitemap.
- `app/sitemap.ts`: alle aktiven Locales (de/en/fr/es/pt) × öffentliche Pfade
  (`/`, `/pricing`, `/blog`, `/kontakt`) + Blog-Artikel; robuster statischer Fallback.
- Canonical + hreflang: Startseite, Pricing-Layout, Kontakt — pro Locale.
- Title/Description: pro Locale (Start, Pricing, Kontakt, Blog).
- Legal-Seiten (Impressum/Datenschutz/AGB/AVV): `noindex, follow` (kein Boilerplate-Index).
- Schema.org JSON-LD auf der Startseite: SoftwareApplication + Organization (kein
  MedicalOrganization — ClinicSlotHub ist SaaS, keine Arztpraxis).

## Keyword-Cluster (neutral, international — kein Spam)

### DE
- Online-Terminbuchung für Praxen
- Terminbuchungssystem für Kliniken
- Terminanfragen online verwalten
- Praxis Terminverwaltung online
- Klinik Terminmanagement Software
- Patienten Termine online anfragen
- Healthcare Booking Software
- Praxissoftware Terminbuchung

### EN
- clinic appointment booking software
- healthcare appointment request system
- online booking for medical practices
- appointment management for clinics
- patient appointment request platform
- healthcare booking SaaS
- clinic scheduling software
- medical appointment booking system

### FR
- logiciel de prise de rendez-vous pour cabinets
- système de demande de rendez-vous pour cliniques
- réservation en ligne pour établissements de santé
- gestion des rendez-vous pour cliniques

### ES
- software de reserva de citas para consultas
- sistema de solicitud de citas para clínicas
- reserva en línea para centros de salud
- gestión de citas para clínicas

### PT
- software de marcação de consultas para consultórios
- sistema de pedidos de consulta para clínicas
- marcação online para centros de saúde
- gestão de consultas para clínicas

## Verboten (öffentlich)
- Aggressiv: „poor countries", „third world", „low-income clinics".
- Falsche Compliance: „GDPR-ready", „HIPAA-ready", „fully compliant",
  „garantiert rechtssicher", „medizinisch zertifiziert".
- Zielmarktwerbung „für Deutschland/EU/USA/…".
- Interne Technikbegriffe auf Marketing-/Pricing-/Kontaktseiten (Stripe, Twilio,
  Supabase, SMS, WhatsApp, Testmodus, API/Secret/Token).

## Nächste sichtbarkeitsfördernde Schritte (nur mit CEO-Freigabe)
- Google Search Console / Bing Webmaster Tools (Property-Verifizierung).
- Analytics (datenschutzkonform) — erst nach rechtlicher Freigabe.
- Inhaltliche Blog-Erweiterung entlang der Keyword-Cluster (organisch, ehrlich).
