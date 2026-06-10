# First Lead Handling – ClinicSlotHub

Stand: Juni 2026 | Soft Launch | Interne Prozessdokumentation

**Ziel dieses Dokuments:** Klarer Ablauf, damit erste Anfragen sauber, datenschutzkonform und ohne unnötige Telefonate bearbeitet werden können.

**Grundprinzip:** Schriftlich vor Telefonat. Kein Lead geht verloren, keine echten Daten werden unsauber erfasst.

---

## 1. Was tun, wenn jemand kommentiert? (Öffentlicher Post, LinkedIn, Reddit, etc.)

### Sofort (innerhalb 24 Stunden):
1. **Kommentar lesen** – Ist es ein:
   - Echtes Interesse → mit Antwort-Vorlage aus `PUBLIC_REPLY_TEMPLATES_DE.md` oder `_EN.md` antworten
   - Kritik → sachlich antworten (Vorlage #8)
   - Frage → passende Vorlage wählen, ggf. anpassen
   - Nur „Interessant" → Vorlage #15 verwenden

2. **Öffentlich antworten** – kurze Version aus dem Vorlagen-Dokument
3. **DM anbieten** – wenn die Antwort zu lang für einen Kommentar wird: „Gerne per DM mehr dazu"

### Nicht tun:
- Keine E-Mail-Adressen öffentlich kommentieren
- Keinen Link zu Stripe/Checkout ohne Kontext posten
- Keine Preiszusagen machen, die nicht im Pricing stehen
- Keine übertriebenen Versprechungen

---

## 2. Was tun, wenn jemand eine DM schreibt?

### Ablauf:
1. **DM lesen** – Was fragt die Person konkret?
2. **Kurze DM-Antwort** (aus den Vorlagen) mit weiterführender Frage:
   > „Danke für die Nachricht! Um gezielt antworten zu können: Was für eine Praxis führen Sie, und was beschäftigt Sie aktuell bei der Terminorganisation?"
3. **Antwort abwarten** – keine Telefonnummer anbieten, bevor nicht klar ist, was die Person will
4. **Wenn konkrete Anfrage:** Entweder direkt beantworten oder auf E-Mail verweisen:
   > „Gerne sende ich Ihnen alle Details – am besten kurz per E-Mail: transl.delta@gmail.com"

### Wann Link schicken:
- Erst nach einer kurzen Qualifizierungsfrage
- Link zu clinicslothub.com oder direkt zum Registrierungsformular (/auth/register)
- Nicht sofort bei erstem Kontakt – kurze Antwort zuerst, dann Link

---

## 3. Was tun, wenn eine Praxis wirklich testen will?

### Schritt-für-Schritt:

**Schritt 1: Qualifizierung (schriftlich)**
Kurze Rückfrage per E-Mail oder DM:
> „Sehr gut. Damit ich Ihnen den Einstieg sinnvoll erleichtern kann, kurz drei Fragen:
> 1. Was für eine Praxis haben Sie (Allgemeinmedizin, Physiotherapie, Zahnarzt, …)?
> 2. Wie verwalten Sie Wartelisten heute?
> 3. Was erhofft sich die Praxis von ClinicSlotHub?
> Dann schicke ich Ihnen einen Direktlink zum Testaccount."

**Schritt 2: Selbst-Registrierung oder assistiertes Onboarding**
- Option A (bevorzugt): Person registriert sich selbst → clinicslothub.com/auth/register
- Option B: Kurze Screenshare-Demo (max. 30 Min.) – nur wenn A nicht gewünscht

**Schritt 3: Nachfassen nach 3–5 Tagen**
> „Haben Sie den Testaccount schon anlegen können? Gibt es Fragen oder etwas, das noch nicht klar ist?"

**Schritt 4: Feedback einholen**
> „Was funktioniert gut? Was fehlt? Was würden Sie als Praxis konkret als nächstes brauchen?"

---

## 4. Welche Fragen zuerst stellen?

**Immer zuerst (in dieser Reihenfolge):**
1. Was für eine Einrichtung? (Typ, Größe, Fachrichtung)
2. Wie wird heute organisiert? (Zettel, Excel, andere Software, Telefon?)
3. Was ist das konkrete Problem? (Terminlücken? Warteliste unübersichtlich? Mehrsprachige Patienten?)
4. Wie viele Patienten auf der Warteliste typischerweise?

**Dann (falls relevant):**
5. Welche Sprachen sprechen die Patienten?
6. Wird SMS/WhatsApp gewünscht?
7. Gibt es eine bestehende PVS/PMS-Software?

**Erst danach:** Preisdiskussion oder technische Details – nicht vorher.

---

## 5. Wann Link schicken?

| Situation | Link schicken? |
|---|---|
| Erster Kommentar ohne Kontext | ❌ Zuerst kurze Antwort, dann Link |
| Erste DM ohne Kontext | ❌ Zuerst Rückfrage, dann Link |
| Person beschreibt konkretes Problem | ✅ Direkt Link zu clinicslothub.com |
| Person fragt explizit nach Demo/Test | ✅ Direkt Link zu /auth/register |
| Person ist eindeutig Praxis/Klinik | ✅ Link + kurze Erläuterung |
| Person ist unklar / wirkt wie Spam | ❌ Keine Links, kurze neutrale Antwort |

---

## 6. Wann keine sensiblen Daten annehmen?

**Niemals im Zuge von DM oder Kommentar annehmen:**
- Patientennamen oder Patientenlisten
- Krankenakten, Diagnosen, Befunde
- Versicherungsdaten
- Steuernummern oder Bankdaten der Praxis

**Erst nach AVV-Abschluss:**
- Echte Patientendaten im produktiven System
- Import von bestehenden Wartelisten mit echten Patientendaten

**Sichere Alternativen:**
> „Bitte keine echten Patientendaten per E-Mail senden. Für den Test können Demo-Daten (z. B. Muster, Max) verwendet werden. Für den Produktivbetrieb schicke ich Ihnen zuerst den AVV."

---

## 7. Wie Interessenten sauber notieren?

**Empfohlenes Format (lokal, nicht im System):**

Eine einfache Tabelle (Notion, Markdown, Excel) mit diesen Spalten:

| Datum | Name/Pseudonym | Kanal | Praxistyp | Status | Nächste Aktion |
|---|---|---|---|---|---|
| 2026-06-10 | Dr. M. (LinkedIn) | LinkedIn DM | Allgemeinmedizin | Interesse gezeigt | E-Mail schicken |
| 2026-06-11 | Praxis X | E-Mail | Physiotherapie | Trial aktiv | Nachfassen 15.06. |

**Wichtig:**
- Keine vollständigen Namen ohne Einwilligung notieren
- Keine echten Patientendaten in diese Liste
- Leads löschen oder anonymisieren, wenn kein Interesse mehr besteht

---

## 8. Wie vermeiden, dass der Betreiber in lange Telefonate gezogen wird?

**Strategie: Schriftlich zuerst – immer**

Standard-Antwort auf Telefonat-Wunsch:
> „Sehr gerne! Für einen effizienten ersten Austausch würde ich vorschlagen, kurz schriftlich zu starten – damit ich Ihre Situation und Anforderungen sauber prüfen kann, bevor wir telefonieren. Einfach kurz per E-Mail: transl.delta@gmail.com – dann kann ich einschätzen, ob und wie ClinicSlotHub passt."

**Wenn trotzdem Telefonat gewünscht:**
- Erst wenn 3 schriftliche Fragen beantwortet wurden (Praxistyp, Problem, Erwartung)
- Termin nur per Kalenderlink oder E-Mail, kein Ad-hoc-Anruf
- Maximale Erstgespräch-Länge: 20–30 Minuten
- Agenda vorher schriftlich klären

**Telefonat vermeiden, wenn:**
- Erste Anfrage komplett vage
- Person schreibt nur „Anrufen?" ohne Kontext
- Kein klarer Use Case erkennbar

---

## 9. Wie höflich sagen, dass zuerst schriftlich geklärt wird?

**Vorlage DE:**
> „Danke für Ihre Nachricht! Für einen sinnvollen ersten Austausch würde ich gerne kurz schriftlich starten – damit ich Ihre Situation einschätzen kann, bevor wir uns näher abstimmen. Könnten Sie mir kurz schildern: Was für eine Praxis führen Sie, und was beschäftigt Sie aktuell bei der Terminorganisation? Dann antworte ich gezielt. Danke!"

**Vorlage EN:**
> "Thanks for reaching out! To make the most of our first exchange, I'd love to start in writing — that way I can assess your situation before we connect properly. Could you briefly share: what type of practice do you run, and what specifically are you trying to solve with waitlist or appointment management? I'll come back with a targeted reply. Thank you!"

**Sehr kurze Version:**
> „Gerne zuerst kurz schriftlich, damit ich Ihre Anforderungen sauber prüfen kann."

---

## 10. Schnell-Checkliste für jede eingehende Anfrage

- [ ] Kanal notiert? (LinkedIn, E-Mail, Reddit, …)
- [ ] Art der Anfrage klar? (Interesse, Kritik, technische Frage, Demo-Anfrage)
- [ ] Passende Vorlage ausgewählt?
- [ ] Antwort angepasst (nicht Copy-Paste ohne Kontext)?
- [ ] Kein Link ohne vorherige Qualifizierung geschickt?
- [ ] Keine sensiblen Daten angenommen?
- [ ] Lead in eigener Tabelle notiert (mit Datum, Status, nächste Aktion)?
- [ ] Nachfass-Datum gesetzt, wenn relevant?

---

## 11. Finale Launch-Post-Ergänzung (geprüft und korrekt)

**Technischer Befund:** Registrierung auf clinicslothub.com ist vollständig selbstservice – kein Admin-Approval, kein Invite-Gate. Nutzer können sich direkt auf `/auth/register` registrieren, E-Mail bestätigen und Trial starten.

**Empfohlener Ergänzungssatz (korrekt, nicht übertrieben):**

> „Wer direkt testen möchte: Auf **clinicslothub.com** kann eine Demo-Praxis kostenlos angelegt werden – keine Kreditkarte nötig."

**EN-Version:**
> "Want to try it directly? You can set up a demo practice for free at **clinicslothub.com** — no credit card required."

---

*Dieses Dokument ist ausschließlich für den internen Betrieb bestimmt. Keine Weitergabe an Dritte. Keine automatisierten Prozesse. Alle Schritte erfolgen manuell und seriös.*
