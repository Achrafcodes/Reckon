import Link from 'next/link'
import type { Metadata } from 'next'
import { KPICard } from '@/components/dashboard/KPICard'
import { InsightsPanel } from '@/components/dashboard/InsightsPanel'
import { ReckLogo } from '@/components/ui/ReckLogo'
import type { Insight } from '@/server/services/insights.service'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://reckon.app'

export const metadata: Metadata = {
  title: 'Live Demo — See Reckon in Action',
  description: 'Try Reckon free with sample data — no sign-up required. See the dashboard, spending insights, budget tracking, and recurring detection live.',
  alternates: { canonical: `${APP_URL}/demo` },
  openGraph: {
    title: 'Live Demo — Reckon Expense Tracker',
    description: 'Interactive demo with sample financial data. See budgets, analytics, and insights before subscribing.',
    url: `${APP_URL}/demo`,
    type: 'website',
  },
}

// ── Sample data ──────────────────────────────────────────────────────────────

const TRANSACTIONS = [
  { id: '1',  date: '2024-06-28', description: 'Freelance payment',         category: 'Income',      color: '#059669', amount: 2800,   type: 'income'  },
  { id: '2',  date: '2024-06-27', description: 'Carrefour Market',          category: 'Groceries',   color: '#0ea5e9', amount: -187,   type: 'expense' },
  { id: '3',  date: '2024-06-26', description: 'Netflix',                   category: 'Leisure',     color: '#8b5cf6', amount: -15,    type: 'expense' },
  { id: '4',  date: '2024-06-24', description: 'Shell Fuel Station',        category: 'Transport',   color: '#f59e0b', amount: -320,   type: 'expense' },
  { id: '5',  date: '2024-06-22', description: 'Restaurant Le Petit Café',  category: 'Dining',      color: '#f97316', amount: -95,    type: 'expense' },
  { id: '6',  date: '2024-06-20', description: 'Salary June',               category: 'Income',      color: '#059669', amount: 12000,  type: 'income'  },
  { id: '7',  date: '2024-06-18', description: 'Electricity Bill',          category: 'Utilities',   color: '#64748b', amount: -340,   type: 'expense' },
  { id: '8',  date: '2024-06-15', description: 'H&M Clothing',              category: 'Shopping',    color: '#ec4899', amount: -560,   type: 'expense' },
  { id: '9',  date: '2024-06-12', description: 'Pharmacy Al Wifaq',         category: 'Health',      color: '#10b981', amount: -82,    type: 'expense' },
  { id: '10', date: '2024-06-10', description: 'Spotify Premium',           category: 'Leisure',     color: '#8b5cf6', amount: -29,    type: 'expense' },
]

const CATEGORIES = [
  { name: 'Groceries', total: 620,  color: '#0ea5e9', pct: 28 },
  { name: 'Transport', total: 480,  color: '#f59e0b', pct: 22 },
  { name: 'Shopping',  total: 560,  color: '#ec4899', pct: 25 },
  { name: 'Dining',    total: 310,  color: '#f97316', pct: 14 },
  { name: 'Leisure',   total: 244,  color: '#8b5cf6', pct: 11 },
]

const INSIGHTS: Insight[] = [
  {
    kind: 'positive',
    title: 'Saving 31% of your income',
    body: "You've set aside 4,568 MAD this month. You're comfortably above the 20% target.",
  },
  {
    kind: 'warning',
    title: 'Shopping up 38% vs last month',
    body: 'You spent 560 MAD on Shopping — 155 MAD more than May. Review before month end.',
  },
  {
    kind: 'danger',
    title: 'Transport budget exceeded',
    body: "You've spent 480 MAD — 20% over your 400 MAD limit for this month.",
  },
  {
    kind: 'info',
    title: 'Groceries is 28% of your expenses',
    body: '620 MAD out of 2,214 MAD total expenses went to Groceries in June.',
  },
]

const RECURRING = [
  { merchant: 'Netflix',          amount: 15,  frequency: 'monthly', color: '#8b5cf6', occurrences: 6 },
  { merchant: 'Spotify Premium',  amount: 29,  frequency: 'monthly', color: '#8b5cf6', occurrences: 6 },
  { merchant: 'Shell Fuel',       amount: 320, frequency: 'monthly', color: '#f59e0b', occurrences: 5 },
  { merchant: 'Electricity Bill', amount: 340, frequency: 'monthly', color: '#64748b', occurrences: 6 },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DemoPage() {
  const totalExpenses = 2214
  const totalIncome   = 14800
  const balance       = totalIncome - totalExpenses

  const kpis = [
    {
      label: 'Total spent',
      value: `${fmt(totalExpenses)} MAD`,
      sub: '10 transactions',
      icon: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Total income',
      value: `${fmt(totalIncome)} MAD`,
      sub: `+${fmt(balance)} saved`,
      subColor: 'text-accent',
      icon: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        </svg>
      ),
      trend: 'up' as const,
    },
    {
      label: 'Top category',
      value: 'Groceries',
      sub: '620.00 MAD spent',
      icon: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
        </svg>
      ),
    },
    {
      label: 'Biggest expense',
      value: '560.00 MAD',
      sub: 'H&M Clothing',
      icon: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-dvh bg-bg">
      {/* ── Demo banner ─────────────────────────────────────────────────────── */}
      <div className="bg-brand text-white text-xs font-medium text-center py-2 px-4">
        <span className="opacity-80">You&apos;re viewing a demo with sample data.</span>
        {' '}
        <Link href="/#pricing" className="underline underline-offset-2 font-semibold hover:opacity-90 transition-opacity">
          Subscribe to use Reckon with your own data →
        </Link>
      </div>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="Back to home">
              <ReckLogo width={88} />
            </Link>
            <span className="hidden sm:inline-flex items-center rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand uppercase tracking-wide">
              Demo
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-3 py-1.5 text-sm font-medium text-ink-muted hover:text-ink transition-colors rounded-lg hover:bg-surface-r"
            >
              Sign in
            </Link>
            <Link
              href="/#pricing"
              className="px-4 py-1.5 text-sm font-semibold text-white bg-brand hover:bg-brand-h rounded-lg transition-colors"
            >
              Subscribe
            </Link>
          </div>
        </div>
      </header>

      {/* ── Dashboard ───────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8">

        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-semibold text-ink tracking-tight flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="text-brand shrink-0" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            Good afternoon, Alex
          </h1>
          <p className="mt-1 text-sm text-ink-muted">Here&apos;s your financial overview for June 2024.</p>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <KPICard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              sub={kpi.sub}
              subColor={kpi.subColor}
              icon={kpi.icon}
              trend={kpi.trend}
              style={{ animationDelay: `${60 + i * 70}ms` }}
            />
          ))}
        </div>

        {/* Insights */}
        <InsightsPanel insights={INSIGHTS} />

        {/* Transactions + Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Recent transactions */}
          <div className="lg:col-span-3 card overflow-hidden animate-fade-up" style={{ animationDelay: '340ms' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-ink">Recent transactions</h2>
              <span className="text-xs text-ink-muted">Sample data</span>
            </div>
            <div className="divide-y divide-border">
              {TRANSACTIONS.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-r transition-colors">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: tx.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink truncate">{tx.description}</p>
                    <p className="text-xs text-ink-muted">
                      {new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      {' · '}{tx.category}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold tabular-nums shrink-0 ${tx.type === 'income' ? 'text-accent' : 'text-danger'}`}>
                    {tx.type === 'income' ? '+' : '−'}{fmt(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Spend by category */}
          <div className="lg:col-span-2 card overflow-hidden animate-fade-up" style={{ animationDelay: '410ms' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-ink">Spending by category</h2>
              <span className="text-xs text-ink-muted">This month</span>
            </div>
            <div className="px-5 py-4 space-y-4">
              {CATEGORIES.map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
                      <span className="text-ink font-medium">{cat.name}</span>
                    </div>
                    <span className="text-ink-muted tabular-nums">{fmt(cat.total)} MAD</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-border overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${cat.pct}%`, background: cat.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recurring */}
        <div className="card overflow-hidden animate-fade-up" style={{ animationDelay: '480ms' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-ink">Recurring subscriptions</h2>
            <span className="text-xs text-ink-muted">Auto-detected</span>
          </div>
          <div className="divide-y divide-border">
            {RECURRING.map((item) => (
              <div key={item.merchant} className="flex items-center gap-3 px-5 py-3">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink truncate capitalize">{item.merchant}</p>
                  <p className="text-xs text-ink-muted">{item.occurrences} occurrences</p>
                </div>
                <div className="flex flex-col items-end gap-0.5 shrink-0">
                  <span className="text-sm font-semibold tabular-nums text-danger">{fmt(item.amount)} MAD</span>
                  <span className="badge badge-blue">{item.frequency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl bg-brand p-8 text-center text-white animate-fade-up" style={{ animationDelay: '560ms' }}>
          <h2 className="text-xl font-bold tracking-tight">Ready to see your real numbers?</h2>
          <p className="mt-2 text-sm text-blue-200 max-w-md mx-auto">
            Upload your own bank statement and get the same clear view of your finances in under 30 seconds.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/#pricing"
              className="w-full sm:w-auto px-6 py-3 text-sm font-semibold bg-white text-brand hover:bg-blue-50 rounded-xl transition-colors shadow-lg"
            >
              View pricing
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white border border-white/20 hover:border-white/40 rounded-xl transition-colors"
            >
              Learn more
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
