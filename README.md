# Reckon

> Personal expense tracking & financial analytics — upload a bank statement, get instant clarity on your spending.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-yellow?style=flat-square)

---

## What is Reckon?

Reckon is a full-stack SaaS application that lets users:

- **Upload** bank statements in CSV, Excel (.xlsx / .xls), or PDF format
- **Auto-categorise** transactions using keyword matching (groceries, transport, subscriptions, etc.)
- **Set budgets** per category per month and receive alerts when approaching limits
- **Visualise** spending with interactive charts (monthly bar, donut by category, trend lines)
- **Export** reports as PDF or Excel
- **Track** income, expenses, and balance across any currency

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 — strict mode |
| Database | MongoDB Atlas + Mongoose 8 |
| Auth | bcrypt + jose (JWT, httpOnly cookies) |
| Styling | Tailwind CSS v4 (CSS-first `@theme`) |
| UI Primitives | shadcn/ui + Radix |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| File Parsing | SheetJS (xlsx) |
| Email | Resend |
| Hosting | Vercel |
| Fonts | Calistoga (display) + Inter (body) + JetBrains Mono (data) |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [MongoDB Atlas](https://cloud.mongodb.com) cluster (free tier works)
- A [Vercel](https://vercel.com) account (for deployment)

### 1. Clone & install

```bash
git clone https://github.com/Achrafcodes/Reckon.git
cd Reckon
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/reckon
JWT_SECRET=<min-32-char-random-string>
JWT_REFRESH_SECRET=<min-32-char-random-string>
```

Generate secrets:

```bash
openssl rand -hex 32   # JWT_SECRET
openssl rand -hex 32   # JWT_REFRESH_SECRET
```

### 3. Seed categories

```bash
npm run seed
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login & register — no app shell
│   ├── (dashboard)/     # Protected app shell (sidebar + topbar)
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── budgets/
│   │   ├── analytics/
│   │   ├── reports/
│   │   └── settings/
│   ├── api/
│   │   ├── upload/      # Multipart file upload
│   │   ├── reports/     # Streaming PDF/Excel download
│   │   ├── subscribe/   # Webhook activation
│   │   └── cron/        # Monthly digest email
│   └── globals.css      # Tailwind v4 @theme tokens
├── server/
│   ├── auth/            # JWT signing, session helpers
│   ├── db/              # Mongoose connection + models
│   ├── services/        # Business logic (import, analytics, budgets, reports)
│   └── actions/         # Server Actions (mutations)
├── components/
│   ├── ui/              # Primitives (Button, Input, Badge…)
│   ├── layout/          # Sidebar, Topbar
│   ├── charts/          # Recharts wrappers
│   └── landing/         # Marketing page sections
├── schemas/             # Zod schemas shared by client + server
├── lib/                 # Isomorphic utilities (money, dedupe, env)
└── proxy.ts             # Next.js middleware (auth + subscription guard)
```

---

## Scripts

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint
npm run format       # Prettier
npm run seed         # Seed system categories to MongoDB
npm run test         # Vitest unit tests
npm run test:e2e     # Playwright end-to-end tests
```

---

## Features

### File Import
- Supports `.csv`, `.xlsx`, `.xls`, and text-based PDF exports
- Automatic deduplication via a deterministic hash (user + date + amount + merchant)
- Re-uploading the same file creates no duplicates
- Each import is recorded as an `ImportBatch` and can be reverted

### Categorisation
- Rule-based keyword matching against 14 system categories
- Users can create custom categories with custom colours and keywords
- Designed as a strategy interface — AI categorisation can be added behind a feature flag

### Budgets
- Per-category, per-month budget limits (`YYYY-MM` keyed)
- "Actual vs limit" computed via MongoDB aggregation (never stored as a number)
- Notification created when spending crosses the alert threshold

### Analytics
- Monthly income / expense / balance summary
- Spending by category (donut chart)
- Monthly trend (bar chart)
- All computed server-side via aggregation pipelines

### Reports
- Export as PDF or Excel
- Filterable by date range and category
- Streamed directly from a Route Handler

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.example`
4. Deploy

### Required environment variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string (include `/reckon` database name) |
| `JWT_SECRET` | Min 32-char random string — signs access tokens |
| `JWT_REFRESH_SECRET` | Min 32-char random string — signs refresh tokens |
| `WEBHOOK_SECRET` | Min 16-char secret for `/api/subscribe/activate` |
| `CRON_SECRET` | Min 16-char secret for `/api/cron/monthly-digest` |
| `RESEND_API_KEY` | [Resend](https://resend.com) API key for transactional email |
| `RESEND_FROM_EMAIL` | Verified sender address |

---

## Security

- Passwords hashed with bcrypt (cost 12)
- Sessions via signed JWTs in `httpOnly; Secure; SameSite=Strict` cookies
- Access tokens expire in 15 minutes; refresh tokens in 7 days
- All inputs validated with Zod at every server boundary
- Timing-safe comparison for webhook secrets
- Regex metacharacters escaped before MongoDB `$regex` queries
- Middleware verifies JWT signature — presence alone is not enough
- CSP, HSTS, X-Frame-Options, and Permissions-Policy headers on every route

---

## License

MIT © [Achraf Essoussy](https://github.com/Achrafcodes)

---

<p align="center">Made with ♥ by <a href="https://github.com/Achrafcodes">Achraf Essoussy</a></p>
