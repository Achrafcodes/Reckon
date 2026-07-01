import { getSession } from '@/server/auth/session'
import { getSummary, getSpendByCategory } from '@/server/services/analytics.service'
import { ReportDownloader } from '@/components/reports/ReportDownloader'

export const metadata = { title: 'Reports — Reckon' }

export default async function ReportsPage() {
  const session = await getSession()
  if (!session) return null

  const from = new Date('2000-01-01')
  const to = new Date('2099-12-31')

  const currency = session.baseCurrency ?? 'USD'
  const [summary, categories] = await Promise.all([
    getSummary(session.userId, from, to),
    getSpendByCategory(session.userId, from, to),
  ])

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-ink-muted">Export your transactions and spending summary as an Excel file.</p>
      </div>

      {/* Preview strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 space-y-1">
          <p className="text-xs text-ink-muted">Total Income</p>
          <p className="text-xl font-semibold text-forest">
            {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(summary.totalIncome)}
            <span className="text-xs font-normal text-ink-muted ml-1">{currency}</span>
          </p>
        </div>
        <div className="card p-4 space-y-1">
          <p className="text-xs text-ink-muted">Total Expenses</p>
          <p className="text-xl font-semibold text-danger">
            {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(summary.totalExpenses)}
            <span className="text-xs font-normal text-ink-muted ml-1">{currency}</span>
          </p>
        </div>
        <div className="card p-4 space-y-1">
          <p className="text-xs text-ink-muted">Transactions</p>
          <p className="text-xl font-semibold text-ink">{summary.transactionCount}</p>
        </div>
      </div>

      {/* Download card */}
      <ReportDownloader topCategories={categories.slice(0, 5)} />

      {/* What's included */}
      <div className="card divide-y divide-rule overflow-hidden">
        <div className="px-5 py-4">
          <h2 className="text-sm font-semibold text-ink">What&apos;s included in the report</h2>
        </div>
        {[
          {
            sheet: 'Summary',
            desc: 'Total income, expenses, net balance, and transaction count for the selected period.',
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            ),
          },
          {
            sheet: 'Transactions',
            desc: 'Full list of transactions with date, description, category, type, and amount.',
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            ),
          },
          {
            sheet: 'Category Breakdown',
            desc: 'Spending ranked by category with totals and percentage of expenses.',
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            ),
          },
        ].map(({ sheet, desc, icon }) => (
          <div key={sheet} className="flex items-start gap-4 px-5 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest-subtle text-forest">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
                {icon}
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-ink">{sheet}</p>
              <p className="text-xs text-ink-muted mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
