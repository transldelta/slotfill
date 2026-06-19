# Slotfill Emergency Product Briefing

**Status: COMMERCIAL / UX / FUNCTIONAL NO-GO → Healthcare Booking SaaS productization rebuild.**
_Internal document. Not public. Not indexed._

## Why the previous state was rejected

A video walkthrough by the owner showed two hard problems:

1. **Functional blocker — a live client-side exception.** The browser showed
   "Application error: a client-side exception has occurred." Green unit tests do
   not matter if the live page breaks on load or navigation.
2. **Commercial/UX weakness.** The site felt like a small static landing page, not
   like a real SaaS product. The product value for doctors, practices and clinics
   was not obvious, and the page looked empty.

## Root cause of the client-side exception

`app/[locale]/layout.tsx` rendered its **own** `<html>`, `<head>` and `<body>`
elements — in addition to the root layout `app/layout.tsx`, which already renders
`<html>`/`<body>`. This produced **nested, duplicated document tags**
(`<html><body><html><head><body>…`), which is invalid HTML. React then failed
hydration (errors #418 / #423: "Hydration failed because the initial UI does not
match what was rendered on the server" → "the entire root will switch to client
rendering"), which surfaced as the "client-side exception" overlay.

**Fix:** only the root layout renders `<html>`/`<body>`. The locale layout now
renders only `NextIntlClientProvider` + children, and `<html lang/dir>` is set per
locale via a small client effect (`components/LocaleHtmlLang.tsx`). No more nested
document tags, no hydration crash.

## Comparison principle: SuperSaaS (principle, not copy)

SuperSaaS is general-purpose online scheduling for many industries. We take the
*principle* of a complete, credible booking SaaS — clear structure, real use cases,
clear functions, clear pricing, clear booking logic, a full product presence — but
**do not copy** its texts, images, brand or its all-industries scope.

## Slotfill goal: a vertical Healthcare Booking SaaS

- Only for medical/healthcare providers: doctor's practices, dental practices,
  clinics, health centers, therapy centers, diagnostic centers.
- **Not** for hairdressers, yoga, sports classes, teachers, restaurants, hotels or
  general industries.
- Patients book or request appointments online.
- Practices/clinics show available times, receive appointment requests, and confirm
  or decline them.
- Practices/clinics pay a monthly SaaS subscription. Patients do not pay on the
  website. No Stripe/checkout is active.

## Decision

- Previous state = **NO-GO** (client-side exception + static-landing feel).
- Target = **Healthcare Booking SaaS productization rebuild**: fix the crash, make
  the homepage feel like a real SaaS (use cases, patient flow, provider flow,
  product previews), keep CTAs working, keep pricing clearly for practices/clinics,
  and keep all safety/market-scope/legal guardrails.

## Guardrails kept

No medical advice, no diagnosis, no emergency service, no medical record storage,
no file upload, no Stripe checkout, no DB/Supabase activation, no SMS/WhatsApp
automation. No Board/OS/Visibility/Medical-Tourism direction. EN/DE/FR/ES/PT only.
Availability in selected markets, subject to review; no targeting of EU/US/Canada/
UK/Australia; no poverty/emerging-market wording in public copy.
