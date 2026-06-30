# Reckon — Full Redesign Tracker

> Target aesthetic: **Stripe × Linear × Vercel** — generous whitespace, one accent colour (forest green), neutral grays, subtle borders, consistent 4/8 px spacing, smooth animations.

---

## Status legend
- `[ ]` not started  
- `[~]` in progress  
- `[x]` done  

---

## Phase 1 — Design Foundation

- [x] `globals.css` — refined colour tokens, spacing scale, new keyframes (route-bar, pulse-ring, logo-draw)
- [x] Root `layout.tsx` — SEO metadata (title template, OG, Twitter card, canonical, robots)
- [x] `next.config.ts` — security headers (CSP, HSTS, X-Frame, X-Content-Type, Referrer-Policy, Permissions-Policy)
- [x] `src/components/ui/ReckLogo.tsx` — SVG logo mark + wordmark
- [x] `src/components/ui/RouteLoader.tsx` — slim top progress bar triggered on navigation

---

## Phase 2 — Shell / Layout

- [x] `Sidebar.tsx` — logo, icon+label nav, mobile hamburger trigger, collapse on mobile, bottom user snippet
- [x] `Topbar.tsx` — page title breadcrumb, avatar with dropdown (profile / sign out), mobile menu icon
- [ ] `src/app/(dashboard)/layout.tsx` — wire mobile sidebar state, add `<RouteLoader />`

---

## Phase 3 — UI Primitives

- [x] `Button.tsx` — ripple effect, `ring-offset-paper`, consistent size tokens
- [x] `Input.tsx` — floating label variant, better error state, password toggle built-in
- [ ] `Badge.tsx` — new: status chips (income / expense / pending)
- [ ] `Skeleton.tsx` — reusable skeleton block + pulse variant
- [ ] `Avatar.tsx` — initials fallback, size variants

---

## Phase 4 — Dashboard Page

- [x] `KPICard.tsx` — trend arrow (up/down %), mini sparkline area, hover lift shadow
- [ ] `dashboard/page.tsx` — 12-col bento grid, recent transactions with category icon, spending ring chart inline
- [ ] `ImportPrompt.tsx` — illustrated empty-state with animated dashed border

---

## Phase 5 — Auth Pages

- [x] `(auth)/layout.tsx` — branded split-screen: left gradient panel with logo + tagline, right form card
- [ ] `LoginForm.tsx` — social divider, "remember me", show/hide password, better error banner
- [ ] `RegisterForm.tsx` — password strength meter

---

## Phase 6 — Feature Pages (quick wins)

- [ ] `transactions/page.tsx` — sticky filters bar, row hover, amount colour, category badge
- [ ] `budgets/page.tsx` — progress ring SVG per card, alert colour at 80 %
- [ ] `analytics/page.tsx` — chart grid, colour-consistent palette from tokens
- [ ] `upload/page.tsx` — drag-over border pulse, file preview row, progress steps
- [ ] `settings/page.tsx` — sectioned cards, danger zone red border

---

## Phase 7 — SEO & Meta

- [ ] `src/app/sitemap.ts` — dynamic sitemap
- [ ] `src/app/robots.ts` — robots file
- [ ] `public/favicon.svg` — SVG favicon from logo mark
- [ ] OG image route `app/opengraph-image.tsx` — Next.js OG image

---

## Phase 8 — Performance

- [ ] Dynamic import charts (`SpendingDonut`, `MonthlyBarChart`) — avoid shipping Recharts on initial load
- [ ] `next.config.ts` — `compress: true`, image domains, `optimizePackageImports`
- [ ] Font preload: `<link rel="preload">` for critical font subsets in `layout.tsx`
- [ ] Suspense wrappers on data-heavy page sections with skeleton fallback

---

## Phase 9 — Security Hardening

- [x] HTTP security headers in `next.config.ts`
- [ ] Audit: every Route Handler and Server Action re-calls `getCurrentUser()` (middleware bypass fix)
- [ ] Rate-limit `/api/upload` and `/api/reports` (in-memory for dev, Upstash for prod)
- [ ] SheetJS: sanitise parsed cell keys to mitigate prototype-pollution (`Object.create(null)` accumulator)
- [ ] `env.ts` — validate all `process.env` at startup with Zod; add `NEXTAUTH_SECRET` rotation docs
- [ ] Content-Security-Policy: lock `script-src`, `style-src`, add `nonce` for inline scripts

---

## Phase 10 — Accessibility

- [ ] All icon-only buttons get `aria-label`
- [ ] Chart components get `aria-label` summary
- [ ] Skip-to-content link in root layout
- [ ] Focus trap in mobile sidebar drawer
- [ ] Colour contrast audit (run with axe-core or similar)

---

## Design Tokens Reference (globals.css)

```
Brand accent:      --color-brand      #166534  (green-800 — deeper, richer)
Brand light:       --color-brand-sub  #dcfce7  (green-100)
Brand hover:       --color-brand-h    #15803d
Ink:               --color-ink        #0f172a  (slate-900)
Ink muted:         --color-ink-muted  #64748b  (slate-500)
Surface:           --color-surface    #ffffff
Surface raised:    --color-surface-r  #f8fafc  (slate-50)
Border:            --color-border     #e2e8f0  (slate-200)
Border strong:     --color-border-s   #cbd5e1  (slate-300)
Danger:            --color-danger     #dc2626
Danger bg:         --color-danger-bg  #fef2f2
Warning:           --color-warning    #d97706
Warning bg:        --color-warning-bg #fffbeb
Sidebar bg:        --color-sidebar    #0f172a  (slate-900)
```
