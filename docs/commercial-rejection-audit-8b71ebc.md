# Commercial Rejection Audit — Commit 8b71ebc

**Status: Technical GO · Commercial NO-GO**
_Internal document. Not public. Not indexed. No customer data._

Commit `8b71ebc` ("simplify clinicslothub positioning and revenue clarity") passed all
technical gates (tests/lint/build green, EN/FR/ES only, no DB, no Stripe, no patient
data, no external services). A video walkthrough by the owner showed that, despite being
technically safe, the page **does not sell**. This audit records why, second by second,
and what must be fixed.

## Why 8b71ebc was commercially rejected

- The concept reads as an abstract "Scheduling OS" instead of a concrete, recognizable
  tool. A clinic owner cannot say in 5 seconds "this is a daily board for my reception".
- Too much information and repeated explanation; the page feels like a text catalogue.
- Buttons look decorative, not functional — nothing visibly happens on click.
- The demo looks like a static picture, not like software you can touch.
- The money logic is present but weak; it is not obvious that "clinic pays monthly = SaaS".
- The patient section dilutes the buyer focus (the buyer is the clinic, not the patient).
- Safety is correct but visually too dominant for a sales page.
- The product value for a clinic owner is not stated hard enough.

## Second-group audit (from the video)

| Time | Section | Problem observed |
|------|---------|------------------|
| 0–5s | Hero | Unclear. Product name used as the headline; no plain "what is this". |
| 5–14s | Demo visual | Static mockup; looks like an image, not a working board. |
| 15–29s | For clinics | Too generic; SaaS phrases, no concrete pain the owner recognizes. |
| 30–37s | Demo | No real action — nothing is clickable, no state changes. |
| 40–72s | Pricing / money | Money logic not convincing enough; plans feel passive, buttons dead. |
| 75–83s | Patients | Patient block waters down the clinic-buyer focus. |
| 85–91s | Safety | Safety wall too dominant for a commercial page. |
| 92–109s | Contact / CTA | Weak call to action; no visible email fallback, no felt next step. |

## Decision

**Technical GO, Commercial NO-GO.** Tests being green is not sufficient. The page must be
understandable in 5 seconds, the buttons must visibly work, the demo must feel interactive,
the money logic must be clear, and the clinic must be the obvious buyer.

## What must be repaired

1. **Hero clarity** — plain headline "One board for today's clinic work", concrete subline
   (appointments, walk-ins, rooms, open slots), product name reduced to a small label.
2. **Concept** — position as a simple front-desk / daily board, not an abstract OS.
3. **Interactive demo** — client-side only (React state, no storage): tabs (Today Board /
   Walk-in Queue / Open Slots / Rooms) and working actions (add sample walk-in, mark
   completed, show open slots, reset). Anonymized sample data only.
4. **Button functions** — no dead CTAs. "Open interactive demo" scrolls/opens the demo;
   "Request pilot access" opens mailto **and** shows a visible email + copy-email button;
   pricing buttons show a visible "Pilot request: <plan>" confirmation; demo buttons change
   visible UI state.
5. **Money logic** — a clear "How ClinicSlotHub makes money" section: monthly subscription,
   patients do not pay, Starter / Clinic Pro / Clinic Plus, no payment processed here.
6. **Buyer focus** — clinic / front desk / practice lead is the buyer. Patients reduced to
   a single compact line.
7. **Safety** — kept, compact, serious, not dominant.
8. **Design** — stronger first screen, large interactive board, premium teal, clear button
   hierarchy, no text desert, clean on desktop and mobile.

## Hard guardrails kept (unchanged)

No real patient database, no stored booking, no Stripe/checkout, no Supabase/Neon, no
SMS/WhatsApp, no SMTP/mail automation, no uploads, no medical advice/diagnosis, no real
patient data, no real clinic profiles, no fake customers/testimonials, no German product
pages, no new country landing pages, no external services. EN/FR/ES only.
