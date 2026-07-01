'use client'

import { useTransition } from 'react'
import { deleteBudgetAction } from '@/server/actions/budget'
import { useSession } from '@/components/providers/SessionProvider'
import type { BudgetWithActual } from '@/server/services/budget.service'

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function BudgetCard({ budget }: { budget: BudgetWithActual }) {
  const { baseCurrency: currency } = useSession()
  const [isPending, startTransition] = useTransition()
  const pct = Math.min(budget.pct * 100, 100)
  const isOver = budget.pct > 1
  const isWarning = budget.pct >= budget.alertThreshold && !isOver
  const remaining = budget.limit - budget.actual

  const barColor = isOver ? '#b91c1c' : isWarning ? '#92600a' : budget.category.color

  function handleDelete() {
    if (!confirm(`Delete the ${budget.category.name} budget?`)) return
    startTransition(async () => {
      await deleteBudgetAction(budget._id)
    })
  }

  return (
    <div className={`animate-fade-up bg-paper border rounded-xl p-5 space-y-4 transition-opacity ${isPending ? 'opacity-50' : ''} ${isOver ? 'border-danger/30' : 'border-rule'}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full shrink-0" style={{ background: budget.category.color }} />
          <span className="text-sm font-semibold text-ink">{budget.category.name}</span>
        </div>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-ink-muted/50 hover:text-danger transition-colors text-xs shrink-0"
          aria-label={`Delete ${budget.category.name} budget`}
        >
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-ink-muted">
          <span className="tabular-nums font-medium" style={{ color: barColor }}>
            {fmt(budget.actual)} {currency}
          </span>
          <span className="tabular-nums">of {fmt(budget.limit)} {currency}</span>
        </div>
        <div className="h-2 rounded-full bg-rule overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: barColor }}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className={isOver ? 'text-danger font-medium' : isWarning ? 'font-medium' : 'text-ink-muted'} style={isWarning && !isOver ? { color: '#92600a' } : undefined}>
            {isOver
              ? `${fmt(Math.abs(remaining))} MAD over budget`
              : isWarning
              ? `${fmt(remaining)} MAD left — almost there`
              : `${fmt(remaining)} MAD remaining`}
          </span>
          <span className="text-ink-muted tabular-nums">{pct.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  )
}
