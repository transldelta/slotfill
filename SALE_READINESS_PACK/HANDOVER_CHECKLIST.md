# Handover Checklist — ClinicSlotHub Asset Sale

> Sequence for a clean, low-risk transfer. Payment via escrow/marketplace before any transfer step.

---

## 0. Before transfer (seller)

- [ ] Confirm payment secured (escrow or marketplace-mediated)
- [ ] Final `npm run lint && npm run build && npm test` green on `main`
- [ ] Confirm no secrets, no `.env*` files, no personal data in the repository (pre-commit gates enforce this)
- [ ] Export/hand over only what is listed below — nothing account-bound

## 1. GitHub repository

- [ ] Transfer repository `transldelta/slotfill` to buyer's GitHub account (or deliver a clean clone/bundle)
- [ ] Buyer note: technical project name is `slotfill`; public brand "ClinicSlotHub" is configured centrally in `lib/brand.ts` (white-label friendly)
- [ ] Buyer installs local guard hooks: `npm run claude:install-hooks` (optional but recommended)

## 2. Domain

- [ ] Transfer clinicslothub.com to buyer's registrar account (auth code / registrar push)
- [ ] Buyer points DNS to their own Vercel project

## 3. Vercel

- [ ] Buyer creates own Vercel project and imports the repo (seller's Vercel account is NOT transferred)
- [ ] Buyer sets `NEXT_PUBLIC_APP_URL=https://clinicslothub.com` and connects the domain
- [ ] Middleware canonical-host redirect already targets clinicslothub.com — no code change needed

## 4. Supabase

- [ ] Buyer creates own Supabase project (choose region appropriate for their target market and privacy setup)
- [ ] Apply schema/migration scripts from the repo
- [ ] Buyer sets `SUPABASE_URL` / `SUPABASE_ANON_KEY` (+ service key where required) in their Vercel env
- [ ] No production database is transferred — no real patient data exists; buyer starts clean

## 5. Resend (email)

- [ ] Buyer creates own Resend account and verifies their own sender domain
- [ ] Buyer sets `RESEND_API_KEY` and `RESEND_FROM_EMAIL`
- [ ] Without a key, the app degrades safely (no email sent, no crash) — verified behavior

## 6. Stripe (deliberately off)

- [ ] Stripe code remains scaffolded/off — no keys are handed over because none exist
- [ ] If the buyer later activates payments: create own Stripe account, products and price IDs, set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*` — **only after their own legal/compliance review**

## 7. Environment variables

- [ ] Repo contains no secrets; example/env documentation files in the repo list every variable with purpose
- [ ] Buyer sets ALL keys fresh in their own accounts; seller keys are never shared and will be rotated/deleted after sale

## 8. Admin access

- [ ] Public self-service registration is disabled by design (`ENABLE_PUBLIC_SIGNUP` kill-switch)
- [ ] Buyer creates their own admin/practice account directly in their own Supabase (documented in repo docs)
- [ ] Seller demo/test accounts are not transferred

## 9. Buyer responsibilities (acknowledged in writing at sale)

- [ ] Privacy/legal/compliance review for every target market before operating (no guarantees are sold)
- [ ] Update legal pages with buyer's own operator identity (Impressum, privacy contact)
- [ ] Refresh repo README (still reflects an earlier product iteration)
- [ ] Optional: localize internal/auth areas (currently German UI)

## 10. Post-transfer (seller)

- [ ] Remove own Vercel project / disconnect domain after buyer's deploy is live
- [ ] Rotate/delete all personal API keys (Supabase, Resend) used during development
- [ ] Reasonable email support during agreed window (suggested: 30 days)
