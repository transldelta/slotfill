# Risk Disclosure — ClinicSlotHub Asset Sale

> Shown to serious buyers before closing. Honesty here protects the seller legally and builds trust.

---

## Commercial status

- **Pre-revenue.** No revenue has ever been generated.
- **No customers.** No paying clinics, no signed agreements, no active users.
- **No traffic guarantees.** SEO/AI foundations are prepared, but no ranking, traffic or lead volume is promised.

## Payment

- **No live payment processing.** Stripe code is scaffolded and deliberately inactive; no Stripe account, products or keys are part of the sale. Activation is entirely the buyer's project.

## Compliance and legal

- **Not compliance-guaranteed.** No GDPR, HIPAA or other regulatory conformity is warranted. Legal texts in the repo are structured drafts (German version authoritative) and are flagged for professional legal review.
- **Legal adaptation required by buyer** for every market they operate in: privacy law, healthcare-sector rules, consumer-information duties, email/consent rules, operator identity in legal pages.
- **Market scope by design:** the public site states "selected international markets" and "local legal review required". The buyer must not remove these caveats without their own legal basis.

## Product scope (by design, not defects)

- **No medical advice.** The product is a scheduling-request tool, not a medical service.
- **No emergency service.** The site says so explicitly; this must remain.
- **No automatic confirmation by default.** Requests are confirmed manually by the practice. An optional auto-confirm capability exists in code (off by default); enabling it is the buyer's product/legal decision.
- **No patient payments, no patient accounts** on the website.

## Technical / operational

- Email sender domain not yet verified with Resend (fallback sender used during testing); buyer must set up their own email domain.
- Internal/auth areas currently have German UI.
- Repo README reflects an earlier product iteration and needs a refresh by the buyer.
- Third-party dependencies (Next.js 14, Supabase SDK, etc.) will require normal ongoing maintenance.
- Free-tier infrastructure (Vercel/Supabase) is sufficient for the current state but not guaranteed for scale.

## What the buyer receives despite these limits

A live-deployed, tested, multilingual request-and-review SaaS with a defensible cautious design, a real domain, 500+ green tests, documented handover — and an honest paper trail (this document) instead of inflated claims.
