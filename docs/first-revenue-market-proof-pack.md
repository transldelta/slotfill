# ClinicSlotHub — First Revenue / Market Proof Pack

Internes Strategiepapier. **Nur Vorbereitung** — nichts verkauft, nichts gesendet,
nichts aktiviert, keine neue technische Baustelle. Datum: 2026-06-19 (Stand `e409c5c`).

> Verbindlich: keine Kaltakquise, keine Ads, keine Massennachrichten, kein
> Scraping, keine externen Accounts, kein Stripe/SMTP/Supabase/Analytics/CRM,
> keine echten Patientendaten. Alles unten ist **Analyse + Entwurf**, keine Aktion.

---

## 1. Ausgangslage

ClinicSlotHub ist **live, mehrsprachig (de/en/fr/es/pt) und technisch vorbereitet**,
aber **ohne bewiesenen Umsatz**.

**Stärken:** Website live · Marke ClinicSlotHub sauber · Pricing sichtbar (ab
29/79/149 €/Monat) · Patienten zahlen nicht auf der Website · Aktivierung nur nach
Prüfung · Legal-Scope für hochregulierte Märkte begrenzt · SEO-Basis vorhanden ·
Kontrollsystem/Gates aktiv · keine unnötigen Kosten.

**Lücken:** keine zahlenden Kunden · kein MRR · keine echten Anfragezahlen · keine
Search Console · kein Analytics · kein CRM · keine DB-Anfragenspeicherung · keine
automatische E-Mail-Auswertung · kein 24/7-Monitoring.

---

## 2. Zielmarkt-Regeln (strikt)

**NICHT aktiv als Zielmarkt:** Deutschland, EU, EWR, Europa, USA, Kanada, UK,
Australien, Neuseeland, sonstige hochregulierte westliche Gesundheitsmärkte.

**Öffentlich nie schreiben:** „third world", „poor countries", „low-income
clinics", „arme Länder", „Entwicklungs-/Schwellenländer" als Marketingbegriff.

**Intern erlaubt (nur Analyse):** „ausgewählte internationale Märkte",
„Märkte mit geringerer regulatorischer Komplexität", „private Gesundheitsanbieter
in nicht gesperrten Märkten". Kein Land wird hier aktiviert oder rechtlich
freigegeben — reine Priorisierung; jede reale Aktivierung erfordert vorab
Markt-/Rechtsprüfung.

---

## 3. Zielmarkt-Shortlist (5–8 Kandidaten, Ampel)

Bewertung: 🟢 gut · 🟡 mittel · 🔴 schwierig. „Aufwand" = manuelle Ansprache ohne
neue Kosten. Alle Kandidaten liegen **außerhalb** der gesperrten Märkte.

| Land/Region | Sprache (live?) | Zielkundentyp | Nachfrage priv. Care | Digitalisierungslücke | Zahlungsfähigkeit KMU | Reg.-Risiko | Aufwand | Empfehlung |
|---|---|---|---|---|---|---|---|---|
| Marokko | FR ✅ | Zahn/Diagnostik/Ästhetik | 🟢 | 🟢 | 🟡 | 🟡 | 🟢 | **Top** |
| Côte d'Ivoire / Senegal | FR ✅ | Privatkliniken/Labor | 🟢 | 🟢 | 🟡 | 🟡 | 🟢 | **Top** |
| Kenia | EN ✅ | Privatkliniken/Diagnostik | 🟢 | 🟢 | 🟡 | 🟡 | 🟢 | **Top** |
| Nigeria/Ghana | EN ✅ | Zahn/Privatklinik | 🟢 | 🟢 | 🟡 | 🔴 (Skala/Zahlung) | 🟡 | stark, aber Vorsicht |
| Mexiko/Kolumbien | ES ✅ | Zahn/Ästhetik/Physio | 🟢 | 🟡 | 🟡 | 🟡 | 🟢 | stark |
| Peru/Ecuador | ES ✅ | Diagnostik/Privatpraxis | 🟢 | 🟢 | 🟡 | 🟡 | 🟢 | gut |
| Brasilien | PT ✅ | Zahn/Ästhetik/Diagnostik | 🟢 | 🟡 | 🟡 | 🟡 | 🟡 | gut (groß, kompetitiv) |
| Golf (VAE/Katar) | AR ❌ (nicht live) | Privat-/Ästhetikkliniken | 🟢 | 🟡 | 🟢 | 🟡 | 🔴 (Sprache fehlt) | **später** (erst AR live) |

**Hinweis:** Arabisch ist aktuell **nicht** öffentlich aktiv → Golf-Märkte erst
nach AR-Reaktivierung sinnvoll. Englisch/Französisch/Spanisch/Portugiesisch passen
bereits zur Website → niedrigster Aufwand.

### Top 3 empfohlene Erstzielmärkte
1. **Marokko (FR)** — hohe Privat-Care-Nachfrage, FR live, gute Erreichbarkeit.
2. **Kenia (EN)** — wachsender Privatsektor, EN live, klare digitale Lücke.
3. **Mexiko/Kolumbien (ES)** — großer Zahn-/Ästhetikmarkt, ES live.

---

## 4. Zielkundentypen (Bewertung)

| # | Kundentyp | Problem | Warum ClinicSlotHub | Zahlungsbereitschaft | Risiko | Verkaufsbotschaft (kurz) | Paket |
|---|---|---|---|---|---|---|---|
| 1 | **Zahnkliniken** | viele Termin-/Folgeanfragen, Telefon-Overhead | mehrsprachige Anfrage-Seite, manuelle Bestätigung | 🟢 | 🟢 | „Weniger Telefon, Anfragen online sammeln" | Practice |
| 2 | **Physiotherapie-Zentren** | wiederkehrende Termine, Wartelisten | Wartelisten-/Anfrageverwaltung | 🟢 | 🟢 | „Wartelisten ohne Zettel" | Practice |
| 3 | **Diagnostik-/Laborzentren** | viele Erstanfragen, Zeitfenster | strukturierte Online-Anfragen | 🟡 | 🟢 | „Anfragen geordnet, Termine schneller belegt" | Practice/Clinic |
| 4 | **Private Arztpraxen** | manuelle Terminflut | einfache Buchungsseite | 🟢 | 🟢 | „Eigene Online-Terminseite in Minuten" | Starter/Practice |
| 5 | **Dermatologie/Ästhetik** | hohe Nachfrage, Selbstzahler | klare Anfrage-Seite | 🟢 | 🟡 | „Mehr Anfragen sauber verwalten" | Practice |
| 6 | **Kleine Privatkliniken** | mehrere Leistungen/Teams | Anfrageverwaltung, später Standorte | 🟡 | 🟡 | „Anfragen zentral, Praxis bestätigt" | Clinic |
| 7 | **Radiologie/Bildgebung** | terminintensiv | strukturierte Slots | 🟡 | 🟡 | „Untersuchungstermine geordnet anfragen" | Practice/Clinic |
| 8 | **Augenkliniken** | hoher Durchsatz | Anfrage-/Wartelistenfluss | 🟡 | 🟡 | „Patientenanfragen online bündeln" | Practice/Clinic |

### Top 3 Kundentypen für den ersten Beweis
1. **Zahnkliniken** (hohe Zahlungsbereitschaft, klares Problem).
2. **Physiotherapie-Zentren** (wiederkehrend, Wartelisten-Pain).
3. **Private Arztpraxen / Diagnostikzentren** (Volumen, einfacher Einstieg).

---

## 5. Erstes Angebot (intern, unverändert zum Live-Pricing)

| Paket | Preis | Für wen | Enthält | Regel |
|---|---|---|---|---|
| **Starter** | ab 29 €/Monat | kleine Praxis | eine Termin-/Anfrage-Seite, manuelle Bestätigung, Basis-Terminarten | — |
| **Practice** ⭐ | ab 79 €/Monat | normale Praxis/Klinik | mehrsprachige Anfrage-/Buchungsseite, Wartelisten-/Anfrageverwaltung, Team-Workflow | empfohlen |
| **Clinic** | ab 149 €/Monat | größere Einrichtung | mehrere Leistungen/Teams/Standorte nach Prüfung, erweiterte Anfrageverwaltung | nach Prüfung |

**Festregeln:** keine Patientenzahlung auf der Website · kein Checkout · kein Stripe
· Aktivierung nur nach Prüfung · keine medizinische Beratung · kein Notfalldienst ·
keine garantierten Termine · keine Compliance-Garantie. **Bestes Startpaket: Practice (ab 79 €).**

---

## 6. Umsatzlogik (Orientierung, keine Zusage)

| Szenario | Kunden | MRR | ARR (×12) | Aufwand (manuell) | Rentabilität |
|---|---|---|---|---|---|
| **A** | 3 × 79 € | 237 € | 2.844 € | gering | 🟡 erster Beweis |
| **B** | 10 × 79 € | 790 € | 9.480 € | mittel | 🟢 tragfähiger Beweis |
| **C** | 20 × 79 € | 1.580 € | 18.960 € | höher | 🟢 skaliert |
| **D (Mix)** | 3 Starter + 5 Practice + 2 Clinic | 3×29 + 5×79 + 2×149 = **780 €** | 9.360 € | mittel | 🟢 realistisch |

**Wann externe Dienste frühestens sinnvoll:**
- **Search Console / Bing (0 €):** schon ab Tag 7 sinnvoll (nur Sichtbarkeit, kein Umsatzrisiko).
- **Persistente Anfragen-Speicherung (Supabase/DB):** erst ab ~3–5 echten Interessenten (Szenario A erreicht).
- **Stripe/Payment:** erst wenn ≥1 Kunde aktiv zahlen will und Markt-/Rechtsprüfung steht.
- **Analytics:** erst nach datenschutzrechtlicher Freigabe; nicht für den ersten Beweis nötig.

Faustregel: **erst Marktbeweis (zahlende Pilotpraxis), dann Infrastruktur** — nicht umgekehrt.

---

## 7. Manuelle Test-Ansprache — ENTWURF (NICHT GESENDET)

> Nur für **spätere, manuelle Einzelansprache** über **offizielle** Praxis-/Klinik-
> Kontaktwege (Website-Kontaktformular/offizielle Geschäfts-E-Mail). **Keine**
> privaten/gescrapten E-Mails, **keine** Massennachrichten. Senden erst nach
> ausdrücklicher CEO-Freigabe.

**EN**
> Subject: A simpler way to receive appointment requests online
> Hello, I'm reaching out about ClinicSlotHub (clinicslothub.com), a multilingual
> SaaS that gives clinics and practices a simple online page to receive and manage
> appointment requests. Patients do not pay on the site; your team confirms requests
> manually. Activation is offered only after a market and legal review. Would a small
> pilot access be of interest to your clinic? Happy to share details. — ClinicSlotHub

**FR**
> Objet : Une façon plus simple de recevoir les demandes de rendez-vous en ligne
> Bonjour, je vous contacte au sujet de ClinicSlotHub (clinicslothub.com), un SaaS
> multilingue offrant aux cabinets et cliniques une page en ligne simple pour recevoir
> et gérer les demandes de rendez-vous. Les patients ne paient pas sur le site ; votre
> équipe confirme manuellement. L'activation n'est proposée qu'après une vérification du
> marché et juridique. Un accès pilote serait-il intéressant pour votre établissement ?

**ES**
> Asunto: Una forma más sencilla de recibir solicitudes de cita en línea
> Hola, le escribo sobre ClinicSlotHub (clinicslothub.com), un SaaS multilingüe que ofrece
> a consultas y clínicas una página en línea sencilla para recibir y gestionar solicitudes
> de cita. Los pacientes no pagan en el sitio; su equipo confirma manualmente. La activación
> solo se ofrece tras una revisión de mercado y legal. ¿Le interesaría un acceso piloto?

**PT**
> Assunto: Uma forma mais simples de receber pedidos de consulta online
> Olá, escrevo sobre o ClinicSlotHub (clinicslothub.com), um SaaS multilingue que oferece a
> consultórios e clínicas uma página online simples para receber e gerir pedidos de consulta.
> Os pacientes não pagam no site; a sua equipa confirma manualmente. A ativação é oferecida
> apenas após uma análise de mercado e jurídica. Teria interesse num acesso-piloto?

Keine aggressive Werbung · keine medizinischen Versprechen · keine Garantien.

---

## 8. CEO-Entscheidungspaket

**Top 3 Märkte:** Marokko (FR) · Kenia (EN) · Mexiko/Kolumbien (ES).
**Top 3 Kundentypen:** Zahnkliniken · Physiotherapie-Zentren · private Arztpraxen/Diagnostik.
**Bestes Startpaket:** Practice (ab 79 €/Monat).
**Wahrscheinlichster erster Preis:** 79 €/Monat (ggf. 29 € Starter als Einstieg).

**Größte Risiken:** (1) regulatorische Unsicherheit pro Land → Aktivierung nur nach
Prüfung; (2) Zahlungsabwicklung/Inkasso ohne Stripe noch offen; (3) ohne DB werden
Anfragen nicht dauerhaft erfasst; (4) Sprache AR fehlt für Golf-Märkte; (5) ohne
Search Console/Analytics keine harten Sichtbarkeits-/Konversionsdaten.

**Bleibt blockiert (Freigabe nötig):** Search Console/Bing · Analytics · CRM · SMTP ·
Stripe · Supabase/DB · echte Patientendaten · jede reale Außenansprache.

**CEO-Optionen:**
- **A.** Nur weiter beobachten bis Tag-7-Indexcheck.
- **B.** 10 Zielkunden **recherchieren** (offizielle Kontaktwege), aber **nicht** kontaktieren.
- **C.** 5 manuelle Einzelansprachen **vorbereiten** (Entwurf oben) zur CEO-Freigabe.
- **D.** Search Console / Bing Webmaster später freigeben (0 €).
- **E.** Noch nichts tun.

**Empfehlung:** **D + B** parallel — Search Console (0 €, sofortiger Sichtbarkeits-
Nutzen) freigeben **und** 10 Zielkunden in den Top-3-Märkten recherchieren (nur Liste,
keine Ansprache). Erst danach **C** (5 Einzelansprachen) nach erneuter CEO-Freigabe.
**Keine neue Entwicklung ohne Marktbeweis.**
