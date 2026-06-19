# ClinicSlotHub — Visibility Observation Plan (Owner-Away)

Ziel: Der Inhaber muss **nicht täglich selbst suchen**. Dieser Plan beschreibt, was
beobachtet wird, welche Signale zählen und was ausdrücklich **nicht** ohne CEO-Freigabe
passiert. 0 € · keine Ads · keine Kaltakquise · keine Tracking-Aktivierung.

## Beobachtungs-Cadence (Tag 0 / 7 / 14 / 30)

- **Tag 0 (Launch/Deploy):** Live-Website sauber? robots.txt + sitemap.xml
  erreichbar (200)? Kernseiten crawlbar (kein noindex)? Marke ClinicSlotHub,
  0 sichtbares Slotfill? → Festhalten in `visibility-observation-log.md`.
- **Tag 7:** Manueller `site:clinicslothub.com`-Check in Google **und** Bing
  (im echten Browser). Brand-Suche „ClinicSlotHub". Keine alten Brandreste?
- **Tag 14:** Wiederholen. Sind Startseite / Pricing / Kontakt indexiert?
- **Tag 30:** Bewertung — indexiert? Anfragen eingegangen? Suchtreffer? technische
  Fehler? → Nächster CEO-Entscheidungspunkt (z. B. Search Console freigeben).

> Hinweis: Index-Status lässt sich **nicht** zuverlässig per Skript/curl abfragen
> (Consent-Walls, Bot-Schutz, JS-gerenderte Ergebnisse). Verlässlich nur per
> manueller Browser-Suche oder — mit CEO-Freigabe — über die Search Console.

## Wöchentlich (5 Minuten, read-only)

- **Indexierung:** `site:clinicslothub.com` in Google/Bing manuell prüfen — erscheinen
  Start-, Pricing-, Blog-, Kontaktseiten?
- **Technische Live-Gesundheit:** `https://clinicslothub.com/robots.txt` und
  `/sitemap.xml` laden 200? Startseiten /de /en … laden 200?
- **Marke:** Header/Footer zeigen ClinicSlotHub-Logo; kein sichtbares „Slotfill".
- **Preise:** Pricing zeigt „ab 29/79/149 € / Monat" + „Patienten zahlen nicht" +
  „Aktivierung nach Prüfung".

## Bei Bedarf / monatlich

- **Kontaktanfragen:** Posteingang der hinterlegten Kontaktadresse sichten
  (Praxiszugang-Anfragen). Antworten ehrlich, ohne Zusagen vor Prüfung.
- **Suchbegriffe:** Keyword-Cluster aus `docs/visibility-seo-foundation.md` gegen die
  tatsächlich gefundenen Suchanfragen abgleichen (sobald Search Console freigegeben).
- **Kaputte Links / Live-Fehler:** stichprobenartig Header-/Footer-/Pricing-Links.

## Wichtige Signale

- Sichtbare Indexierung der Kernseiten.
- Eingehende Praxiszugang-/Paket-Anfragen über die Kontaktseite.
- Booking-Seiten-Aufrufe (erst wenn Analytics rechtlich sauber freigegeben ist).
- Stabile Live-Seiten (keine 404/500/Console-Fehler auf Marketing-Seiten).

## Wird ausdrücklich NICHT gemacht (ohne CEO-Freigabe)

- Keine Kaltakquise, keine Massennachrichten, keine automatischen E-Mails.
- Keine bezahlten Ads.
- Keine Tracking-/Analytics-Aktivierung.
- Keine neue DB/Supabase, kein Stripe/Payment, kein SMTP, kein Twilio.
- Keine Zielmarktöffnung für hochregulierte Märkte.

## CEO-Freigabe nötig für

- **Google Search Console** (Property-Verifizierung, Sitemap-Einreichung).
- **Bing Webmaster Tools.**
- **Analytics** (z. B. datenschutzkonformes, cookiefreies Tool).
- **E-Mail-Automation / CRM.**
- **Ads.**

## Automatische Absicherung (bereits aktiv)

- Lokale Git-Hooks + `scripts/claude` Gates (Identity/Security/No-Fake/Final).
- Guards: Brand, Pricing-Konsistenz, Public Technical Terms, SEO-Foundation.
- Diese verhindern Rückfälle (Slotfill-Reste, Preiswidersprüche, Technikbegriffe).
