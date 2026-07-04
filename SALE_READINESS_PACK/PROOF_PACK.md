# Proof Pack — ClinicSlotHub

> Purpose: every claim in the sale listing maps to verifiable evidence.
> Rule: if it is not on this list, it is not claimed.

---

## Verifiable by anyone (public)

| Claim | Evidence |
|---|---|
| Live domain | https://clinicslothub.com — canonical host, vercel.app aliases 301-redirect to it |
| Multilingual public site EN/DE/FR/ES/PT | /en, /de, /fr, /es, /pt all serve localized pages; EN is the default (unprefixed URLs redirect to /en) |
| Request-and-review positioning live | Homepage and booking page state manual confirmation by the practice; no instant-booking wording |
| Pricing page live | /en/pricing shows Starter €29 / Practice €79 / Clinic €149 with explicit "no payment is processed on this website" and "final offer after review" |
| AI-crawler readiness | https://clinicslothub.com/llms.txt and /ai-summary.md are served and match the request-and-review positioning |
| Sitemap / robots prepared | /sitemap.xml (100 URLs, 5 locales × pages + blog posts), /robots.txt with private paths disallowed and sitemap reference; ready for Google Search Console submission |
| Legal page structure | /en/impressum, /en/datenschutz, /en/agb, /en/avv reachable in all 5 locales; dated July 2026 |

## Verifiable in the repository (buyer due diligence)

| Claim | Evidence |
|---|---|
| 500+ passing tests | `npm test` → 501 pass / 0 fail in the latest reported run (tsx --test, 17 suites), including security, form-abuse, no-fake-claims, SEO and legal-scope guards; buyer can re-run during due diligence |
| Form protection | `lib/form-abuse.ts` + guards: honeypot, time-trap, rate limit, spam-text check; no file uploads |
| No automatic patient email on submission | `app/termin-buchen/actions.ts`: submit stores the request and calls `sendBookingAdminNotification` only; patient emails require manual admin confirm/decline |
| Auto-confirm off by default | `lib/auto-confirm.ts`: runs only if `practices.auto_confirm_bookings = true` plus slot/conflict/blocked-time checks; default is false |
| Stripe deliberately inactive | `lib/stripe.ts` returns null without `STRIPE_SECRET_KEY`; webhook route rejects unsigned calls (400) when no webhook secret is configured; no keys in repo |
| Public signup disabled | `ENABLE_PUBLIC_SIGNUP` kill-switch (fail-closed) + register page redirects to contact; enforced by tests |
| Auth fail-closed | `middleware.ts`: /admin and /dashboard redirect to login on any auth/config error |
| No secrets in repo | Secret scan runs in pre-commit gate; tracked files scanned (317 files, clean at last run) |

## Owner-verified events (documented, screenshots to be provided by owner)

| Claim | Evidence source |
|---|---|
| Live test request submitted and passed | `docs/GO_LIVE_SAFETY_AUDIT.md` (audit dated 2026-06-10) |
| Admin notification email received | Same audit: booking-request admin notification "Live ✓"; screenshot to be added per `SCREENSHOT_CHECKLIST.md` (redact addresses) |
| No automatic patient mail in live test | Code path (above) + audit flow table: patient confirm/decline emails fire only after admin click |
| Post-review patient emails work | Audit: confirmation and decline emails after admin action "Live ✓" |

## Explicit non-claims

The following are **not** claimed anywhere and must not appear in any listing: revenue, customers, active users, traffic figures, guaranteed compliance (GDPR/HIPAA or otherwise), legal clearance for any market, instant booking, automatic confirmation as default, active patient payments, production-readiness for every healthcare market.
