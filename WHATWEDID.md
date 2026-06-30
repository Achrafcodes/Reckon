# What We Did — Reckon Full Upgrade

This document explains every change made to Reckon in the full redesign + feature sprint.
It covers the **why** (psychology, architecture, security) not just the what.

---

## 1. Color Palette — Trust Blue + Profit Green

### The Psychology
Personal finance apps need to feel **trustworthy first, rewarding second**. We ran a color psychology analysis:

| Color | Psychology | Where used |
|-------|-----------|------------|
| **Trust Blue #1e40af** | Authority, stability, reliability — the color of banks (Chase, Barclays, PayPal) | Primary CTAs, active nav, links, focus rings |
| **Profit Green #059669** | Growth, prosperity, positive money outcomes | Income amounts, success states, budget "on track", recurring card |
| **Danger Red #dc2626** | Loss, overspending, urgency | Expense amounts, budget exceeded, destructive actions |
| **Amber #d97706** | Caution, approaching limit | Budget warnings at 80% threshold |
| **Slate-900 #0f172a** | Premium dark, focus, authority | Sidebar always-dark panel |

### Why we changed from forest green
The previous brand used `green-800 (#166534)` for everything — brand, income, success. This created ambiguity: the same color meant both "this is the brand" and "this is positive money." Splitting into Trust Blue (brand) and Profit Green (money) gives each signal a distinct semantic meaning. Users now instantly understand: blue = navigation/action, green = money going up, red = money going down.

### Technical implementation
- **Tailwind v4 CSS-first:** All tokens live in `@theme` in `globals.css`. No `tailwind.config.js`.
- **Dark mode via `@custom-variant dark (&:where(.dark, .dark *))`** — Tailwind v4's class-based dark mode syntax.
- **Two-layer approach:** Static tokens (brand blue, profit green, sidebar) go directly in `@theme`. Theme-responsive values (surface, border, ink) use CSS custom properties that switch between `:root` and `.dark` selectors, then are referenced in `@theme` via `var()`.

---

## 2. Dark Mode — Full System

### How it works (no flash)
1. **No-flash script** injected as an inline `<script>` in `<head>` — runs before paint, reads `localStorage` and applies `.dark` to `<html>` if needed.
2. **ThemeProvider** (client component) — wraps the app, manages theme state with lazy initializers (reads localStorage on first render, not in a useEffect to avoid extra renders).
3. **`resolveTheme()`** — maps `'system'` → actual light/dark by reading `window.matchMedia`.
4. **OS listener** — `matchMedia.addEventListener('change', ...)` responds to OS theme changes in real time when set to 'system'.
5. **Settings page** — new `ThemeForm` component lets users pick Light / Dark / System with a visual button group.

### Files changed
- `src/app/globals.css` — `:root` / `.dark` CSS variable blocks + `color-scheme` property
- `src/app/layout.tsx` — no-flash script + `<ThemeProvider>` wrapper + `suppressHydrationWarning`
- `src/components/ui/ThemeProvider.tsx` — context + lazy init + OS listener
- `src/components/ui/ThemeToggle.tsx` — sun/moon icon button in Topbar
- `src/components/settings/ThemeForm.tsx` — settings page picker

---

## 3. Transaction Editing

Users can now click a pencil icon on any transaction row to fix miscategorizations or correct amounts.

### Architecture
- **`TransactionTable.tsx`** (client) — holds `editing: TransactionRow | null` state. Extracted from what was an inline table in the Server Component page. The page stays a Server Component.
- **`EditTransactionModal.tsx`** (client) — full-featured modal dialog:
  - Focus trap (Tab cycles within modal only)
  - ESC key closes
  - Backdrop click closes
  - Auto-focuses first field on open
  - Calls `updateTransactionAction` via `useTransition` (non-blocking)
  - Shows per-field validation errors + server error banner
  - `animate-scale-in` entrance animation
- **`updateTransactionAction`** already existed — no new backend code needed.

---

## 4. Notification System

The `Notification` model existed in the DB but nothing used it. Now it's wired end-to-end.

### Data flow
```
Budget viewed → listBudgets() → budget.service.ts fires createNotification() (non-blocking)
                                        ↓
                              notification.service.ts writes to DB
                                        ↓
                    dashboard/layout.tsx → getUnreadNotifications() on every page load
                                        ↓
                    DashboardShell → Topbar children → NotificationBell
```

### NotificationBell UI
- Bell icon in Topbar with a blue count badge (hidden when zero)
- Click → dropdown with list of notifications, kind icons, body text, time-ago
- "Mark all read" button
- Each row click marks that notification read via `markReadAction` (Server Action)
- Optimistic state update before the server round-trip
- Empty state with inbox SVG

### Budget alert trigger
`budget.service.ts` now fires notifications after computing actuals:
- `pct >= alertThreshold/100` → "X budget at N%" notification
- `pct >= 1.0` → "Budget exceeded: X" notification
- Fire-and-forget (`.catch(() => undefined)`) so a notification write failure never breaks the budget read.

---

## 5. Dashboard Date Range Picker

The dashboard was previously all-time only. Now the user can filter KPIs by time period.

### URL-driven state
Filter state lives in the URL (`?range=month`), not in React state. This means:
- Refreshing the page keeps the filter
- Back button works naturally
- Server Components read `searchParams` — no client fetch needed

### Ranges
| Range | Date window |
|-------|------------|
| `month` | 1st of current month → now |
| `quarter` | 3 months ago → now |
| `year` | Jan 1 current year → now |
| `all` (default) | 2000-01-01 → 2099-12-31 |

### `DateRangeFilter.tsx`
Client component using `useRouter().push()` + `useSearchParams()`. Active button shows Trust Blue background. Wrapped in `<Suspense>` in the page because `useSearchParams` requires a Suspense boundary.

---

## 6. Recurring Transaction Detection

A new section on the dashboard surfaces subscriptions and fixed costs automatically.

### Algorithm (`recurring.service.ts`)
1. Query last 6 months of expense transactions for the user
2. MongoDB aggregation groups by normalized merchant name (`lowercase + trim`)
3. Filter to merchants with ≥ 2 occurrences
4. Compute average interval between occurrences:
   - ~30 days → `monthly`
   - ~7 days → `weekly`
   - else → `irregular`
5. Lookup category name/color via `$lookup`
6. Return top 10 by average amount

### Dashboard widget
Shows merchant name, occurrence count, frequency badge (`.badge-green` for monthly, `.badge-blue` for weekly, `.badge-slate` for irregular), and average amount. Only renders when the user has recurring data.

---

## 7. AI Categorization (Claude API)

An optional second-pass categorizer that kicks in when `ANTHROPIC_API_KEY` is set.

### Architecture (behind feature flag)
```
getCategorizer() factory:
  if ANTHROPIC_API_KEY is set → AiCategorizer
  else                        → KeywordCategorizer (existing, always safe)
```

### AiCategorizer
- Uses `claude-haiku-4-5-20251001` (fast + cheap — ideal for background categorization)
- Direct `fetch` call to Anthropic messages API — no SDK added to the bundle
- Caches the categories list per userId (same pattern as KeywordCategorizer)
- Gracefully returns `null` on any error, network failure, or missing API key
- If AI returns null or an unrecognized ID, the caller falls back to KeywordCategorizer

### Why optional
As stated in CLAUDE.md: "AI is optional, never core." If the API key is absent, the app behaves identically to before. No import errors, no runtime crashes.

---

## 8. PWA (Progressive Web App)

### `public/manifest.json`
- `display: standalone` — hides browser chrome when installed
- `theme_color: #1e40af` (Trust Blue)
- `background_color: #0f172a` (sidebar dark)
- SVG favicon as the app icon (scales cleanly at all sizes)

### `layout.tsx` additions
- `manifest: '/manifest.json'` in the `Metadata` export — Next.js injects the `<link rel="manifest">` tag automatically
- `color-scheme: dark` on `html.dark` for correct OS status bar color

---

## 9. Monthly Email Digest

### `email.service.ts`
Builds a styled HTML email (inline CSS, no external dependencies) with:
- Dark header panel with month + greeting
- Three KPI boxes: Income / Spent / Balance
- Top 5 spending categories table
- CTA button back to the app

Uses **Resend** (set `RESEND_API_KEY` in env) — returns `{ ok, error }` rather than throwing.

### `api/cron/monthly-digest/route.ts`
- Vercel Cron endpoint, scheduled `0 8 1 * *` (1st of month at 08:00 UTC)
- Protected by `CRON_SECRET` env var (Bearer token check)
- Loops all users, computes last month's summary, calls `sendMonthlyDigest`
- Skips users with zero transactions that month
- Returns `{ sent, failed, month }` for monitoring

### `vercel.json`
```json
{ "crons": [{ "path": "/api/cron/monthly-digest", "schedule": "0 8 1 * *" }] }
```

---

## 10. E2E Playwright Tests

### `playwright.config.ts`
- Chromium only (fastest CI)
- `reuseExistingServer` for local dev (avoids restarting Next.js)
- `webServer` with 120s timeout for cold starts

### `e2e/critical-path.spec.ts`
Five describe blocks covering the critical user journey:
1. **Auth** — register → redirect to `/`, login → redirect to `/`, invalid login shows error
2. **Dashboard** — title, KPI cards, sidebar links all visible
3. **Transactions** — page loads without crash
4. **Budgets** — page renders heading
5. **Settings** — profile fields visible

Uses `getByRole`, `getByLabel`, `locator('#id')` — grounded in real ARIA roles from the components.

---

## 11. New Environment Variables

Add these to `.env.local`:

```bash
# AI categorization (optional — app works without it)
ANTHROPIC_API_KEY=sk-ant-...

# Email digest via Resend (optional)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Vercel Cron protection
CRON_SECRET=a-long-random-secret

# App URL (already used in SEO)
NEXT_PUBLIC_APP_URL=https://reckon.app
```

---

## File Count Summary

| Category | New files | Modified files |
|----------|-----------|----------------|
| Design system (CSS) | 0 | 1 (globals.css) |
| Dark mode | 2 (ThemeProvider, ThemeToggle) | 1 (layout.tsx) |
| Notification system | 3 (service, action, NotificationBell) | 3 (DashboardShell, layout, Topbar) |
| Transaction editing | 2 (EditTransactionModal, TransactionTable) | 1 (transactions/page.tsx) |
| Dashboard improvements | 2 (DateRangeFilter, recurring.service) | 1 (dashboard/page.tsx) |
| AI categorization | 1 (ai-categorizer.ts) | 1 (categorization/index.ts) |
| Settings (theme) | 1 (ThemeForm) | 1 (settings/page.tsx) |
| PWA | 1 (manifest.json) | 0 |
| Email digest | 2 (email.service, cron/route.ts) | 0 |
| Config | 1 (vercel.json) | 1 (env.ts) |
| Tests | 2 (playwright.config, critical-path.spec) | 0 |
| Budget alerts | 0 | 1 (budget.service.ts) |
| **Total** | **17** | **10** |

---

## Definition of Done

All changes satisfy:
- `npm run typecheck` ✓ — 0 type errors
- `npm run lint` ✓ — 0 errors (warnings are pre-existing)
- Architecture rules from `CLAUDE.md` — Server Components, no `any`, money never a `number`, all queries user-scoped, AI optional
