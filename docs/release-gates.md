# Release Gates — Slotfill

Feste Tore (Gates), die Claude Code bei jeder Arbeit durchläuft. Jedes Gate ist
**GO** oder **NO-GO**. Erst wenn alle Pflicht-Gates GO sind, wird committet/gepusht.

## 1. Pre-Work Gate

- Auftrag verstanden? Minimal-invasiver Plan steht?
- `git status` sauber bzw. offene Änderungen erklärbar?
- **NO-GO**, wenn unklar, riskant, datenschutzrelevant oder teuer → STOPP & Rückfrage.

## 2. Project Identity Gate

- `npm run claude:project-gate` → richtiges Repo (`transldelta/slotfill`), `package.json
  name = slotfill`, kein Fremdprojekt (z. B. SprachmittlerNetz).
- **NO-GO** bei Mismatch → nichts ändern, Fehlerbericht.

## 3. Security Gate

- `npm run claude:security` → keine Secrets im getrackten Code; keine neue Stripe-/
  SMTP-/Twilio-/Resend-Aktivierung; keine `.env*` im Commit; kein `git add .`.
- **NO-GO** bei Secret-Fund oder unautorisierter Dienst-Aktivierung.

## 4. Cost Gate

- 0 € ohne CEO-Freigabe. Keine kostenpflichtigen Dienste/Pakete/Aktivierungen.
- Keine neuen Abhängigkeiten ohne Notwendigkeit.
- **NO-GO** bei drohenden Kosten ohne Freigabe.

## 5. UX Gate (bei sichtbaren Änderungen)

- Visuelle Prüfung Mobile (360/375/390/430) + Desktop (1280/1440).
- 0 Console-Errors, 0 Hydration-Errors, 0 broken images, 0 horizontaler Overflow.
- CTAs sichtbar & klickbar; `/book/testpraxis-delta` = HTTP 200.
- **NO-GO** bei kaputtem Button/Bild/Layout oder Client-Fehler.

## 6. Test Gate

- `npm run lint` ✓ · `npm run build` ✓ · `npm test` ✓.
- **NO-GO** bei Rot (kein Commit). Fehlende Tests werden gemeldet, nicht erfunden.

## 7. No-Fake-Claims Gate

- `npm run claude:no-fake-claims` → keine Fake-Belege/Garantien/medizinischen
  Versprechen; Market-Scope erhalten.
- **NO-GO** bei verbotener Aussage.

## 8. Final CEO Gate

- `npm run claude:final` (`--full` inkl. build) → alle Pflicht-Gates grün.
- Commit nur gezielt; Push nur bei GO.

## CEO-Bericht (Format)

```
1. Startcommit / Endcommit
2. Geänderte Dateien (+ Risiko)
3. Was umgesetzt wurde
4. Was ausdrücklich NICHT aktiviert wurde
5. Lint / Build / Tests
6. UX-/Playwright-Ergebnis (falls UI)
7. Security-/Cost-/No-Fake-Gate-Ergebnis
8. Offene Risiken
9. GO / NO-GO + klare Empfehlung
```

**Schlussregel:** GO nur, wenn alle Pflicht-Gates grün sind und keine neuen Fehler,
Secrets, Kosten oder Fake-Claims entstanden sind.
