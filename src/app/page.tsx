import Link from 'next/link'
import type { Metadata } from 'next'
import { ReckLogo } from '@/components/ui/ReckLogo'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://reckon.app'

export const metadata: Metadata = {
  title: 'Reckon — Expense Tracking & Budget Analytics App',
  description:
    'Upload your bank statement and instantly see where your money goes. Set budgets, track spending by category, detect recurring subscriptions, and export reports. 49 MAD/month.',
  keywords: [
    'expense tracker Morocco',
    'budget app MAD',
    'bank statement analyzer',
    'personal finance app',
    'spending tracker',
    'budget planner',
    'financial analytics dashboard',
    'CSV import expense tracker',
    'monthly budget tracker',
    'تتبع المصاريف',
  ],
  alternates: { canonical: APP_URL },
  openGraph: {
    title: 'Reckon — Expense Tracking & Budget Analytics',
    description: 'Upload your bank statement. See exactly where your money goes. Set budgets, get insights, export reports.',
    url: APP_URL,
    type: 'website',
  },
}

const FAQ = [
  {
    q: 'What file formats does Reckon support?',
    a: 'Reckon imports CSV, Excel (XLSX/XLS), and text-based PDF bank statements. It also accepts budget summary spreadsheets with categories as columns.',
  },
  {
    q: 'Is my financial data private?',
    a: 'Yes. Your data is stored in your private account and never shared or sold. All connections use HTTPS, passwords are bcrypt-hashed, and sessions use signed JWT cookies.',
  },
  {
    q: 'How does auto-categorization work?',
    a: 'Reckon matches transaction descriptions against keyword rules for each category (groceries, transport, dining, etc.) and assigns the best match automatically. You can edit categories at any time.',
  },
  {
    q: 'Can I cancel my subscription?',
    a: 'Yes, you can cancel any time. Your data remains accessible until the end of your billing period.',
  },
  {
    q: 'What currencies are supported?',
    a: 'Reckon supports MAD, USD, EUR, GBP, AED, SAR, CAD, CHF, and more. Each transaction stores its original currency.',
  },
  {
    q: 'Does Reckon work on mobile?',
    a: 'Yes. Reckon is a responsive web app optimised for mobile and can be installed as a PWA (add to home screen) on iOS and Android.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Reckon',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web, iOS, Android',
      url: APP_URL,
      description: 'Personal expense tracker and budget analytics app. Import bank statements, categorize spending, set budgets, and export reports.',
      offers: {
        '@type': 'Offer',
        price: '49',
        priceCurrency: 'MAD',
        availability: 'https://schema.org/InStock',
        description: 'Reckon Pro — monthly subscription with 7-day free trial',
      },
      screenshot: `${APP_URL}/opengraph-image`,
      featureList: [
        'Bank statement import (CSV, Excel, PDF)',
        'Auto-categorization',
        'Monthly budget tracking',
        'Spending analytics and charts',
        'Recurring subscription detection',
        'PDF and Excel export',
        'Dark mode',
        'Mobile PWA',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
    {
      '@type': 'Organization',
      name: 'Reckon',
      url: APP_URL,
      logo: `${APP_URL}/favicon.svg`,
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'support@reckon.app',
        contactType: 'customer support',
      },
    },
  ],
}

const features = [
  {
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
      </svg>
    ),
    title: 'Instant import',
    body: 'Drag and drop your bank statement — CSV, XLSX, XLS, or PDF — and transactions are parsed, deduplicated, and auto-categorized in seconds.',
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 20l4-8 4 4 4-6 4 4" />
      </svg>
    ),
    title: 'Live analytics',
    body: 'Spending by category, income vs. expenses, monthly trends. Drill into any time window — this month, quarter, year, or all time.',
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    title: 'Smart budgets',
    body: 'Set monthly limits per category. Reckon tracks actuals in real time and alerts you before you overspend — so you stay on plan.',
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
      </svg>
    ),
    title: 'Spending insights',
    body: 'Automatic month-over-month comparisons, budget pace warnings, and savings rate — no manual analysis needed.',
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l5 5v13a2 2 0 0 1-2 2Z" />
      </svg>
    ),
    title: 'Export reports',
    body: 'One-click PDF and Excel reports. Share a clean monthly summary with your accountant or save it for your records.',
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
    title: 'Private & secure',
    body: 'Your data stays yours. bcrypt-hashed passwords, httpOnly cookies, signed JWT sessions. No third-party tracking on your transactions.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-[#f1f5f9]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex h-14 items-center justify-between">
          <Link href="/" aria-label="Reckon home">
            <ReckLogo width={96} color="#1e40af" />
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3" aria-label="Primary">
            <Link
              href="/demo"
              className="hidden sm:inline px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-100"
            >
              Live demo
            </Link>
            <Link
              href="/#pricing"
              className="hidden sm:inline px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-100"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-100"
            >
              Sign in
            </Link>
            <Link
              href="/#pricing"
              className="px-4 py-1.5 text-sm font-semibold text-white bg-[#1e40af] hover:bg-[#1d4ed8] rounded-lg transition-colors"
            >
              Subscribe
            </Link>
          </nav>
        </div>
      </header>

      <main id="main-content">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[#0f172a] text-white">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div
            aria-hidden="true"
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(ellipse, #1e40af 0%, transparent 70%)' }}
          />

          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-20 sm:py-28 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-blue-300 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" aria-hidden="true" />
              Personal finance, finally simple
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              Your money,{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #60a5fa 0%, #34d399 100%)' }}
              >
                finally clear.
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Upload a bank statement and instantly see where your money goes. Budgets, category
              analytics, and recurring detection — no spreadsheet acrobatics required.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/#pricing"
                className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-[#1e40af] hover:bg-[#1d4ed8] rounded-xl transition-colors shadow-lg shadow-blue-900/40"
              >
                See pricing →
              </Link>
              <Link
                href="/demo"
                className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-slate-300 border border-white/15 hover:border-white/30 hover:text-white rounded-xl transition-colors"
              >
                Try live demo
              </Link>
            </div>

            {/* Stats row */}
            <div className="mt-14 grid grid-cols-3 gap-6 border-t border-white/10 pt-10">
              {[
                { value: '< 5s',    label: 'to parse a statement' },
                { value: '100%',    label: 'private — no tracking' },
                { value: 'PDF + XLS', label: 'export formats' },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-1">
                  <span className="text-xl sm:text-2xl font-bold text-white tabular-nums">{s.value}</span>
                  <span className="text-xs text-slate-400">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Dashboard preview ─────────────────────────────────────────────── */}
        <section className="bg-white border-b border-slate-200 py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">
              What you get on day one
            </p>
            <div className="rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200/80 overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-3 bg-slate-100 border-b border-slate-200">
                <span className="w-3 h-3 rounded-full bg-red-400" aria-hidden="true" />
                <span className="w-3 h-3 rounded-full bg-amber-400" aria-hidden="true" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" aria-hidden="true" />
                <span className="ml-3 text-xs text-slate-400 font-mono">reckon.app/dashboard</span>
              </div>
              <div className="bg-[#f1f5f9] p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total spent',    value: '4,280.00', color: '#dc2626' },
                  { label: 'Total income',   value: '7,500.00', color: '#059669' },
                  { label: 'Top category',   value: 'Groceries', color: '#1e40af' },
                  { label: 'Biggest expense', value: '1,200.00', color: '#d97706' },
                ].map((kpi) => (
                  <div key={kpi.label} className="rounded-xl bg-white border border-slate-200 p-4">
                    <p className="text-xs text-slate-500 mb-1">{kpi.label}</p>
                    <p className="text-base font-bold tabular-nums" style={{ color: kpi.color }}>{kpi.value}</p>
                  </div>
                ))}
                <div className="col-span-2 sm:col-span-3 rounded-xl bg-white border border-slate-200 p-4">
                  <p className="text-xs font-medium text-slate-600 mb-3">Monthly spending</p>
                  <div className="flex items-end gap-1.5 h-14" aria-label="Decorative bar chart">
                    {[45,62,38,71,55,80,48,66,52,74,60,43].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: i === 11 ? '#1e40af' : '#dbeafe' }} aria-hidden="true" />
                    ))}
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1 rounded-xl bg-white border border-slate-200 p-4 flex flex-col gap-2">
                  <p className="text-xs font-medium text-slate-600">By category</p>
                  {[
                    { label: 'Groceries', pct: 38, color: '#059669' },
                    { label: 'Transport', pct: 24, color: '#1e40af' },
                    { label: 'Dining',    pct: 18, color: '#d97706' },
                  ].map((c) => (
                    <div key={c.label} className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>{c.label}</span><span>{c.pct}%</span>
                      </div>
                      <div className="h-1 rounded-full bg-slate-100">
                        <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: c.color }} aria-hidden="true" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#1e40af] hover:underline"
              >
                Explore the live demo →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-20 bg-[#f1f5f9]">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Everything you need, nothing you don&apos;t
              </h2>
              <p className="mt-3 text-sm text-slate-500 max-w-xl mx-auto">
                Built for people who want clear answers about their money — without the complexity.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f) => (
                <div key={f.title} className="rounded-xl bg-white border border-slate-200 p-5 hover:border-blue-200 hover:shadow-sm transition-all">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-[#1e40af] mb-4">
                    {f.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1.5">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-20 bg-white border-t border-slate-200">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-12">
              Up and running in three steps
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
              <div className="hidden sm:block absolute top-7 left-[calc(16.67%+16px)] right-[calc(16.67%+16px)] h-px bg-slate-200" aria-hidden="true" />
              {[
                { step: '1', title: 'Subscribe',         body: 'Pick a plan. Instant access, cancel any time.' },
                { step: '2', title: 'Upload a statement', body: 'CSV, Excel, or PDF from any bank. Parsed in seconds.' },
                { step: '3', title: 'Gain clarity',       body: 'Dashboard, budgets, reports — live immediately.' },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center gap-3 relative">
                  <div className="w-14 h-14 rounded-full bg-[#1e40af] text-white flex items-center justify-center text-xl font-bold shadow-md shadow-blue-900/20 shrink-0">
                    {item.step}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-500 max-w-[180px] mx-auto">{item.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-12">
              <Link
                href="/#pricing"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white bg-[#1e40af] hover:bg-[#1d4ed8] rounded-xl transition-colors shadow-lg shadow-blue-900/30"
              >
                View pricing
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-20 bg-white border-t border-slate-200">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Frequently asked questions
              </h2>
              <p className="mt-3 text-sm text-slate-500">
                Everything you need to know before you subscribe.
              </p>
            </div>
            <dl className="divide-y divide-slate-200">
              {FAQ.map(({ q, a }) => (
                <details key={q} className="group py-5">
                  <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                    <dt className="text-sm font-semibold text-slate-900 group-open:text-[#1e40af] transition-colors">
                      {q}
                    </dt>
                    <svg
                      width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth={2}
                      className="shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
                    </svg>
                  </summary>
                  <dd className="mt-3 text-sm text-slate-500 leading-relaxed pr-8">{a}</dd>
                </details>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Pricing ──────────────────────────────────────────────────────── */}
        <section id="pricing" className="py-16 sm:py-24 bg-[#f1f5f9] border-t border-slate-200">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Simple, honest pricing
            </h2>
            <p className="mt-3 text-sm text-slate-500 max-w-md mx-auto">
              One plan. Everything included. Cancel any time.
            </p>

            <div className="mt-12 max-w-sm mx-auto">
              <div className="rounded-2xl border-2 border-[#1e40af] bg-white p-8 text-left flex flex-col shadow-xl shadow-blue-900/10">
                <p className="text-sm font-semibold text-[#1e40af] uppercase tracking-wide">Reckon Pro</p>
                <div className="mt-3 flex items-end gap-2">
                  <p className="text-5xl font-bold text-slate-900 tracking-tight">49</p>
                  <div className="mb-1.5 text-left">
                    <p className="text-sm font-medium text-slate-500">MAD</p>
                    <p className="text-xs text-slate-400">per month</p>
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-400">or 490 MAD / year — save 2 months</p>

                <ul className="mt-7 space-y-3">
                  {[
                    'Unlimited transactions',
                    'Unlimited budgets & categories',
                    'CSV, Excel & PDF import',
                    'Budget summary import',
                    'Advanced analytics & trends',
                    'Spending insights (auto-generated)',
                    'Recurring subscription detection',
                    'PDF & Excel reports',
                    'Private — no third-party tracking',
                    'Priority support',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-700">
                      <svg className="shrink-0 text-[#1e40af]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <polyline strokeLinecap="round" strokeLinejoin="round" points="20 6 9 17 4 12" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className="mt-8 block w-full rounded-xl bg-[#1e40af] hover:bg-[#1d4ed8] py-3 text-center text-sm font-semibold text-white transition-colors shadow-md shadow-blue-900/20"
                >
                  Subscribe now
                </Link>
                <p className="mt-3 text-center text-xs text-slate-400">
                  7-day free trial · Cancel any time
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <ReckLogo width={72} color="#94a3b8" />
          <p>© {new Date().getFullYear()} Reckon. Your data stays private.</p>
          <div className="flex gap-4">
            <Link href="/demo" className="hover:text-slate-700 transition-colors">Live demo</Link>
            <Link href="/login" className="hover:text-slate-700 transition-colors">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
