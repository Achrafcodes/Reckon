# CLAUDE.md — Reckon

Guidance for AI agents (and humans) working in this repository. Read this fully before writing code. Follow it over habit — several rules below exist specifically because the obvious/older approach is now wrong.

---

## Project

**Reckon** — an expense-tracking & financial-analytics web app. Users upload bank statements / expense spreadsheets (`.xlsx`, `.xls`, `.csv`); the app parses and auto-categorizes transactions, stores them in MongoDB, and renders an interactive analytics dashboard with budgets, insights, and PDF/Excel export.

Single full-stack **Next.js (App Router) + TypeScript** application — no separate backend service. Deployed to Vercel; database on MongoDB Atlas.

---

## Tech Stack (pinned expectations)

> Verify exact versions with `cat package.json`. Do not downgrade patterns to match older tutorials.

- **Next.js 16+** (App Router, Turbopack is the default bundler, React 19.2, React Compiler available)
- **TypeScript 5.x** in `strict` mode
- **React 19**
- **MongoDB Atlas** + **Mongoose 8+**
- **Zod** — validation + type inference (single source of truth for shapes)
- **Tailwind CSS v4** (CSS-first config via `@theme`, no `tailwind.config.js`)
- **shadcn/ui** + **Radix** for primitives (or hand-rolled `components/ui`)
- **Recharts** for charts
- **TanStack Query** for client-side server-state (interactive tables/filters only)
- **React Hook Form** + `@hookform/resolvers/zod` for forms
- **SheetJS (xlsx)** for spreadsheet parsing/writing
- **bcrypt** (or `bcryptjs`), **jose** for JWT signing/verification (Edge-compatible)
- **pino** for logging, **Vitest** + **Playwright** for tests

---

## Commands

```bash
# Dev (Turbopack default in Next 16 — no --turbopack flag needed)
npm run dev

# Type-check WITHOUT emitting — run this before claiming a task is done
npm run typecheck          # = tsc --noEmit

# Lint & format
npm run lint
npm run format

# Build (Turbopack; fails if a stray webpack config is detected)
npm run build

# Tests
npm run test               # vitest unit/integration
npm run test:e2e           # playwright

# Database
npm run seed               # seed system categories
```

**Definition of done for any change:** `npm run typecheck && npm run lint && npm run test` all pass. Never leave the tree with type errors.

---

## Architecture & Directory Layout

```
src/
├── app/
│   ├── (auth)/                 # login, register — route group, no app shell
│   ├── (dashboard)/            # protected app shell (sidebar + topbar)
│   │   ├── layout.tsx          # auth check + shell
│   │   ├── page.tsx            # dashboard
│   │   ├── transactions/
│   │   ├── budgets/
│   │   ├── analytics/
│   │   ├── reports/
│   │   └── settings/
│   ├── api/                    # Route Handlers — use ONLY for the cases below
│   │   ├── upload/route.ts     # multipart file upload (can't be a Server Action cleanly)
│   │   └── reports/route.ts    # streaming file downloads
│   ├── layout.tsx              # root layout, providers
│   └── globals.css             # @import "tailwindcss"; + @theme tokens
├── server/                     # server-only code (never imported by client)
│   ├── db/
│   │   ├── connect.ts          # cached Mongoose connection (serverless-safe)
│   │   └── models/             # User, Transaction, Category, Budget, Report, Notification, ImportBatch
│   ├── services/               # business logic (testable, framework-agnostic)
│   │   ├── import.service.ts
│   │   ├── categorization/     # Categorizer interface + KeywordCategorizer (AiCategorizer later)
│   │   ├── analytics.service.ts
│   │   ├── budget.service.ts
│   │   └── report.service.ts
│   ├── auth/                   # session/jwt helpers, getCurrentUser()
│   └── actions/                # Server Actions (mutations), one file per domain
├── lib/                        # isomorphic utilities (format, constants)
├── schemas/                    # Zod schemas — shared by client forms AND server validation
├── components/
│   ├── ui/                     # primitives
│   ├── layout/                 # Sidebar, Topbar, AppShell
│   ├── charts/                 # typed Recharts wrappers
│   └── <feature>/              # feature components
├── hooks/
├── types/                      # shared TS types (prefer Zod inference over hand-written)
└── proxy.ts                    # Next 16 middleware (was middleware.ts in v15)
```

Mark server-only modules with `import 'server-only'` at the top so they can never leak into a client bundle.

---

## Data Flow Rules (App Router — get this right)

Decide where logic lives in this order:

1. **Reads / initial page data → Server Components.** Fetch directly from the service/DB layer in `async` Server Components. Do **not** create an API route just to call it from `useEffect`. Do **not** fetch initial data in `useEffect`.
2. **Mutations (create/update/delete) → Server Actions** in `src/server/actions/`. Validate input with Zod inside the action, call a service, then `revalidatePath`/`revalidateTag`.
3. **Interactive client data (live filter/sort/paginate, optimistic UI) → TanStack Query** hitting a Server Action or a thin Route Handler.
4. **Route Handlers (`app/api/*/route.ts`) only for:** multipart file upload, streaming downloads (PDF/Excel), webhooks, or anything that genuinely needs raw `Request`/`Response`. Not for normal CRUD.

Keep Client Components as leaf nodes. Push `'use client'` as far down the tree as possible; a chart or a form is a client component, the page is not.

---

## Next.js 16 Gotchas (do not write v14/v15 patterns)

- **Async request APIs:** `cookies()`, `headers()`, and route `params`/`searchParams` are **async**. Always `const cookieStore = await cookies()` and `const { id } = await params`. Synchronous access is removed.
- **Middleware is now `proxy.ts`** (root or `src/`), exporting `proxy()` instead of `middleware()`. (If the repo is still on 15, it's `middleware.ts`/`middleware()` — match what's there.)
- **Turbopack is the default** for `dev` and `build`. Don't add a custom webpack config; a webpack config present will fail the build. Configure via `turbopack` options if needed.
- **Caching is explicit (opt-in).** Don't assume `fetch` is cached. Use `cacheLife`/`cacheTag` (now stable) and `revalidateTag` deliberately. For DB reads, use `unstable_cache`/Cache Components patterns the repo already uses.
- **React Compiler** may be enabled — don't hand-add `useMemo`/`useCallback` everywhere; let the compiler handle memoization unless profiling says otherwise.

---

## TypeScript Rules

- `strict: true`. **No `any`.** Use `unknown` + narrowing, or a Zod schema, at every untrusted boundary (request bodies, parsed spreadsheet cells, env).
- Derive types from Zod with `z.infer<typeof schema>` rather than maintaining parallel `interface`s.
- No non-null assertions (`!`) to silence the compiler — handle the null case.
- Type the return of every service function explicitly (public API of the module).
- Prefer discriminated unions for results (`{ ok: true; data } | { ok: false; error }`) over throwing in services where the caller must branch.
- Validate `process.env` once at startup with a Zod schema in `lib/env.ts`; import the parsed object, never `process.env.X` directly elsewhere.

---

## Data Layer Rules

- **Mongoose connection MUST be cached** across invocations (serverless reuses the module scope). Use the `globalThis`-cached promise pattern in `server/db/connect.ts`; never call `mongoose.connect` per-request. Connection exhaustion is the #1 serverless Mongo bug.
- **Money is never a `number`.** Use `Decimal128` (or integer minor units). Convert/format for display only at the edge with `Intl.NumberFormat`. Never run arithmetic on floats for currency.
- Store each transaction's **original currency**; convert to the user's base currency at read time. Never aggregate mixed currencies silently.
- Define indexes in the schema and keep them aligned with real queries: `{ user: 1, date: -1 }`, `{ user: 1, category: 1 }`, and the unique dedupe index `{ user: 1, dedupeHash: 1 }`.
- Every query is **scoped to the current user** (`user: session.userId`). There is no global transaction read. Treat a missing user scope as a security bug.
- Models live in `server/db/models`, are typed, and are imported only by services — controllers/actions/components never touch Mongoose directly.

---

## Auth & Security Rules

- **bcrypt cost ≥ 12.** Never log or store plaintext passwords. `passwordHash` field uses `select: false`.
- Sessions via **httpOnly, Secure, SameSite=Lax cookie** (same-origin app, so no cross-site cookie dance). Sign with `jose`. Short-lived access claim + rotating refresh, refresh hash stored server-side so sessions are revocable.
- **Middleware/`proxy.ts` is NOT an authorization boundary.** It's for cheap redirects only. There have been real Next.js middleware-bypass CVEs — always re-verify the session in the Server Component / Server Action / Route Handler that actually reads data (`const user = await getCurrentUser()` and 401 if absent). Never trust that "middleware already checked."
- **Validate every input at the server boundary with Zod** — request bodies, search params, form data, and every parsed spreadsheet cell. Treat all uploaded content as hostile.
- **File upload gate:** enforce max size, allow-list MIME types + extensions, parse in memory, reject formats you don't support. Note Vercel serverless body-size limits — chunk or stream large files. **SheetJS caveat:** the npm `xlsx` package has lagged on security patches (prototype-pollution / ReDoS); pin the latest, prefer the official SheetJS source, and sanitize parsed object keys to mitigate prototype pollution.
- `helmet`-equivalent headers via Next config / CSP; rate-limit auth and upload routes (Upstash or in-memory for dev).
- Never expose stack traces or internal error messages to the client. Central error mapping → safe envelope. Never log tokens, password hashes, or full PII.
- Secrets only in env (validated). `.env.example` is committed; `.env*` is git-ignored.

---

## Validation & Errors

- One Zod schema per shape in `src/schemas/`, reused by the client form (`zodResolver`) and the server action/handler. Don't duplicate validation logic.
- Server Actions return a typed result; surface field errors to RHF, not exceptions.
- Use a small typed error hierarchy (`AppError`, `NotFoundError`, `UnauthorizedError`, `ValidationError`) and map to HTTP status in Route Handlers.

---

## Domain Rules

- **Categorization is a strategy.** Code against the `Categorizer` interface. `KeywordCategorizer` is the deterministic default. `AiCategorizer` is added later behind a feature flag — it must never become a hard dependency of import. Keyword matching stays the baseline.
- **Imports are idempotent.** Compute a deterministic `dedupeHash` (user + date + amount + normalized merchant). Bulk-upsert; re-uploading the same statement creates no duplicates. Report `{ imported, skipped, errors }` transparently. Record an `ImportBatch` so an import can be reverted.
- **Budgets** are keyed `{ user, category, month: "YYYY-MM" }`. "Actual vs limit" is computed by aggregation, not stored. Crossing `alertThreshold` creates a `Notification`.
- **Analytics numbers must be reproducible** — if a test dataset is hand-summed, the endpoint must match. Compute via MongoDB aggregation pipelines, not in-app loops over full collections.
- **AI is optional, never core.** If/when the Claude API is used, it's a thin narrative layer over numbers already computed deterministically — generating prose insights, not being the source of truth.

---

## Code Style & Conventions

- Components: `PascalCase` files for components (`TransactionTable.tsx`), `camelCase` for utilities, `kebab-case` route folders.
- One component per file; co-locate small subcomponents only if private to the parent.
- Imports ordered: external → `@/` aliases → relative. Use the `@/` path alias, not deep `../../..`.
- Tailwind: use the `@theme` design tokens; avoid arbitrary one-off values when a token exists. No inline style objects for things Tailwind covers.
- Prefer named exports; default export only for Next.js route files (`page.tsx`, `layout.tsx`, `route.ts`) where required.
- Keep functions small and single-purpose. Business logic goes in `server/services`, not in components, actions, or route handlers (those stay thin).
- Accessibility: label inputs, keyboard-navigable dialogs/menus (Radix handles most), respect `prefers-reduced-motion`, charts have text/empty-state fallbacks.

---

## UI/UX Conventions

- Aesthetic target: Stripe / Linear / Vercel — generous whitespace, one accent color, neutral grays, subtle borders over heavy shadows, consistent 4/8px spacing scale.
- Every data view needs three states: **loading skeleton, empty state, error boundary.** No bare spinners on full pages; stream with Suspense where possible.
- Dark mode driven by a `class` strategy + tokens; persist preference in user settings (server) with a sensible cookie/system fallback to avoid flash.
- Mobile-first; sidebar collapses to a drawer on small screens.
- Charts: limit visible categories, coherent palette from tokens, tooltips, and an empty state when there's no data.

---

## Testing

- **Vitest** for services and the import parser (highest-risk code). Aim for meaningful coverage of: auth, spreadsheet parsing/normalization, categorization, analytics aggregations, money handling.
- **Playwright** for the critical user journey: register → upload → see dashboard → set budget → export.
- Mock the DB at the service boundary or use an in-memory/ephemeral Mongo for integration tests. Don't hit Atlas in CI.
- Add a regression test with any bug fix.

---

## Git & PR Conventions

- Conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `chore:`, `docs:`.
- Small, focused PRs. Don't mix refactors with features.
- CI must pass: `typecheck`, `lint`, `test`, `build`.
- Never commit secrets, `.env`, or generated `node_modules`. Update `.env.example` when adding a new env var.

---

## Do NOT

- ❌ Use `any`, non-null `!` to dodge the compiler, or `@ts-ignore` without a justified comment.
- ❌ Fetch initial page data in `useEffect`, or create an API route just to call it from the client when a Server Component would do.
- ❌ Treat `cookies()`/`headers()`/`params` as synchronous (they're async in Next 16).
- ❌ Rely on `proxy.ts`/middleware as the only auth check.
- ❌ Store money as `number` or do float math on currency.
- ❌ Call `mongoose.connect` per request, or run an unscoped (cross-user) query.
- ❌ Add a custom webpack config (Turbopack is default and will reject it).
- ❌ Write `tailwind.config.js`-style v3 config or `@tailwind base/components/utilities` directives (this is Tailwind v4).
- ❌ Put business logic in components, route handlers, or actions — it belongs in `server/services`.
- ❌ Make AI a required dependency of import or analytics.
- ❌ Log tokens, password hashes, or PII; expose stack traces to clients; or commit secrets.

---

## When Unsure

Prefer the boring, explicit, type-safe option. Ask before introducing a new dependency, a new top-level pattern, or anything that touches auth, money, or user-scoping. Match existing patterns in the file you're editing over inventing a new convention.
