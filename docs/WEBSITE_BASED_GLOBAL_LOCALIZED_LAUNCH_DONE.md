# Website-Based Global Localized Launch – Abschluss

Stand: Juni 2026 | Phase 13 | ClinicSlotHub

---

## Warum eigene Website als Launch-Kanal

Der Betreiber hat keine LinkedIn-, Xing- oder Facebook-Profile und möchte nicht selbst überall Accounts aufbauen. Deshalb dient die eigene Website als zentrale Launch-Plattform.

**Vorteile:**
- Volle Kontrolle über Inhalt und Ton
- Kein Algorithmus, keine Plattform-Abhängigkeit
- SEO-Wert bleibt bei clinicslothub.com
- Keine Kosten für Kanäle oder Tools
- Texte können jederzeit kopiert und geteilt werden

---

## Warum keine Social-Media-Accounts nötig sind

Die Launch-Struktur ist so aufgebaut, dass der Betreiber nur Links teilen muss:

- **clinicslothub.com/de/launch** → vollständige DE-Launch-Seite
- **clinicslothub.com/en/launch** → vollständige EN-Launch-Seite
- **clinicslothub.com/de/share** → kopierfertige Texte für manuelles Teilen
- **clinicslothub.com/de/public-launch** → zentrale Hub-Seite mit allem

Wer einen Social-Media-Post schreiben möchte, kopiert den Text aus `/share` und postet manuell. Kein Account nötig.

---

## Live URLs (nach Deployment)

### Launch-Seiten (alle 10 Locales)

| Locale | URL |
|---|---|
| DE | https://clinicslothub.com/de/launch |
| EN | https://clinicslothub.com/en/launch |
| FR | https://clinicslothub.com/fr/launch |
| ES | https://clinicslothub.com/es/launch |
| PT | https://clinicslothub.com/pt/launch |
| ZH | https://clinicslothub.com/zh/launch |
| HI | https://clinicslothub.com/hi/launch |
| AR | https://clinicslothub.com/ar/launch |
| BN | https://clinicslothub.com/bn/launch |
| RU | https://clinicslothub.com/ru/launch |

### Public Launch Hub

| URL |
|---|
| https://clinicslothub.com/de/public-launch |
| https://clinicslothub.com/en/public-launch |

### Share Kit

| URL |
|---|
| https://clinicslothub.com/de/share |
| https://clinicslothub.com/en/share |

### Blog-Artikel (Global Launch)

| Locale | URL |
|---|---|
| DE | https://clinicslothub.com/de/blog/clinicslothub-global-soft-launch |
| EN | https://clinicslothub.com/en/blog/clinicslothub-global-soft-launch |
| FR | https://clinicslothub.com/fr/blog/clinicslothub-global-soft-launch |
| ES | https://clinicslothub.com/es/blog/clinicslothub-global-soft-launch |
| PT | https://clinicslothub.com/pt/blog/clinicslothub-global-soft-launch |
| ZH | https://clinicslothub.com/zh/blog/clinicslothub-global-soft-launch |
| HI | https://clinicslothub.com/hi/blog/clinicslothub-global-soft-launch |
| AR | https://clinicslothub.com/ar/blog/clinicslothub-global-soft-launch |
| BN | https://clinicslothub.com/bn/blog/clinicslothub-global-soft-launch |
| RU | https://clinicslothub.com/ru/blog/clinicslothub-global-soft-launch |

---

## Locales lokalisiert

Alle 10 Locales haben eigene Launch-Seiten mit:
- Lokalisiertem Headline, Subline, Feature-Liste, Status, CTA
- Korrekter `dir`-Attribute für RTL (AR)
- Lokalen OG-Tags
- Hreflang alternates für alle 10 Sprachen

---

## Screenshots eingebunden

Alle 6 professionellen Screenshots aus `public-launch-screenshots/` wurden kopiert nach `public/images/launch/`:

| Datei | Eingebunden in |
|---|---|
| 01-home-de-hero.png | Launch-Seite (Hero), Public-Launch Hub |
| 02-booking-form-de.png | Launch-Seite (Grid) |
| 03-pricing-de.png | Public-Launch Hub (Grid) |
| 04-blog-de.png | Public-Launch Hub (Grid) |
| 05-home-en-hero.png | Public-Launch Hub (Grid) |
| 06-mobile-home-de.png | Launch-Seite (Grid), Public-Launch Hub |

---

## Homepage Soft-Launch-Banner

Alle 10 Locale-Startseiten haben einen dezenten Banner direkt über dem Hero:
- Lokalisierter Text in allen 10 Sprachen
- „Mehr erfahren"-Button → `/[locale]/launch`
- Kein Pop-up, keine aggressive Werbung
- Blauer Info-Stil (kein Amber/Yellow)

---

## SEO / Sitemap / Hreflang

- **Sitemap**: `/launch`, `/public-launch`, `/share` für alle 10 Locales ergänzt
- **Blog-Slug**: `clinicslothub-global-soft-launch` in allen 10 Locale-Blogs
- **Hreflang**: In Launch-, Public-Launch- und Share-Seiten korrekt gesetzt
- **Canonical**: Auf clinicslothub.com
- **OG-Image**: 01-home-de-hero.png (1440×1000) auf allen Launch-Seiten

---

## Was nicht gemacht wurde

- ❌ Kein Spam
- ❌ Keine Kaltakquise
- ❌ Keine Fake-Kunden oder Fake-Testimonials
- ❌ Keine bezahlte Werbung
- ❌ Keine automatisierten Posts
- ❌ Keine neuen monatlichen Kosten
- ❌ Keine Social-Media-Accounts erstellt
- ❌ Keine HIPAA-/DSGVO-Garantien behauptet
- ❌ Keine „weltweit rechtssicher"-Aussagen
- ❌ Keine Admin-/Vercel-/Supabase-Screenshots öffentlich verwendet

---

## Nächste 7 Tage Plan

| Tag | Aktion |
|---|---|
| Tag 1 | Launch-Post auf persönlichen Netzwerken (manuell, aus `/share`) |
| Tag 2 | Indie Hackers Post (Text aus `PUBLIC_POSTS_EN.md`) |
| Tag 3 | Deutschen Community-Post (Reddit r/Entrepreneur oder Foren) |
| Tag 4 | Ruhetag / warten auf erste Reaktionen |
| Tag 5 | Auf alle Kommentare/DMs antworten (Vorlagen aus Reply-Templates) |
| Tag 6 | Google Search Console: Sitemap einreichen / crawlen lassen |
| Tag 7 | Erste Trial-User nachfassen (falls vorhanden) |

---

## Wie Interessenten weltweit testen können

1. Jede Sprache hat eine eigene Launch-Seite mit lokalem CTA
2. Registrierung auf `/auth/register` ist vollständig selbstservice
3. 14-tägiger Trial startet nach E-Mail-Bestätigung ohne Admin-Approval
4. Buchungslinks können ohne Praxis-Account getestet werden (`/[locale]/termin-buchen`)
5. Kontaktformular `/[locale]/kontakt` für direkte Anfragen

---

## Optionale nächste Kanäle

| Kanal | Wann | Aufwand |
|---|---|---|
| Product Hunt | Wenn Launch-Seiten stabil und 5+ Tester vorhanden | Mittel |
| Hacker News Show HN | Wenn technischer Stack bereit zu präsentieren | Niedrig |
| Healthcare-Foren | Nach 2–3 Wochen, wenn echte Nutzerfeedbacks vorliegen | Mittel |
| Zahnarzt-/Physio-Verbände | Mittelfristig, wenn Produkt stabiler | Hoch |

---

*Dieses Dokument ist interne Dokumentation. Nicht für öffentliche Verwendung bestimmt.*
