import { getSession } from '@/server/auth/session'
import { getSummary, getMonthlyTrends } from '@/server/services/analytics.service'

export const metadata = { title: 'Savings — Reckon' }

function fmt(n: number, currency: string) {
  return `${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
}

export default async function SavingsPage() {
  const session = await getSession()
  if (!session) return null

  const currency = session.baseCurrency ?? 'CAD'
  const from = new Date('2000-01-01')
  const to = new Date('2099-12-31')

  const [summary, trends] = await Promise.all([
    getSummary(session.userId, from, to),
    getMonthlyTrends(session.userId, 12),
  ])

  const hasData = summary.transactionCount > 0
  const savingsRate = summary.totalIncome > 0
    ? ((summary.balance / summary.totalIncome) * 100)
    : 0

  const monthlySavings = trends.map((t) => ({
    ...t,
    net: t.income - t.expenses,
  }))

  const maxAbs = Math.max(...monthlySavings.map((t) => Math.abs(t.net)), 1)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Savings</h1>
        <p className="mt-1 text-sm text-ink-muted">Your net savings and monthly balance over time.</p>
      </div>

      {!hasData ? (
        <div className="rounded-xl border border-dashed border-rule bg-paper py-24 text-center">
          <p className="text-sm font-medium text-ink">No data yet</p>
          <p className="mt-1 text-xs text-ink-muted">
            <a href="/upload" className="text-forest hover:underline">Import a file</a> to see your savings.
          </p>
        </div>
      ) : (
        <>
          {/* Summary strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: 'Net savings',
                value: fmt(summary.balance, currency),
                color: summary.balance >= 0 ? 'text-forest' : 'text-danger',
                sub: summary.balance >= 0 ? 'Positive balance' : 'Spending exceeds income',
              },
              {
                label: 'Savings rate',
                value: `${savingsRate.toFixed(1)}%`,
                color: savingsRate >= 20 ? 'text-forest' : savingsRate >= 0 ? 'text-amber-500' : 'text-danger',
                sub: savingsRate >= 20 ? 'Healthy savings rate' : savingsRate >= 0 ? 'Room to improve' : 'Over-spending',
              },
              {
                label: 'Total income',
                value: fmt(summary.totalIncome, currency),
                color: 'text-ink',
                sub: `${fmt(summary.totalExpenses, currency)} spent`,
              },
            ].map((s, i) => (
              <div key={s.label} className="animate-fade-up card px-5 py-4" style={{ animationDelay: `${i * 60}ms` }}>
                <p className="text-xs text-ink-muted uppercase tracking-widest font-medium">{s.label}</p>
                <p className={`mt-2 text-2xl font-semibold tabular-nums tracking-tight ${s.color}`} style={{ fontFamily: 'var(--font-geist-mono)' }}>
                  {s.value}
                </p>
                <p className="mt-1 text-xs text-ink-muted">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Monthly net savings chart */}
          {monthlySavings.length > 0 && (
            <div className="animate-fade-up card p-6" style={{ animationDelay: '200ms' }}>
              <div className="mb-5">
                <h2 className="text-sm font-semibold text-ink">Monthly net savings</h2>
                <p className="text-xs text-ink-muted mt-0.5">Income minus expenses per month</p>
              </div>
              <div className="space-y-2">
                {monthlySavings.map((t) => {
                  const isPositive = t.net >= 0
                  const barPct = Math.abs(t.net) / maxAbs * 100
                  const [year, month] = t.month.split('-').map(Number)
                  const label = new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                  return (
                    <div key={t.month} className="flex items-center gap-3">
                      <span className="text-xs text-ink-muted tabular-nums w-12 shrink-0 text-right">{label}</span>
                      <div className="flex-1 h-6 flex items-center">
                        <div className="w-full h-2.5 rounded-full bg-rule overflow-hidden relative">
                          <div
                            className="absolute top-0 h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${barPct}%`,
                              background: isPositive ? 'var(--color-forest, #1b5e3e)' : '#dc2626',
                              left: isPositive ? 0 : undefined,
                              right: isPositive ? undefined : 0,
                            }}
                          />
                        </div>
                      </div>
                      <span className={`text-xs tabular-nums font-medium w-28 text-right shrink-0 ${isPositive ? 'text-forest' : 'text-danger'}`}>
                        {isPositive ? '+' : '−'}{Math.abs(t.net).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Savings tips */}
          <div className="animate-fade-up card divide-y divide-rule overflow-hidden" style={{ animationDelay: '320ms' }}>
            <div className="px-5 py-4">
              <h2 className="text-sm font-semibold text-ink">Savings benchmarks</h2>
            </div>
            {[
              { label: 'Emergency fund target', value: `${fmt(summary.totalExpenses / 12 * 3, currency)} – ${fmt(summary.totalExpenses / 12 * 6, currency)}`, sub: '3–6 months of monthly expenses' },
              { label: 'Recommended savings rate', value: '≥ 20%', sub: `Your current rate: ${savingsRate.toFixed(1)}%`, highlight: savingsRate >= 20 },
              { label: 'Monthly surplus needed', value: fmt(Math.max(summary.totalIncome / 12 * 0.2 - (summary.balance / Math.max(trends.length, 1)), 0), currency), sub: 'To reach a 20% savings rate' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-ink">{row.label}</p>
                  <p className="text-xs text-ink-muted mt-0.5">{row.sub}</p>
                </div>
                <span className={`text-sm font-semibold tabular-nums shrink-0 ${row.highlight ? 'text-forest' : 'text-ink'}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
