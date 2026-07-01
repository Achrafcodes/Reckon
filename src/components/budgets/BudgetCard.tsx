'use client'

import { useState, useTransition } from 'react'
import { deleteBudgetAction, updateBudgetAction } from '@/server/actions/budget'
import { useSession } from '@/components/providers/SessionProvider'
import type { BudgetWithActual } from '@/server/services/budget.service'

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function BudgetCard({ budget }: { budget: BudgetWithActual }) {
  const { baseCurrency: currency } = useSession()
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [limit, setLimit] = useState(String(budget.limit))
  const [threshold, setThreshold] = useState(String(Math.round(budget.alertThreshold * 100)))
  const [recurring, setRecurring] = useState(budget.recurring)
  const [error, setError] = useState<string | null>(null)

  const pct = Math.min(budget.pct * 100, 100)
  const isOver = budget.pct > 1
  const isWarning = budget.pct >= budget.alertThreshold && !isOver
  const remaining = budget.limit - budget.actual
  const barColor = isOver ? '#b91c1c' : isWarning ? '#92600a' : budget.category.color

  function handleDelete() {
    startTransition(async () => { await deleteBudgetAction(budget._id) })
  }

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateBudgetAction(budget._id, formData)
      if (!result.ok) { setError(result.error); return }
      setEditing(false)
    })
  }

  return (
    <div className={`animate-fade-up bg-paper border rounded-xl p-5 space-y-4 transition-opacity ${isPending ? 'opacity-50' : ''} ${isOver ? 'border-danger/30' : 'border-rule'}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-3 h-3 rounded-full shrink-0" style={{ background: budget.category.color }} />
          <span className="text-sm font-semibold text-ink truncate">{budget.category.name}</span>
          {budget.recurring && (
            <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-forest/10 text-forest text-[10px] font-medium">
              <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Recurring
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => { setEditing((e) => !e); setConfirmingDelete(false); setError(null) }}
            disabled={isPending}
            className="w-7 h-7 flex items-center justify-center rounded-md text-ink-muted/60 hover:text-ink hover:bg-mist transition-colors"
            aria-label={`Edit ${budget.category.name} budget`}
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => { setConfirmingDelete(true); setEditing(false) }}
            disabled={isPending}
            className="w-7 h-7 flex items-center justify-center rounded-md text-ink-muted/60 hover:text-danger hover:bg-danger/8 transition-colors"
            aria-label={`Delete ${budget.category.name} budget`}
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
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
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: barColor }} />
        </div>
        <div className="flex justify-between text-xs">
          <span className={isOver ? 'text-danger font-medium' : isWarning ? 'font-medium' : 'text-ink-muted'} style={isWarning && !isOver ? { color: '#92600a' } : undefined}>
            {isOver
              ? `${fmt(Math.abs(remaining))} ${currency} over budget`
              : isWarning
              ? `${fmt(remaining)} ${currency} left — almost there`
              : `${fmt(remaining)} ${currency} remaining`}
          </span>
          <span className="text-ink-muted tabular-nums">{pct.toFixed(0)}%</span>
        </div>
      </div>

      {/* Inline delete confirmation */}
      {confirmingDelete && (
        <div className="pt-2 border-t border-danger/20 animate-fade-up">
          <p className="text-xs text-ink mb-2">Delete <span className="font-semibold">{budget.category.name}</span> budget? This can&apos;t be undone.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="flex-1 px-3 py-1.5 text-xs text-ink-muted hover:text-ink border border-rule rounded-lg hover:bg-mist transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="flex-1 px-3 py-1.5 text-xs font-medium bg-danger text-white rounded-lg hover:bg-danger/90 disabled:opacity-60 transition-colors"
            >
              {isPending ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      )}

      {/* Inline edit form */}
      {editing && (
        <form onSubmit={handleSave} className="pt-2 border-t border-rule space-y-3 animate-fade-up">
          <input type="hidden" name="currency" value={currency} />

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-ink-muted">Monthly limit</label>
              <input
                name="limit"
                type="number"
                min="1"
                step="0.01"
                required
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="input-base py-1.5 text-sm tabular-nums"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-ink-muted">Warn at (%)</label>
              <input
                name="alertThreshold"
                type="number"
                min="10"
                max="99"
                step="5"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="input-base py-1.5 text-sm tabular-nums"
              />
            </div>
          </div>

          {/* Recurring toggle */}
          <input type="hidden" name="recurring" value={String(recurring)} />
          <button
            type="button"
            onClick={() => setRecurring((r) => !r)}
            className={[
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition-all text-left',
              recurring ? 'border-forest bg-forest/8 text-forest' : 'border-rule bg-paper text-ink-muted hover:border-ink-muted hover:text-ink',
            ].join(' ')}
          >
            <div className="relative shrink-0" style={{ width: 32, height: 18 }}>
              <div className={`absolute inset-0 rounded-full transition-colors ${recurring ? 'bg-forest' : 'bg-rule'}`} />
              <span className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-all ${recurring ? 'left-[14px]' : 'left-0.5'}`} style={{ width: 14, height: 14 }} />
            </div>
            <div>
              <p className="text-xs font-medium leading-tight">Repeat every month</p>
              <p className="text-[11px] leading-tight mt-0.5 opacity-70">
                {recurring ? 'Applies to all months' : 'Only this month'}
              </p>
            </div>
          </button>

          {error && <p className="text-xs text-danger">{error}</p>}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => { setEditing(false); setError(null) }}
              className="px-3 py-1.5 text-xs text-ink-muted hover:text-ink border border-rule rounded-lg hover:bg-mist transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-3 py-1.5 text-xs font-medium bg-forest text-white rounded-lg hover:bg-forest/90 disabled:opacity-60 transition-colors"
            >
              {isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
