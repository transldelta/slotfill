# ClinicSlotHub — Monatliches Operations Review (Template)

> Einfaches, wiederkehrendes Prüf-Schema nach Well-Architected-/SRE-Light-Prinzipien.
> **Read-only. Keine externen Dienste. Keine Kosten. Kein Feature-Bau.**
> Dauer: ca. 15–20 Minuten. Ergebnis: eine CEO-Entscheidung am Ende.
>
> Anleitung: Diesen Block je Monat **kopieren** (nicht überschreiben), Datum +
> Commit-Stand eintragen, jede Frage mit ✅ / ⚠️ / ❌ + kurzer Notiz beantworten.
> Begleitend: `docs/operations-excellence-audit-light.md` (Rahmen) und
> `docs/visibility-observation-log.md` (Beobachtungs-Historie).

---

## Review-Kopf

- **Monat / Datum:** ____________________
- **Commit-Stand:** ____________________ (`git log --oneline -1`)
- **Geprüft von:** ____________________
- **Vorheriges Ergebnis:** GO / HOLD / FIX / SELL-READY

---

## 15 Kernfragen

| # | Frage | Wie prüfen (0 €, read-only) | Status | Notiz |
| --- | --- | --- | --- | --- |
| 1 | Ist die Website live? | Startseite im Browser laden | ⬜ | |
| 2 | Sind Kernseiten 200? | `/de /en /fr /es /pt`, `/de/pricing`, `/de/kontakt`, `/de/blog`, `/book/testpraxis-delta` | ⬜ | |
| 3 | Ist `/auth/register` gesperrt? | Aufruf → Redirect auf `/de/kontakt` | ⬜ | |
| 4 | Sind `/dashboard` und `/admin` geschützt? | Ohne Login → Redirect auf `/auth/login` | ⬜ | |
| 5 | Sind Form-Spam-Guards aktiv? | Kontakt/Feedback/Termin nutzen `lib/form-abuse*`; Tests grün | ⬜ | |
| 6 | Gibt es sichtbares „Slotfill" (öffentlich)? | Header/Footer/Marketing — Soll: 0 sichtbares Slotfill | ⬜ | |
| 7 | Sind Pricing und Legal-Scope konsistent? | „ab 29/79/149 € / Monat", „Patienten zahlen nicht", „Aktivierung nach Prüfung", „selected markets" | ⬜ | |
| 8 | Gibt es mobile Fehler? | Mobile 360–430 + Desktop 1280/1440: kein Overflow, keine kaputten Bilder, keine Console-Fehler | ⬜ | |
| 9 | Gibt es Indexierung? | Manueller `site:clinicslothub.com`-Check in Google + Bing | ⬜ | |
| 10 | Gibt es echte Anfragen? | Hinterlegtes Kontaktpostfach sichten (ehrlich, ohne Zusage vor Prüfung) | ⬜ | |
| 11 | Gibt es neue Kosten? | 0 €-Status: kein bezahlter Dienst aktiviert | ⬜ | |
| 12 | Gibt es Security-Warnungen? | `npm run claude:security`; Auth-/Register-/Secret-Schutz intakt | ⬜ | |
| 13 | Gibt es Supportfälle? | Offene/verpasste Anfragen, kaputte Links | ⬜ | |
| 14 | Gibt es Gründe für Feature-Freeze? | Ist Security/Trust/Mobile/Legal rot oder gelb-kritisch? | ⬜ | |
| 15 | CEO-Entscheidung | Gesamtbild bewerten | ⬜ | |

> Legende: ✅ grün/in Ordnung · ⚠️ gelb/beobachten · ❌ rot/sofort handeln.

---

## Golden-Signals-Kurzcheck (SRE Light)

| Signal | Beobachtung diesen Monat | Status |
| --- | --- | --- |
| Latency | Seiten laden flüssig? (subjektiv/Build gesund) | ⬜ |
| Traffic | Sichtbarkeit/Anfragen vorhanden? (manuell) | ⬜ |
| Errors | Build/Tests/Console grün? Keine 404/500 auf Marketing? | ⬜ |
| Saturation | Keine Last-/Limit-Auffälligkeiten? | ⬜ |

---

## Error-Budget-Check (Feature-Freeze-Auslöser)

Ist **einer** dieser Punkte rot → **Feature-Freeze**, erst Stabilität:

- [ ] Security · [ ] Public registration · [ ] Form spam · [ ] Mobile UX
- [ ] Pricing trust · [ ] Legal scope · [ ] Core routes live
- [ ] robots/sitemap · [ ] build/tests

**Feature-Freeze aktiv?** ☐ Nein ☐ Ja — Grund: ____________________

---

## CEO-Entscheidung (Frage 15)

Eine Option ankreuzen:

- ☐ **GO** — alles grün, weiter im Beobachtungsmodus, kein Handlungsbedarf.
- ☐ **HOLD** — stabil, aber abwarten; keine neuen Schritte, nächster Check planmäßig.
- ☐ **FIX** — ein Bereich gelb/rot → gezielte, minimal-invasive Korrektur nötig.
- ☐ **SELL-READY** — Wertstand gut dokumentiert, Verkauf/Übergabe vorbereiten.

**Begründung (1–3 Sätze):**

____________________________________________________________

**Nächster geplanter Review:** ____________________

---

## Hinweise zu Freigaben

Erweiterungen wie **Search Console, Analytics, Uptime-Monitoring, Sentry,
Cloudflare/WAF, SMTP/Resend, CRM, Stripe, Supabase-Ausbau, Ads, Kaltakquise,
externe Rechtsprüfung** bleiben **CEO-Freigabe-pflichtig**. Nutzen/Risiko/Kosten/
Empfehlung je Punkt: siehe `docs/operations-excellence-audit-light.md`,
Abschnitt „Freigabe-pflichtige Erweiterungen". Ohne ausdrückliche Freigabe: 0 €,
keine Aktivierung.
