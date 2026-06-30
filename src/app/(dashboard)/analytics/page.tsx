import dynamic from 'next/dynamic'
import { getCurrentUser } from '@/server/auth/session'
import { getSummary, getSpendByCategory, getMonthlyTrends } from '@/server/services/analytics.service'

/* Recharts is heavy (~90kb gzipped) — split it out of the initial route bundle */
const MonthlyBarChart = dynamic(
  () => import('@/components/charts/MonthlyBarChart').then((m) => m.MonthlyBarChart),
  { loading: () => <div className="skeleton h-64 w-full" /> },
)
const SpendingDonut = dynamic(
  () => import('@/components/charts/SpendingDonut').then((m) => m.SpendingDonut),
  { loading: () => <div className="skeleton h-48 w-48 rounded-full mx-auto" /> },
)

export const metadata = { title: 'Analytics — Reckon' }

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default async function AnalyticsPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const userId = String(user._id)
  const from = new Date('2000-01-01')
  const to = new Date('2099-12-31')

  const [summary, categorySpend, trends] = await Promise.all([
    getSummary(userId, from, to),
    getSpendByCategory(userId, from, to),
    getMonthlyTrends(userId, 12),
  ])

  const hasData = summary.transactionCount > 0

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-ink-muted">A breakdown of your income and spending over time.</p>
      </div>

      {!hasData ? (
        <div className="rounded-xl border border-dashed border-rule bg-paper py-24 text-center">
          <p className="text-sm font-medium text-ink">No data yet</p>
          <p className="mt-1 text-xs text-ink-muted">
            <a href="/upload" className="text-forest hover:underline">Import a file</a> to see your analytics.
          </p>
        </div>
      ) : (
        <>
          {/* Summary strip */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total income', value: fmt(summary.totalIncome), color: 'text-forest' },
              { label: 'Total expenses', value: fmt(summary.totalExpenses), color: 'text-danger' },
              { label: 'Net balance', value: fmt(summary.balance), color: summary.balance >= 0 ? 'text-forest' : 'text-danger' },
            ].map((s, i) => (
              <div key={s.label} className="animate-fade-up card px-5 py-4" style={{ animationDelay: `${i * 60}ms` }}>
                <p className="text-xs text-ink-muted uppercase tracking-widest font-medium">{s.label}</p>
                <p className={`mt-2 text-2xl font-semibold tabular-nums tracking-tight ${s.color}`} style={{ fontFamily: 'var(--font-geist-mono)' }}>
                  {s.value}
                  <span className="ml-1 text-sm font-normal text-ink-muted">MAD</span>
                </p>
              </div>
            ))}
          </div>

          {/* Monthly trend chart */}
          {trends.length > 0 && (
            <div className="animate-fade-up card p-6" style={{ animationDelay: '180ms' }}>
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-ink">Income vs Expenses</h2>
                <p className="text-xs text-ink-muted mt-0.5">Monthly breakdown</p>
              </div>
              <MonthlyBarChart data={trends} />
            </div>
          )}

          {/* Donut + category table */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-up" style={{ animationDelay: '250ms' }}>
            {/* Donut */}
            <div className="lg:col-span-2 card p-6">
              <div className="mb-2">
                <h2 className="text-sm font-semibold text-ink">Spending breakdown</h2>
                <p className="text-xs text-ink-muted mt-0.5">By category</p>
              </div>
              <SpendingDonut data={categorySpend} />
              {/* Legend */}
              <div className="mt-3 space-y-1.5">
                {categorySpend.slice(0, 5).map((c) => (
                  <div key={c.categoryId} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                    <span className="text-xs text-ink truncate flex-1">{c.name}</span>
                    <span className="text-xs tabular-nums text-ink-muted">{((c.total / summary.totalExpenses) * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category table */}
            <div className="lg:col-span-3 card overflow-hidden">
              <div className="px-5 py-4 border-b border-rule">
                <h2 className="text-sm font-semibold text-ink">All categories</h2>
                <p className="text-xs text-ink-muted mt-0.5">{categorySpend.length} categories · sorted by spend</p>
              </div>
              <div className="divide-y divide-rule">
                {categorySpend.map((cat, i) => {
                  const pct = summary.totalExpenses > 0 ? (cat.total / summary.totalExpenses) * 100 : 0
                  return (
                    <div key={cat.categoryId} className="flex items-center gap-4 px-5 py-3 hover:bg-mist/50 transition-colors">
                      <span className="text-xs tabular-nums text-ink-muted w-4 shrink-0">{i + 1}</span>
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cat.color }} />
                      <span className="text-sm text-ink flex-1 font-medium">{cat.name}</span>
                      <div className="w-20 h-1.5 rounded-full bg-rule overflow-hidden hidden sm:block">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: cat.color }} />
                      </div>
                      <span className="text-xs text-ink-muted tabular-nums w-10 text-right shrink-0">{pct.toFixed(1)}%</span>
                      <span className="text-sm font-semibold tabular-nums text-ink w-32 text-right shrink-0">{fmt(cat.total)} MAD</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
