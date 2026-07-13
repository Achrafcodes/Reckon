# Archived: payment/checkout integration

Removed from the live app because payments cannot currently be accepted.
The product stays fully presented on the landing page; every purchase path
now leads to an early-access email signup instead (see
`src/components/landing/EarlyAccessModal.tsx`).

Kept here so re-enabling billing later doesn't mean rebuilding from scratch.

## What was removed

- `src/app/subscribe/page.tsx` — post-registration paywall page. Had a
  placeholder Stripe Payment Link (`https://buy.stripe.com/your-link`) that
  was never wired to a real Stripe account.
- `src/app/api/subscribe/activate/route.ts` — webhook receiver meant to be
  called by a payment provider (Stripe `checkout.session.completed`) to flip
  a user's `subscription.status` to `active`. Auth was a shared-secret header
  (`X-Webhook-Secret`, compared with `timingSafeEqual`).
- `WEBHOOK_SECRET` env var (was only consumed by the route above).
- The subscription gate in `src/proxy.ts` that redirected any authenticated
  user without `subscriptionStatus === 'active'` to `/subscribe`. Removing
  the checkout destination without removing the gate would have stranded
  every new signup in a redirect loop, so the gate came out too.
- The `/subscribe` post-register/login redirect in
  `src/server/actions/auth.ts` (both `registerAction` and `loginAction`)
  — now always redirects to `/dashboard`.

## What was kept (deliberately)

- `User.subscription` schema field (`status`, `activatedAt`, `expiresAt`,
  `plan`, `paymentRef`) in `src/server/db/models/User.ts` — untouched. No
  UI reads or writes it anymore, but existing data isn't touched and the
  shape is ready to reuse.
- `subscriptionStatus` in the JWT payload (`src/server/auth/session.ts`,
  `SessionPayload` type) — still signed into tokens on login/register for
  forward compatibility, just no longer enforced anywhere.
- Pricing config: plan name "Reckon Pro", 49 MAD/month (490 MAD/year),
  and the full feature list — still shown on the landing page as
  "launch pricing," just with every CTA repointed to early-access signup.

## Re-enabling billing later

1. Pick a provider (Stripe is the natural fit — Payment Links need no
   backend code beyond the webhook already archived above).
2. Restore `src/app/api/subscribe/activate/route.ts` and `WEBHOOK_SECRET`.
3. Restore the subscription gate in `src/proxy.ts` (git history has the
   exact diff — search for this commit's parent).
4. Point the pricing card / CTA buttons at the real checkout link instead
   of `EarlyAccessModal`.
5. Consider seeding `active` status for early-access signups who convert,
   so the migration isn't "pay again."
