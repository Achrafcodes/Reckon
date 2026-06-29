# Reckon
### Expense Tracking & Financial Analytics — Software Architecture & Product Plan (v1.0)

A production-oriented application that ingests bank statements / expense spreadsheets, auto-categorizes transactions, persists them to MongoDB, and surfaces an interactive analytics dashboard. Designed as a portfolio centerpiece with a clean path to a multi-tenant SaaS.

> **Note:** this document captures the original MERN (React + Vite + Express) design. The project has since pivoted to a single full-stack **Next.js + TypeScript** app (see `CLAUDE.md`). The schemas, API surface, domain rules, roadmap, and best practices below all still apply; the deployment topology and data-flow layer differ under Next.js (Server Components / Server Actions / Route Handlers instead of a separate Express service, and a single Vercel deploy instead of Vercel + Render).

---

## Table of Contents
1. [Software Architecture](#1-software-architecture)
2. [Database Schema](#2-database-schema)
3. [API Documentation](#3-api-documentation)
4. [Folder Structure](#4-folder-structure)
5. [UI Page List](#5-ui-page-list)
6. [Component Hierarchy](#6-component-hierarchy)
7. [Feature Roadmap](#7-feature-roadmap)
8. [Development Timeline](#8-development-timeline)
9. [Best Practices](#9-best-practices)
10. [Future Improvements](#10-future-improvements)

---

## 1. Software Architecture

### 1.1 High-level topology

```
                          ┌──────────────────────────────┐
                          │            Browser            │
                          │  React + Vite SPA (Vercel)    │
                          │  - Auth context / route guard │
                          │  - Axios client (interceptors)│
                          │  - Recharts dashboard         │
                          └───────────────┬───────────────┘
                                          │ HTTPS / JSON
                                          │ Bearer access token (memory)
                                          │ refresh token (httpOnly cookie)
                                          ▼
                          ┌──────────────────────────────┐
                          │      Express API (Render)     │
                          │  ┌────────────────────────┐   │
                          │  │  Middleware pipeline    │   │
                          │  │  helmet · cors · rate-  │   │
                          │  │  limit · auth · validate│   │
                          │  └───────────┬────────────┘   │
                          │  ┌───────────▼────────────┐   │
                          │  │  Routes → Controllers   │   │
                          │  └───────────┬────────────┘   │
                          │  ┌───────────▼────────────┐   │
                          │  │  Service layer          │   │
                          │  │  - ImportService        │   │
                          │  │  - CategorizationService│   │
                          │  │  - AnalyticsService     │   │
                          │  │  - BudgetService        │   │
                          │  │  - ReportService        │   │
                          │  └───────────┬────────────┘   │
                          │  ┌───────────▼────────────┐   │
                          │  │  Mongoose models (DAL)  │   │
                          │  └───────────┬────────────┘   │
                          └──────────────┼────────────────┘
                                         ▼
                          ┌──────────────────────────────┐
                          │     MongoDB Atlas (cluster)   │
                          │  users · transactions ·       │
                          │  budgets · categories ·       │
                          │  reports · notifications      │
                          └──────────────────────────────┘
```

### 1.2 Architectural principles

- **Layered backend (Route → Controller → Service → Model).** Controllers stay thin (HTTP concerns only); business logic lives in services; data access lives in Mongoose models. This keeps the code testable and lets you swap implementations (e.g. keyword categorizer → AI categorizer) without touching controllers.
- **Strategy pattern for categorization.** A single `Categorizer` interface with a `KeywordCategorizer` implementation today and a future `AiCategorizer`. The service depends on the interface, not the implementation, so AI becomes a config flag rather than a rewrite.
- **Stateless API.** No server-side session store. Auth is JWT-based so the API scales horizontally and survives Render's ephemeral filesystem and cold starts.
- **In-memory file processing.** Uploaded spreadsheets are parsed in memory and discarded — never written to disk. This sidesteps Render's ephemeral disk entirely and removes a class of file-handling vulnerabilities.
- **Idempotent imports.** Each imported transaction gets a deterministic content hash (user + date + amount + normalized description). Re-uploading the same statement won't create duplicates.
- **Money is never a float.** Store amounts as integer minor units (e.g. cents) or `Decimal128`. Never `Number` for currency — IEEE-754 rounding will corrupt totals over thousands of rows.

### 1.3 Request lifecycle (upload example)

1. Client POSTs `multipart/form-data` to `/api/v1/upload` with the access token.
2. `helmet` → `cors` → `rateLimit` → `authGuard` → `multer` (memory storage, size + MIME gate) → controller.
3. Controller hands the buffer to `ImportService.parse(buffer, mimetype)`.
4. `ImportService` uses SheetJS to read rows, normalizes columns (Date / Description / Amount / Type), and validates each row.
5. Each normalized row passes through `CategorizationService.categorize(description)`.
6. `ImportService` computes the dedupe hash, bulk-upserts via `Transaction.bulkWrite`, and returns a summary `{ imported, skipped, errors }`.
7. Controller responds `201` with the summary; the client invalidates its dashboard query cache.

### 1.4 Cross-origin auth note (important gotcha)

Frontend on Vercel and API on Render are **different origins**. For the httpOnly refresh-token cookie to work:
- Cookie must be set with `SameSite=None; Secure; HttpOnly`.
- CORS must specify the exact frontend origin (not `*`) and `credentials: true`.
- Axios must send `withCredentials: true`.
- The access token lives in memory (a React ref/context), not `localStorage`, to reduce XSS token theft. On refresh/reload, the app silently calls `/auth/refresh` to mint a new access token from the cookie.

---

## 2. Database Schema

MongoDB collections with Mongoose. All money fields use `Decimal128` (or integer minor units if you prefer); all collections carry `timestamps: true`.

### 2.1 User

```js
const userSchema = new Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  settings: {
    baseCurrency: { type: String, default: 'MAD' },   // ISO 4217
    theme:        { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    locale:       { type: String, default: 'en' },
  },
  refreshTokenHash: { type: String, select: false },   // rotated on each refresh
  lastLoginAt:      { type: Date },
}, { timestamps: true });
```

### 2.2 Category

System categories are seeded once; users can add custom ones. Keyword rules drive auto-categorization and are editable per user.

```js
const categorySchema = new Schema({
  user:     { type: ObjectId, ref: 'User', index: true, default: null }, // null = system/global
  name:     { type: String, required: true },        // e.g. "Groceries"
  type:     { type: String, enum: ['income', 'expense', 'transfer'], required: true },
  color:    { type: String, default: '#64748b' },
  icon:     { type: String, default: 'tag' },
  keywords: [{ type: String, lowercase: true }],     // ["carrefour", "marjane", "grocery"]
  isSystem: { type: Boolean, default: false },
}, { timestamps: true });

categorySchema.index({ user: 1, name: 1 }, { unique: true });
```

Seed set: Groceries, Junk Food, Shopping, Transport, Bills, Entertainment, Healthcare, Investments, Salary, Savings, Education, Travel, Unplanned, Other.

### 2.3 Transaction

The workhorse collection. Indexed for the dashboard's most common query (user + date range + category).

```js
const transactionSchema = new Schema({
  user:        { type: ObjectId, ref: 'User', required: true, index: true },
  date:        { type: Date, required: true, index: true },
  description: { type: String, required: true, trim: true },
  merchant:    { type: String, trim: true },          // normalized from description
  amount:      { type: Schema.Types.Decimal128, required: true }, // signed: + income, - expense
  currency:    { type: String, default: 'MAD' },
  type:        { type: String, enum: ['income', 'expense', 'transfer'], required: true },
  category:    { type: ObjectId, ref: 'Category', index: true },
  source:      { type: String, enum: ['manual', 'import'], default: 'manual' },
  importBatch: { type: ObjectId, ref: 'ImportBatch' },           // optional, for undo
  dedupeHash:  { type: String, index: true },                    // user+date+amount+merchant
  notes:       { type: String },
}, { timestamps: true });

transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, dedupeHash: 1 }, { unique: true, sparse: true });
```

### 2.4 Budget

One document per user / category / month.

```js
const budgetSchema = new Schema({
  user:     { type: ObjectId, ref: 'User', required: true, index: true },
  category: { type: ObjectId, ref: 'Category', required: true },
  month:    { type: String, required: true },         // "2026-06" (YYYY-MM)
  limit:    { type: Schema.Types.Decimal128, required: true },
  currency: { type: String, default: 'MAD' },
  alertThreshold: { type: Number, default: 0.8 },     // notify at 80% of limit
}, { timestamps: true });

budgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });
```

### 2.5 Report

Stores metadata for generated exports (the file itself is streamed, not stored, unless you add object storage later).

```js
const reportSchema = new Schema({
  user:      { type: ObjectId, ref: 'User', required: true, index: true },
  type:      { type: String, enum: ['pdf', 'excel'], required: true },
  range:     { from: Date, to: Date },
  filters:   { type: Object },                        // categories, type, etc.
  status:    { type: String, enum: ['ready', 'generating', 'failed'], default: 'ready' },
  fileUrl:   { type: String },                        // null unless you add S3/R2
}, { timestamps: true });
```

### 2.6 Notification

Drives budget alerts and analytics nudges.

```js
const notificationSchema = new Schema({
  user:    { type: ObjectId, ref: 'User', required: true, index: true },
  kind:    { type: String, enum: ['budget_alert', 'insight', 'system'], required: true },
  title:   { type: String, required: true },
  body:    { type: String },
  meta:    { type: Object },                          // { category, month, pct }
  isRead:  { type: Boolean, default: false, index: true },
}, { timestamps: true });
```

### 2.7 ImportBatch (recommended addition)

Lets users undo a bad import in one click — a small thing that reads as very polished in a portfolio.

```js
const importBatchSchema = new Schema({
  user:        { type: ObjectId, ref: 'User', required: true, index: true },
  fileName:    { type: String },
  rowCount:    { type: Number },
  importedCount: { type: Number },
  skippedCount:  { type: Number },
  status:      { type: String, enum: ['completed', 'reverted'], default: 'completed' },
}, { timestamps: true });
```

---

## 3. API Documentation

Base path: `/api/v1`. All non-auth routes require `Authorization: Bearer <accessToken>`. Standard envelope:

```json
// success
{ "success": true, "data": { ... }, "meta": { ... } }
// error
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }
```

### 3.1 Auth

| Method | Endpoint              | Body                          | Returns |
|--------|-----------------------|-------------------------------|---------|
| POST   | `/auth/register`      | `{ name, email, password }`   | `201` user + access token (sets refresh cookie) |
| POST   | `/auth/login`         | `{ email, password }`         | `200` access token (sets refresh cookie) |
| POST   | `/auth/refresh`       | — (reads cookie)              | `200` new access token (rotates cookie) |
| POST   | `/auth/logout`        | — (reads cookie)              | `204` clears cookie, invalidates refresh hash |

### 3.2 Users

| Method | Endpoint            | Body                         | Returns |
|--------|---------------------|------------------------------|---------|
| GET    | `/users/me`         | —                            | current profile + settings |
| PATCH  | `/users/me`         | `{ name?, settings? }`       | updated profile |
| PATCH  | `/users/me/password`| `{ currentPassword, newPassword }` | `204` |

### 3.3 Transactions

| Method | Endpoint              | Notes |
|--------|-----------------------|-------|
| GET    | `/transactions`       | Query: `search, category, type, from, to, sort, page, limit`. Paginated. |
| POST   | `/transactions`       | Create one transaction. |
| GET    | `/transactions/:id`   | Single transaction. |
| PATCH  | `/transactions/:id`   | Partial update. |
| DELETE | `/transactions/:id`   | Soft or hard delete (your call). |
| POST   | `/transactions/bulk`  | Bulk delete / re-categorize selected IDs. |

### 3.4 Upload

| Method | Endpoint           | Notes |
|--------|--------------------|-------|
| POST   | `/upload`          | `multipart/form-data`, field `file`. Parses, categorizes, upserts. Returns `{ batchId, imported, skipped, errors[] }`. |
| GET    | `/upload/batches`  | List import batches. |
| DELETE | `/upload/batches/:id` | Revert an import batch. |

### 3.5 Budgets

| Method | Endpoint           | Notes |
|--------|--------------------|-------|
| GET    | `/budgets`         | Query `month=YYYY-MM`. Returns budgets joined with actual spend + % used. |
| POST   | `/budgets`         | Create budget for a category/month. |
| PATCH  | `/budgets/:id`     | Update limit/threshold. |
| DELETE | `/budgets/:id`     | Remove. |

### 3.6 Analytics

| Method | Endpoint                      | Notes |
|--------|-------------------------------|-------|
| GET    | `/analytics/summary`          | Income, expenses, balance, biggest expense for a range. |
| GET    | `/analytics/by-category`      | Spend grouped by category (pie). |
| GET    | `/analytics/trends`           | Monthly income vs expense series (line/bar). |
| GET    | `/analytics/insights`         | Computed nudges ("18% more than last month", top merchants, avg daily spend). |

### 3.7 Reports & Notifications

| Method | Endpoint              | Notes |
|--------|-----------------------|-------|
| POST   | `/reports`            | `{ type: 'pdf'|'excel', range, filters }` → streams the file. |
| GET    | `/notifications`      | List; `?unread=true`. |
| PATCH  | `/notifications/:id`  | Mark read. |

### 3.8 Validation & errors

- Validate every request body/query with **Zod** or **express-validator** at the route boundary; reject early with `400` + field-level `details`.
- Central error-handling middleware maps known error types to status codes and a consistent envelope. Never leak stack traces in production.
- Use a typed error class hierarchy (`AppError`, `NotFoundError`, `UnauthorizedError`, `ValidationError`).

---

## 4. Folder Structure

### 4.1 Backend (`/server`)

```
server/
├── src/
│   ├── config/
│   │   ├── env.js              # validated env (zod) — fail fast on boot
│   │   ├── db.js               # mongoose connection + retry
│   │   └── logger.js           # pino
│   ├── middleware/
│   │   ├── auth.js             # JWT verify, attaches req.user
│   │   ├── error.js            # central error handler
│   │   ├── rateLimit.js
│   │   ├── validate.js         # zod schema runner
│   │   └── upload.js           # multer memoryStorage + file gate
│   ├── models/
│   │   ├── User.js
│   │   ├── Transaction.js
│   │   ├── Category.js
│   │   ├── Budget.js
│   │   ├── Report.js
│   │   ├── Notification.js
│   │   └── ImportBatch.js
│   ├── routes/
│   │   ├── index.js            # mounts all v1 routers
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── transaction.routes.js
│   │   ├── upload.routes.js
│   │   ├── budget.routes.js
│   │   ├── analytics.routes.js
│   │   └── report.routes.js
│   ├── controllers/
│   │   └── *.controller.js     # thin HTTP layer, one per resource
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── import.service.js
│   │   ├── categorization/
│   │   │   ├── index.js            # exports configured categorizer
│   │   │   ├── KeywordCategorizer.js
│   │   │   └── AiCategorizer.js    # stub for later
│   │   ├── analytics.service.js
│   │   ├── budget.service.js
│   │   └── report.service.js
│   ├── validators/             # zod schemas per resource
│   ├── utils/
│   │   ├── money.js            # Decimal128 helpers
│   │   ├── hash.js             # dedupe + password
│   │   └── asyncHandler.js
│   ├── jobs/                   # (future) budget alert cron
│   ├── seed/
│   │   └── categories.seed.js
│   └── app.js                  # express app (middleware wiring)
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── package.json
└── server.js                   # boot: connect db, start listener
```

### 4.2 Frontend (`/client`)

```
client/
├── src/
│   ├── api/
│   │   ├── axios.js            # instance + interceptors (refresh on 401)
│   │   ├── auth.api.js
│   │   ├── transactions.api.js
│   │   ├── budgets.api.js
│   │   ├── analytics.api.js
│   │   └── upload.api.js
│   ├── app/
│   │   ├── router.jsx          # routes + guards
│   │   └── queryClient.js      # TanStack Query (recommended over raw axios state)
│   ├── components/
│   │   ├── ui/                 # Button, Card, Modal, Input, Badge, Skeleton
│   │   ├── layout/             # Sidebar, Topbar, Shell
│   │   ├── charts/             # PieChart, LineChart, BarChart, AreaChart wrappers
│   │   └── transactions/       # TransactionTable, TransactionForm, Filters
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── features/               # feature-first co-location
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── budgets/
│   │   ├── analytics/
│   │   ├── reports/
│   │   └── settings/
│   ├── hooks/                  # useAuth, useTheme, useTransactions
│   ├── lib/
│   │   ├── format.js           # currency / date formatters (Intl)
│   │   └── constants.js
│   ├── pages/                  # route-level components
│   ├── styles/
│   │   └── index.css           # @import "tailwindcss"; + @theme tokens
│   ├── App.jsx
│   └── main.jsx
├── public/
├── .env.example                # VITE_API_URL
├── index.html
├── vite.config.js              # react() + tailwindcss() plugins
└── package.json
```

**Tailwind v4 note:** v4 dropped the CLI/`init` flow. Install `tailwindcss @tailwindcss/vite`, add the `tailwindcss()` plugin to `vite.config.js`, and put a single `@import "tailwindcss";` in your CSS. There's **no `tailwind.config.js`** by default — design tokens (colors, fonts, radii) go in CSS via the `@theme` directive. Don't follow older `@tailwind base/components/utilities` + PostCSS tutorials; they're v3.

---

## 5. UI Page List

| # | Route | Page | Access | Purpose |
|---|-------|------|--------|---------|
| 1 | `/login` | Login | public | Email/password auth |
| 2 | `/register` | Register | public | Account creation |
| 3 | `/` | Dashboard | private | KPI cards + 4 charts + recent activity |
| 4 | `/transactions` | Transactions | private | Searchable/filterable/paginated table + CRUD |
| 5 | `/upload` | Import | private | Drag-drop upload, column mapping preview, import summary |
| 6 | `/budgets` | Budgets | private | Per-category monthly budgets with progress bars |
| 7 | `/analytics` | Analytics | private | Deep-dive insights, trends, top merchants |
| 8 | `/reports` | Reports | private | Generate/export PDF & Excel |
| 9 | `/settings` | Settings | private | Theme, currency, profile, password |
| 10 | `*` | NotFound | public | 404 |

---

## 6. Component Hierarchy

```
<App>
└── <ThemeProvider>
    └── <AuthProvider>
        └── <QueryClientProvider>
            └── <Router>
                ├── <PublicRoute>
                │   ├── <LoginPage>
                │   └── <RegisterPage>
                └── <ProtectedRoute>
                    └── <AppShell>
                        ├── <Sidebar>
                        ├── <Topbar>  (search, theme toggle, notifications, avatar)
                        └── <Outlet>
                            ├── <DashboardPage>
                            │   ├── <KpiCard> ×5      (income, expense, balance, biggest, monthly)
                            │   ├── <SpendByCategoryChart>   → <PieChart>
                            │   ├── <IncomeVsExpenseChart>   → <BarChart>
                            │   ├── <MonthlyTrendChart>      → <AreaChart / LineChart>
                            │   ├── <BudgetProgressList>
                            │   └── <RecentTransactions>
                            ├── <TransactionsPage>
                            │   ├── <TransactionFilters>     (search, category, type, date)
                            │   ├── <TransactionTable>       (sortable headers)
                            │   ├── <Pagination>
                            │   └── <TransactionFormModal>   (add/edit, React Hook Form)
                            ├── <UploadPage>
                            │   ├── <Dropzone>
                            │   ├── <ColumnMappingPreview>
                            │   └── <ImportSummary>
                            ├── <BudgetsPage>
                            │   ├── <MonthSelector>
                            │   ├── <BudgetCard>             (progress bar + alert badge)
                            │   └── <BudgetFormModal>
                            ├── <AnalyticsPage>
                            │   ├── <InsightCard> ×n
                            │   ├── <TopMerchantsList>
                            │   └── <TrendCharts>
                            ├── <ReportsPage>
                            │   └── <ReportBuilder>          (range + filters → export)
                            └── <SettingsPage>
                                ├── <ProfileForm>
                                ├── <PreferencesForm>        (currency, theme)
                                └── <PasswordForm>
```

Shared primitives in `components/ui`: `Button, Card, Modal, Input, Select, Badge, Skeleton, EmptyState, Toast`.

---

## 7. Feature Roadmap

| Phase | Milestone | Key deliverables | Definition of done |
|-------|-----------|------------------|--------------------|
| 1 | Project setup | Two-folder layout, Vite+Tailwind v4, Express skeleton, env validation, ESLint/Prettier, Atlas connection | App boots front+back, lint passes, healthcheck route returns 200 |
| 2 | Authentication | Register/login, bcrypt, JWT access + refresh-cookie rotation, route guards, profile | Can sign up, log in, hit a protected route, refresh on reload |
| 3 | Excel/CSV upload | Multer memory upload, SheetJS parse, column normalization, row validation, import summary, batches | Upload a real statement, see parsed rows persisted, dupes skipped |
| 4 | Database integration | All 7 schemas, indexes, seed categories, transaction CRUD + pagination/search/filter/sort | Transactions page fully functional against real data |
| 5 | Dashboard | KPI cards + 4 chart types wired to analytics endpoints, loading/empty states | Dashboard reflects live data, responsive, no layout shift |
| 6 | Analytics | Aggregation pipelines, insights engine, top merchants, trends | Insights match hand-computed numbers on a test dataset |
| 7 | Budgets | Budget CRUD, actual-vs-limit join, progress bars, threshold alerts → notifications | Exceeding a budget produces an alert + visual state |
| 8 | Reports | PDF (PDFKit) + Excel (SheetJS write) export with range/filter | Both exports download with correct, formatted data |
| 9 | Deployment | Vercel (client), Render (API), Atlas, env/CORS/cookie config, CI | Public URL works end-to-end incl. cross-origin auth |
| 10 | Future AI | `AiCategorizer` behind a flag, optional narrative insight layer | Categorization quality measurably improves; AI is opt-in |

---

## 8. Development Timeline

Estimates assume focused part-time evenings/weekends (~10–12 hrs/week). Compress if full-time.

| Phase | Effort | Calendar (part-time) |
|-------|--------|----------------------|
| 1 — Setup | 1–2 days | Week 1 |
| 2 — Auth | 3–4 days | Week 1–2 |
| 3 — Upload | 3–4 days | Week 2–3 |
| 4 — DB + Transactions | 4–5 days | Week 3–4 |
| 5 — Dashboard | 4–5 days | Week 4–5 |
| 6 — Analytics | 3–4 days | Week 5–6 |
| 7 — Budgets | 3 days | Week 6 |
| 8 — Reports | 2–3 days | Week 7 |
| 9 — Deployment | 1–2 days | Week 7 |
| 10 — AI (optional) | 2–3 days | Week 8+ |

**Realistic MVP-to-deployed: ~7 weeks part-time.** A tighter portfolio cut (Phases 1–5 + 9) is achievable in ~4 weeks and already demos well.

Suggested order tweak: build **Transactions CRUD (Phase 4) before Upload (Phase 3)** if you want a working UI sooner — manual entry gives you data to build the dashboard against while you refine the parser.

---

## 9. Best Practices

**Security**
- bcrypt with cost factor ≥ 12; never store or log plaintext passwords.
- Short-lived access token (~15 min) in memory; refresh token httpOnly+Secure cookie, rotated and hashed in DB so it can be revoked.
- `helmet` for headers, strict CORS allow-list with `credentials: true`, `express-rate-limit` on auth + upload routes specifically.
- Validate **everything** at the boundary (Zod). Treat all spreadsheet cell content as untrusted input.
- File upload gate: enforce max size (e.g. 5 MB), allow-list MIME types and extensions, parse in memory, reject macro-enabled formats you don't support.
- **SheetJS caveat:** the npm `xlsx` package has lagged on security fixes (prototype-pollution / ReDoS advisories). Pin the latest version and consider installing from SheetJS's official source rather than a stale npm release; sanitize parsed keys to mitigate prototype pollution.

**Data & correctness**
- Money as `Decimal128` or integer minor units — never `Number`. Format for display only at the edge using `Intl.NumberFormat`.
- Store each transaction's original currency; convert to the user's base currency at read time (or store both). Don't mix currencies in an aggregate silently.
- Index for your real queries: `{ user: 1, date: -1 }` and `{ user: 1, category: 1 }`. Verify with `explain()` that dashboard queries use indexes.
- Make imports idempotent via the dedupe hash; surface skipped duplicates in the summary so it's transparent, not silent.

**Engineering**
- Keep controllers thin; put logic in services so it's unit-testable without HTTP.
- Use TanStack Query on the frontend for server state (caching, refetch, optimistic updates) instead of hand-rolled `useEffect` + state — it removes a lot of bugs and looks professional in a code review.
- Centralized error handling + a consistent response envelope everywhere.
- Structured logging (pino), no `console.log` in production paths. Never log tokens or PII.
- `.env.example` checked in, real `.env` git-ignored, env validated at boot (fail fast).
- Loading skeletons + empty states + error boundaries on every data view — these are what separate a "demo" from a "product" visually.
- Tests: at minimum, integration tests for auth and the import parser (the two riskiest paths). Even 15–20 meaningful tests read very well in a portfolio.

**UI/UX**
- Lean on the Stripe/Linear/Vercel aesthetic: generous whitespace, one accent color, neutral grays, subtle borders over heavy shadows, consistent 4/8px spacing scale.
- Define design tokens once in Tailwind v4's `@theme` (colors, radii, font) so dark mode and brand changes are trivial.
- Mobile-first; the sidebar collapses to a drawer on small screens.
- Charts: keep them readable — limit categories shown, use a coherent palette, add tooltips, and always render an empty state when there's no data.

---

## 10. Future Improvements

**Product / SaaS path**
- Multi-tenancy & teams (shared household budgets), role-based access.
- Subscription billing (Stripe), usage tiers, free vs. pro feature gating.
- Recurring-transaction detection and forecasting (project a future balance) — a natural fit for a project-controls/forecasting background; an S-curve of cumulative cash flow would be a standout differentiator.
- Direct bank connections via an aggregator (Plaid / TrueLayer / regional equivalent) to replace manual upload.
- Object storage (S3/Cloudflare R2) for persisted report files and async report generation via a queue.

**Engineering**
- Migrate to TypeScript end-to-end (a strong credibility signal for a portfolio).
- Background jobs (BullMQ/Redis) for large imports, scheduled budget alerts, and report generation.
- Caching layer (Redis) for expensive analytics aggregations.
- CI/CD with GitHub Actions: lint, test, build, preview deploys.
- Observability: error tracking (Sentry), request metrics.

**Intelligence layer (opt-in, not core)**
- `AiCategorizer`: classify ambiguous merchants the keyword engine misses, behind a feature flag — keep keyword matching as the deterministic baseline.
- Narrative insights via the Claude API: turn the computed analytics (you already have the numbers) into a short monthly summary. This keeps AI as a thin presentation layer over deterministic logic rather than a dependency, which is both more robust and more honest.
- Anomaly detection: flag unusual spend vs. the user's own baseline.

---

*Built to demonstrate full-stack engineering judgment: layered architecture, secure auth, correct money handling, idempotent ingestion, and a clean upgrade path to SaaS.*
