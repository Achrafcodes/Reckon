import Link from 'next/link'
import { getCurrentUser } from '@/server/auth/session'
import { getSummary, getSpendByCategory } from '@/server/services/analytics.service'
import { listTransactions } from '@/server/services/transaction.service'
import { listTransactionsSchema } from '@/schemas/transaction'
import { Greeting } from '@/components/dashboard/Greeting'
import { KPICard } from '@/components/dashboard/KPICard'
import { ImportPrompt } from '@/components/dashboard/ImportPrompt'

export const metadata = { title: 'Dashboard — Reckon' }

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const userId = String(user._id)

  // All-time window
  const from = new Date('2000-01-01')
  const to = new Date('2099-12-31')

  const [summary, categorySpend, recent] = await Promise.all([
    getSummary(userId, from, to),
    getSpendByCategory(userId, from, to),
    listTransactions(userId, listTransactionsSchema.parse({ limit: '8', sort: 'date_desc' })),
  ])

  const hasData = summary.transactionCount > 0
  const topCategories = categorySpend.slice(0, 5)

  const kpis = [
    {
      label: 'Total spent',
      value: hasData ? `${fmt(summary.totalExpenses)} MAD` : '—',
      sub: hasData ? `${summary.transactionCount} transactions` : 'No data yet',
      icon: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Total income',
      value: hasData ? `${fmt(summary.totalIncome)} MAD` : '—',
      sub: hasData ? (summary.balance >= 0 ? `+${fmt(summary.balance)} saved` : `${fmt(Math.abs(summary.balance))} over budget`) : 'No data yet',
      subColor: hasData ? (summary.balance >= 0 ? 'text-forest' : 'text-danger') : undefined,
      icon: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        </svg>
      ),
    },
    {
      label: 'Top category',
      value: topCategories[0]?.name ?? '—',
      sub: topCategories[0] ? `${fmt(topCategories[0].total)} MAD spent` : 'No expenses yet',
      icon: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
        </svg>
      ),
    },
    {
      label: 'Biggest expense',
      value: hasData && summary.biggestExpense > 0 ? `${fmt(summary.biggestExpense)} MAD` : '—',
      sub: 'Single transaction',
      icon: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
        </svg>
      ),
    },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Greeting name={user.name} />

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
            style={{ animationDelay: `${60 + i * 70}ms` }}
          />
        ))}
      </div>

      {!hasData ? (
        <ImportPrompt />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Recent transactions */}
          <div className="lg:col-span-3 card overflow-hidden animate-fade-up" style={{ animationDelay: '340ms' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-rule">
              <h2 className="text-sm font-semibold text-ink">Recent transactions</h2>
              <Link href="/transactions" className="text-xs text-forest hover:underline">View all →</Link>
            </div>
            <div className="divide-y divide-rule">
              {recent.data.map((tx) => (
                <div key={tx._id} className="flex items-center gap-3 px-5 py-3 hover:bg-mist/50 transition-colors">
                  {/* Category dot */}
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: tx.category?.color ?? '#d2e0d8' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink truncate">{tx.description}</p>
                    <p className="text-xs text-ink-muted">
                      {new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      {tx.category && <> · {tx.category.name}</>}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold tabular-nums shrink-0 ${tx.type === 'income' ? 'text-forest' : 'text-danger'}`}>
                    {tx.type === 'income' ? '+' : '−'}{Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Spend by category */}
          <div className="lg:col-span-2 card overflow-hidden animate-fade-up" style={{ animationDelay: '410ms' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-rule">
              <h2 className="text-sm font-semibold text-ink">Spending by category</h2>
              <span className="text-xs text-ink-muted">All time</span>
            </div>
            {topCategories.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-xs text-ink-muted">No expense data this month.</p>
              </div>
            ) : (
              <div className="px-5 py-4 space-y-4">
                {topCategories.map((cat) => {
                  const pct = summary.totalExpenses > 0 ? (cat.total / summary.totalExpenses) * 100 : 0
                  return (
                    <div key={cat.categoryId} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
                          <span className="text-ink font-medium">{cat.name}</span>
                        </div>
                        <span className="text-ink-muted tabular-nums">{fmt(cat.total)} MAD</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-rule overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: cat.color }}
                        />
                      </div>
                    </div>
                  )
                })}
                {categorySpend.length > 5 && (
                  <p className="text-xs text-ink-muted pt-1">+{categorySpend.length - 5} more categories</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
