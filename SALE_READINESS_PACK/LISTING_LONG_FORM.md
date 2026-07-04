# ClinicSlotHub — Long-Form Sale Memorandum

> **Status: DRAFT — internal only. Do not publish or send without explicit CEO approval.**
> For: Acquire.com, Flippa, or private buyer PDF.

---

## 1. Summary

| | |
|---|---|
| Asset | ClinicSlotHub — healthcare appointment-request SaaS |
| Live URL | https://clinicslothub.com |
| Stage | Pre-revenue asset sale (no customers, no revenue) |
| Asking price | €9,500 — open to serious offers |
| Stack | Next.js 14 (App Router), TypeScript, Tailwind, Supabase, Resend, Vercel |
| Languages | EN (default) / DE / FR / ES / PT public site |
| Payment status | Stripe scaffolded in code, deliberately **not** active |
| Included | Codebase, domain, deployment setup, handover documentation |

ClinicSlotHub is a live-deployed micro-SaaS for clinics and healthcare providers that need a simple appointment-request workflow.

Patients submit an appointment request online. The clinic or provider reviews it manually and decides whether to confirm. ClinicSlotHub is deliberately **not** built as an automatic booking engine: no automatic appointment confirmation, no patient accounts, and no patient payments on the website.

The product is best suited for selected international markets or clinic operators that prefer a controlled request-and-review workflow instead of instant booking.

## 2. Product walkthrough

**Public site (live):**
- Multilingual landing page (EN default; DE/FR/ES/PT fully localized; retired locales redirect cleanly)
- Appointment request form (`/[locale]/termin-buchen`): name, email, optional phone, preferred time window, optional note — validated with Zod, protected by honeypot, time-trap, rate limiting and spam-text checks; no file uploads
- Three-tier pricing page: Starter €29 / Practice €79 / Clinic €149 per month as **orientation pricing** — the site states explicitly that no payment is processed on the website and the final offer follows a review
- Blog (localized posts across all 5 locales), contact form, legal pages (Impressum, privacy policy, terms, DPA)
- Market-scope notices throughout: "selected international markets", "local legal review required"

**Request flow (verified live):**
1. Patient submits a request — stored in Supabase
2. Admin notification email is sent via Resend (awaited, not fire-and-forget)
3. **No automatic email to the patient on submission**
4. The practice reviews the request in the admin area and confirms or declines manually; only that manual action triggers a confirmation/decline email to the patient
5. An optional per-practice auto-confirm capability exists in code but is **off by default** and was not active in the live test

**Admin / practice area:**
- Booking-request management (confirm / decline / internal notes / test-vs-real separation)
- Contact-message management, feedback review, audit logs, go-live readiness agent
- Public self-service registration is deliberately disabled (kill-switch env flag); access is granted after manual review
- Auth-protected routes fail closed in middleware (no Supabase config → no access)

## 3. Technical quality

- **500+ passing automated tests** (`tsx --test`, 17 suites) including regression guards for security (register lock, auth protection), form-abuse protection, no-fake-claims wording, SEO foundation, legal market-scope wording, pricing consistency
- TypeScript throughout; App Router; static prerendering where possible
- SEO foundation: sitemap.xml (100 URLs across 5 locales), robots.txt with private-path disallow, canonical URLs, hreflang incl. x-default, Schema.org JSON-LD
- AI-crawler readiness: `llms.txt` and `ai-summary.md` served from the live domain, aligned with the request-and-review positioning
- Canonical-host middleware (vercel.app aliases 301 to the domain), retired-locale redirects
- Local guard tooling for the next owner: pre-commit/pre-push gates (identity, secret scan, fake-claim scan, lint, tests)

## 4. What is included in the sale

- Full GitHub repository (transfer)
- clinicslothub.com domain (transfer)
- Vercel deployment configuration (buyer redeploys on own account)
- Supabase schema/migrations and integration code (buyer creates own project)
- Resend integration code for admin notifications and post-review patient emails (buyer connects own account/domain)
- Stripe scaffold: checkout + signature-verified webhook routes with server-side price mapping — present but deliberately inactive
- Handover documentation (see `HANDOVER_CHECKLIST.md`, plus existing `docs/BUYER_HANDOVER.md` in the repo)
- Sale support: reasonable email support during transfer

## 5. What is NOT included / honest limitations

- **Pre-revenue: no paying customers, no active users, no revenue.** This is an asset sale, priced as such.
- No live payment processing; Stripe products/keys were never configured
- No compliance guarantees of any kind — the buyer must have privacy, legal and healthcare-regulatory fit reviewed for each target market before operating
- Legal pages are structured but flagged as drafts pending legal review; German version is the authoritative text
- Internal/auth areas currently have German UI and may need localization
- Email sender domain not yet verified with Resend (fallback sender in use during testing)
- No mobile app
- Repo README still reflects an earlier product iteration and should be refreshed by the buyer (public site and sale documents reflect the current request-and-review positioning)

## 6. Ideal buyer

- An operator or small studio targeting healthcare providers in selected international markets
- Someone who wants a legally cautious request-and-review workflow rather than an instant-booking engine
- Technical enough to redeploy Next.js + Supabase + Resend with their own accounts, or with access to a developer for a weekend-sized setup

## 7. Deal terms

- Asking €9,500, open to serious offers
- Escrow or marketplace-mediated transfer preferred
- Handover: repo transfer, domain transfer, guided redeploy checklist, 30 days of reasonable email support

---

*All statements in this memorandum are limited to what is verifiable in the repository, the automated test suite, and the live deployment. No revenue, customer, traffic or compliance claims are made.*
