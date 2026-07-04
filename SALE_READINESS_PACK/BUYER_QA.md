# Buyer Q&A — ClinicSlotHub (honest answers)

> **Status: internal preparation. Use these answers verbatim or shortened — never promise more.**

---

**Q: Does the product have customers?**
A: No. There are no paying customers and no active users. This is a pre-revenue asset sale of a live-deployed product.

**Q: Does it have revenue?**
A: No. Zero revenue to date. The pricing page shows orientation pricing (€29/€79/€149 per month), but no payment has ever been processed.

**Q: Is Stripe active?**
A: No. Stripe integration code exists (checkout route with server-side price mapping, signature-verified webhook route), but it is deliberately inactive: no Stripe keys are configured, no products were created, and the pricing CTA routes to the contact form instead. Activating payments is the buyer's decision after their own legal review.

**Q: What has been live-tested?**
A: The public request flow on clinicslothub.com: a test appointment request was submitted through the public form, the admin notification email arrived via Resend, and no automatic email was sent to the patient on submission. Confirmation/decline emails to patients are triggered only by a manual admin action; these flows were also live-tested (documented in `docs/GO_LIVE_SAFETY_AUDIT.md`). Additionally, 500+ automated tests run green on every commit.

**Q: Is there patient data?**
A: No real patient data. Test submissions are flagged as test data (`is_test`) and separated in the admin views. The buyer starts with their own fresh Supabase project; no production database with personal data is transferred.

**Q: What must I review legally before operating?**
A: Everything relevant to your target market: privacy law (the current legal texts are GDPR-oriented drafts, German version authoritative), healthcare-sector rules for appointment handling, consumer-information duties, and email/consent rules. The product makes no compliance guarantees — the deliberately cautious request-and-review design (manual confirmation, no patient payment, no health data requested in the form) is a starting point, not a legal clearance.

**Q: What is included in the price?**
A: Full code repository, the clinicslothub.com domain, deployment configuration, Supabase schema/migrations, Resend and Stripe integration code (Stripe inactive), the multilingual public site, the test suite, the AI/SEO readiness files, and documented handover with reasonable email support during transfer.

**Q: What is NOT included?**
A: Customers, revenue, traffic guarantees, running third-party accounts (Vercel/Supabase/Resend/Stripe — you create your own), API keys or secrets of any kind, legal review or compliance certification, a mobile app, and ongoing development after the support window.

**Q: How does handover work?**
A: See `HANDOVER_CHECKLIST.md`. In short: escrow/marketplace-mediated payment → GitHub repo transfer → domain transfer → buyer redeploys on own Vercel with own Supabase/Resend accounts and own environment variables → seller available for reasonable email support (suggested: 30 days). No secrets are stored in the repository; the buyer sets all keys fresh.

**Q: Why are you selling?**
A: Portfolio focus. The build phase is complete; market entry in the healthcare niche needs a committed operator.

**Q: Can it do instant booking?**
A: By design, the default is request-and-review with manual confirmation. A per-practice auto-confirm capability exists in code (with slot, conflict and blocked-time checks) but is off by default and was not active in the live test. Whether and where to enable it is the buyer's product and legal decision.
