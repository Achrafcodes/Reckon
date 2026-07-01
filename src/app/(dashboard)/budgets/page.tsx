import { getSession } from '@/server/auth/session'
import { listBudgets } from '@/server/services/budget.service'
import { listCategories } from '@/server/services/category.service'
import { getLatestTransactionMonth } from '@/server/services/analytics.service'
import { BudgetCard } from '@/components/budgets/BudgetCard'
import { AddBudgetForm } from '@/components/budgets/AddBudgetForm'
import { MonthPicker } from '@/components/budgets/MonthPicker'

export const metadata = { title: 'Budgets — Reckon' }

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const session = await getSession()
  if (!session) return null

  const sp = await searchParams

  // Default to most recent month with data — let user override via ?month=
  const now = new Date()
  const currentMonth = sp.month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  
  const [budgets, categories] = await Promise.all([
    listBudgets(session.userId, currentMonth),
    listCategories(session.userId),
  ])

  const over = budgets.filter((b) => b.pct > 1)
  const warning = budgets.filter((b) => b.pct >= b.alertThreshold && b.pct <= 1)
  const ok = budgets.filter((b) => b.pct < b.alertThreshold)

  // Build month options: last 6 months
  const monthOptions = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    return { value, label }
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink tracking-tight">Budgets</h1>
          <p className="mt-1 text-sm text-ink-muted">Set monthly limits per category and track your spending.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <MonthPicker value={currentMonth} options={monthOptions} />
          <AddBudgetForm categories={categories} month={currentMonth} />
        </div>
      </div>

      {budgets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-rule bg-paper py-24 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-forest-subtle flex items-center justify-center mx-auto">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} className="text-forest" aria-hidden>
              <circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M12 7v5l3 3" />
            </svg>
          </div>
          <p className="text-sm font-medium text-ink">No budgets for this month</p>
          <p className="text-xs text-ink-muted">Click <span className="font-medium text-ink">Add budget</span> to set a monthly limit for a category.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary bar */}
          <div className="flex gap-4 text-xs text-ink-muted flex-wrap">
            <span>{budgets.length} budget{budgets.length !== 1 ? 's' : ''}</span>
            {over.length > 0 && <span className="text-danger font-medium">● {over.length} over limit</span>}
            {warning.length > 0 && <span style={{ color: '#92600a' }} className="font-medium">● {warning.length} near limit</span>}
            {ok.length > 0 && <span className="text-forest font-medium">● {ok.length} on track</span>}
          </div>

          {/* Over budget */}
          {over.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold text-danger uppercase tracking-widest">Over budget</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {over.map((b) => <BudgetCard key={b._id} budget={b} />)}
              </div>
            </section>
          )}

          {/* Near limit */}
          {warning.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#92600a' }}>Near limit</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {warning.map((b) => <BudgetCard key={b._id} budget={b} />)}
              </div>
            </section>
          )}

          {/* On track */}
          {ok.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold text-forest uppercase tracking-widest">On track</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ok.map((b) => <BudgetCard key={b._id} budget={b} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
