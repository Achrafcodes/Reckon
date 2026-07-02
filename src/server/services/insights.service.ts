import 'server-only'
import { getSummary, getSpendByCategory } from './analytics.service'
import { listBudgets } from './budget.service'

export type InsightKind = 'positive' | 'warning' | 'info' | 'danger'

export interface Insight {
  kind: InsightKind
  title: string
  body: string
}

function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function monthWindow(ym: string): { from: Date; to: Date } {
  const [y, m] = ym.split('-').map(Number)
  return {
    from: new Date(y, m - 1, 1),
    to: new Date(y, m, 0, 23, 59, 59, 999),
  }
}

function prevMonth(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function fmt(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function pct(n: number): string {
  return `${Math.round(Math.abs(n))}%`
}

export async function generateInsights(userId: string, currency = 'USD'): Promise<Insight[]> {
  const thisMonth = currentMonth()
  const lastMonthKey = prevMonth(thisMonth)

  const { from: f1, to: t1 } = monthWindow(thisMonth)
  const { from: f2, to: t2 } = monthWindow(lastMonthKey)

  const [thisSummary, lastSummary, categories, budgets] = await Promise.all([
    getSummary(userId, f1, t1),
    getSummary(userId, f2, t2),
    getSpendByCategory(userId, f1, t1),
    listBudgets(userId, thisMonth, currency),
  ])

  const insights: Insight[] = []

  // ── No data yet ───────────────────────────────────────────────────────────
  if (thisSummary.transactionCount === 0) {
    return [{
      kind: 'info',
      title: 'No data for this month',
      body: 'Upload a bank statement or add transactions to start seeing insights.',
    }]
  }

  // ── Savings rate ──────────────────────────────────────────────────────────
  if (thisSummary.totalIncome > 0) {
    const saved = thisSummary.totalIncome - thisSummary.totalExpenses
    const savingsPct = (saved / thisSummary.totalIncome) * 100

    if (savingsPct >= 20) {
      insights.push({
        kind: 'positive',
        title: `Saving ${pct(savingsPct)} of your income`,
        body: `You've set aside ${fmt(saved)} ${currency} this month. Great financial discipline.`,
      })
    } else if (savingsPct > 0) {
      insights.push({
        kind: 'info',
        title: `Saving ${pct(savingsPct)} of your income`,
        body: `You have ${fmt(saved)} ${currency} left after expenses. Aim for 20%+ to build a safety cushion.`,
      })
    } else if (saved < 0) {
      insights.push({
        kind: 'danger',
        title: 'Spending exceeds income this month',
        body: `You're ${fmt(Math.abs(saved))} ${currency} over your income. Review your expenses to get back on track.`,
      })
    }
  }

  // ── Month-over-month spend change ─────────────────────────────────────────
  if (lastSummary.totalExpenses > 0 && thisSummary.totalExpenses > 0) {
    const delta = thisSummary.totalExpenses - lastSummary.totalExpenses
    const deltaPct = (delta / lastSummary.totalExpenses) * 100

    if (deltaPct >= 15) {
      insights.push({
        kind: 'warning',
        title: `Spending up ${pct(deltaPct)} vs last month`,
        body: `You've spent ${fmt(thisSummary.totalExpenses)} ${currency} this month vs ${fmt(lastSummary.totalExpenses)} ${currency} last month — a ${fmt(delta)} ${currency} increase.`,
      })
    } else if (deltaPct <= -10) {
      insights.push({
        kind: 'positive',
        title: `Spending down ${pct(deltaPct)} vs last month`,
        body: `You spent ${fmt(Math.abs(delta))} ${currency} less than last month. Keep it up.`,
      })
    }
  }

  // ── Budget warnings ───────────────────────────────────────────────────────
  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const dayOfMonth = now.getDate()
  const monthProgress = dayOfMonth / daysInMonth

  for (const budget of budgets) {
    if (budget.limit === 0) continue

    // Projected spend at current pace
    const projectedSpend = monthProgress > 0 ? budget.actual / monthProgress : budget.actual
    const projectedPct = projectedSpend / budget.limit

    if (budget.pct >= 1) {
      insights.push({
        kind: 'danger',
        title: `${budget.category.name} budget exceeded`,
        body: `You've spent ${fmt(budget.actual)} ${currency} — ${pct((budget.pct - 1) * 100)} over your ${fmt(budget.limit)} ${currency} limit.`,
      })
    } else if (projectedPct >= 1.1 && budget.pct >= 0.5) {
      insights.push({
        kind: 'warning',
        title: `${budget.category.name} on track to overspend`,
        body: `At your current pace you'll spend ~${fmt(projectedSpend)} ${currency} — ${pct((projectedPct - 1) * 100)} over your ${fmt(budget.limit)} ${currency} limit.`,
      })
    }
  }

  // ── Top category concentration ────────────────────────────────────────────
  if (categories.length > 0 && thisSummary.totalExpenses > 0) {
    const top = categories[0]
    const topPct = (top.total / thisSummary.totalExpenses) * 100
    if (topPct >= 40) {
      insights.push({
        kind: 'info',
        title: `${top.name} is ${pct(topPct)} of your spending`,
        body: `${fmt(top.total)} ${currency} out of ${fmt(thisSummary.totalExpenses)} ${currency} total expenses went to ${top.name} this month.`,
      })
    }
  }

  // ── No budgets set ────────────────────────────────────────────────────────
  if (budgets.length === 0 && thisSummary.totalExpenses > 0) {
    insights.push({
      kind: 'info',
      title: 'No budgets set for this month',
      body: 'Set spending limits per category to get alerts before you overspend.',
    })
  }

  return insights.slice(0, 4) // cap at 4 so it doesn't dominate the page
}
