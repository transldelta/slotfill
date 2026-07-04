# Screenshot Checklist — für das Listing (Owner erledigt selbst)

> **Regeln (vor jedem Screenshot):**
> - Keine echten personenbezogenen Daten sichtbar (Namen, Telefonnummern, E-Mails von Dritten)
> - Eigene E-Mail-Adressen teilweise schwärzen (z. B. `tr***@gmail.com`)
> - Keine Admin-Secrets, keine URLs mit Tokens, keine Supabase-Keys, keine Browser-Erweiterungen mit Kontodaten im Bild
> - Keine Patientendaten — auch keine Testdaten, die wie echte aussehen
> - **Screenshots NICHT ins Repository committen** — separat ablegen (lokaler Ordner/Cloud) und nur im Listing hochladen

---

## Pflicht (fürs Listing)

- [ ] **Homepage Desktop-Hero** — https://clinicslothub.com/en, Breite ~1440px, Hero + Trust-Hinweise sichtbar
- [ ] **Homepage Mobile** — gleiche Seite, ~390px Breite (Browser-Devtools Device-Modus)
- [ ] **Pricing-Seite** — https://clinicslothub.com/en/pricing, alle drei Pläne + „no payment is processed on this website"-Hinweis im Bild
- [ ] **Termin-Anfrage-Seite** — https://clinicslothub.com/en/termin-buchen, leeres Formular (nichts eintippen)
- [ ] **Admin-Benachrichtigungs-E-Mail** — die bei der Live-Testanfrage empfangene Mail; Empfängeradresse und Patient-Testdaten schwärzen; Betreff sichtbar lassen

## Optional (stärkt das Listing)

- [ ] **Testlauf-Ergebnis** — Terminal mit `npm test`-Ausgabe „501 pass / 0 fail" (keine Pfade mit Benutzernamen im Bild? Home-Pfad ist okay, aber prüfen)
- [ ] **Google Search Console** — Sitemap-Einreichung/Status, falls eingerichtet; Property-E-Mail schwärzen
- [ ] **llms.txt im Browser** — https://clinicslothub.com/llms.txt als AI-Readiness-Beleg
- [ ] **Mehrsprachigkeit** — dieselbe Seite in 2–3 Sprachen nebeneinander (z. B. /en, /es, /pt)
- [ ] **Admin-Dashboard** — NUR falls ohne sensible Daten möglich: leere/Testdaten-Ansicht der Booking-Requests mit `is_test`-Einträgen; im Zweifel weglassen

## Nicht anfertigen / nicht veröffentlichen

- Screenshots aus Supabase-, Vercel-, Resend- oder Stripe-Dashboards (Account-/Key-Leak-Risiko)
- Screenshots mit echten Anfragen oder echten Kontaktnachrichten
- Screenshots von .env-Inhalten, Logs oder Audit-Einträgen
