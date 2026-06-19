# CLAUDE.md — Slotfill Projektregeln (dauerhaft)

Diese Datei wird bei jeder Sitzung automatisch geladen. Sie gilt für **alle** künftige
Arbeit an diesem Repository. Halte dich ohne Ausnahme daran.

> Ergänzend laufen automatische Hooks (`.claude/settings.json`) und Prüfskripte
> (`scripts/claude/`). Details: `docs/claude-code-saas-os.md`, `docs/release-gates.md`.

## 1. Projekt

- **Produktname (öffentlich):** Slotfill
- **Repository:** `transldelta/slotfill` · **Arbeitsverzeichnis:** `/Users/brahimbenabla/slotfill`
- **Domain:** clinicslothub.com (technische Alt-Domain – Markenwort bleibt „Slotfill")
- **Produktziel:** Healthcare-Booking-SaaS. Patient:innen fragen Termine online an;
  Praxen/Kliniken erhalten Anfragen und **bestätigen manuell**.
- **Zielmarkt:** nur **ausgewählte internationale Märkte**. NICHT aktiv ausgerichtet auf
  EU/EWR/Deutschland, USA, Kanada, UK, Australien, Neuseeland. Aktivierung erst nach
  Markt- und Rechtsprüfung.
- **Geschäftsmodell:** Praxen/Kliniken zahlen monatlichen SaaS-Zugang
  (Starter/Practice/Clinic). **Patient:innen zahlen nicht auf der Website.**
- **Architektur:** Next.js 14 (App Router) · next-intl (de/en/fr/es/pt) · Tailwind ·
  Supabase (nur via Env, nicht lokal aktiviert) · Vercel. Tests: `tsx --test`.

## 2. Oberste Regeln

1. **Erst prüfen, dann verstehen, dann planen, dann minimal & sauber umsetzen, dann
   vollständig testen, dann sauber berichten.**
2. **0 € Kostenregel:** keine kostenpflichtigen Dienste/Aktionen ohne ausdrückliche
   CEO-Freigabe.
3. **Owner-99 %-away:** Der Inhaber ist kein Entwickler und selten da. Arbeite
   eigenständig, entlaste ihn, stelle keine unnötigen Rückfragen – aber führe keine
   riskanten Außenaktionen ohne Freigabe aus.
4. **Premium-SaaS-Qualität:** keine Quick-and-dirty-Lösungen, keine ungetesteten
   Änderungen, keine unnötigen Umbauten.
5. **Vor jeder Änderung:** kurzer Plan. **Nach jeder Änderung:** Validierung
   (`npm run lint`, `npm run build`, `npm test`). **Am Ende:** CEO-Bericht mit **GO/NO-GO**.

## 3. Harte No-Gos (nur mit ausdrücklicher CEO-Freigabe)

- Keine Aktivierung von: Stripe/Payment/Checkout, DB-Migration, Supabase/Neon, SMTP/
  Gmail/Brevo/Resend-Versand, Twilio/SMS/WhatsApp, neue API-Routen mit Außenwirkung,
  externe Automatisierung, automatische Kunden-/Massenkommunikation.
- **Keine Secrets** lesen, anzeigen, ändern oder committen. Keine `.env*`-Dateien
  committen oder ausgeben (`.env*.example` ist erlaubt).
- **Kein `git add .`** / `git add -A`. Nur gezielte Dateien adden.
- Keine Screenshots, Videos, Downloads oder Temp-Dateien committen.
- **Keine Fake-Claims:** keine erfundenen Kunden, Umsätze, Bewertungen, Standorte,
  Logos oder Testimonials.
- **Keine falschen Versprechen:** keine medizinische Beratung/Diagnose, kein
  Notfalldienst, keine Soforttermin-/24h-/48h-Garantie, keine Compliance-Garantie
  (kein „GDPR-ready/HIPAA-ready/fully compliant/medizinisch zertifiziert").

## 4. Legal / Market-Scope (immer beibehalten)

- „selected international markets" · „local legal review required" ·
  „unsupported jurisdictions may be rejected".
- Market-Scope-Hinweise in Footer/Legal/Buchung erhalten (`lib/market-scope.ts`).
- Patient:innen zahlen nicht; Termine werden manuell bestätigt; kein Notfalldienst.

## 5. Arbeitsweise (Pflicht-Ablauf)

1. **Gate:** `npm run claude:project-gate` (richtiges Projekt?).
2. **Plan:** kurzer, gezielter Plan vor Codeänderungen.
3. **Umsetzen:** minimal-invasiv, bestehende Muster/Konventionen respektieren.
4. **Prüfen:** `npm run lint && npm run build && npm test`; bei UI-Arbeit visuell
   prüfen (Playwright/Chromium, Mobile 360–430 + Desktop 1280/1440, 0 Console-/
   Hydration-Fehler, 0 Overflow, /book/testpraxis-delta = 200).
5. **Selbstkontrolle:** `npm run claude:all-gates` und `npm run claude:final`.
6. **Commit:** nur gezielte Dateien, klare Message. **Push** nur, wenn alles grün ist.
7. **Bericht:** CEO-Go/No-Go (siehe `docs/release-gates.md`).

## 6. Schnellbefehle

- `npm run claude:project-gate` — Projekt-Identität prüfen
- `npm run claude:security` — Secrets-/Kosten-/Dienst-Scan
- `npm run claude:no-fake-claims` — Fake-Claims-Scan
- `npm run claude:changed-files` — geänderte Dateien + Risiko
- `npm run claude:all-gates` — alle Gates nacheinander
- `npm run claude:final` — Gates + lint + test + GO/NO-GO (`--full` inkl. build)
