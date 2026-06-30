'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { updateTransactionAction } from '@/server/actions/transactions'
import type { TransactionRow } from '@/server/services/transaction.service'
import type { CategorySummary } from '@/server/services/category.service'

interface EditTransactionModalProps {
  transaction: TransactionRow
  categories: CategorySummary[]
  open: boolean
  onClose: () => void
}

interface FormState {
  date: string
  description: string
  merchant: string
  amount: string
  type: 'income' | 'expense' | 'transfer'
  category: string
  notes: string
}

function toFormState(tx: TransactionRow): FormState {
  return {
    date: tx.date,
    description: tx.description,
    merchant: tx.merchant ?? '',
    amount: Math.abs(tx.amount).toFixed(2),
    type: tx.type,
    category: tx.category?._id ?? '',
    notes: tx.notes ?? '',
  }
}

export function EditTransactionModal({
  transaction,
  categories,
  open,
  onClose,
}: EditTransactionModalProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(transaction))
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const panelRef = useRef<HTMLDivElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)

  // Reset form whenever the transaction changes or modal opens.
  // setState-in-effect is intentional here: we're syncing controlled form state
  // from an external prop when the modal opens (a legitimate use of useEffect).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!open) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(toFormState(transaction))
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFieldErrors({})
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setServerError(null)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSuccess(false)
  }, [open, transaction])

  // Focus first input on open
  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => {
        firstInputRef.current?.focus()
      })
      return () => cancelAnimationFrame(id)
    }
  }, [open])

  // ESC closes
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Trap focus inside modal
  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    if (!panel) return

    function handleFocusTrap(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      const focusable = panel?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleFocusTrap)
    return () => document.removeEventListener('keydown', handleFocusTrap)
  }, [open])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next[name]
      return next
    })
    setServerError(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)
    setFieldErrors({})

    startTransition(async () => {
      const result = await updateTransactionAction(transaction._id, {
        date: form.date,
        description: form.description,
        merchant: form.merchant || undefined,
        amount: form.amount,
        type: form.type,
        category: form.category || undefined,
        notes: form.notes || undefined,
      })

      if (!result.ok) {
        setServerError(result.error)
        if (result.fields) setFieldErrors(result.fields)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 800)
    })
  }

  if (!open) return null

  const inputClass =
    'w-full rounded-lg border border-border bg-[var(--c-input-bg)] text-ink px-3 py-2 text-sm placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand-ring focus:border-brand transition-colors'
  const labelClass = 'block text-xs font-medium text-ink-muted mb-1'
  const errorClass = 'mt-1 text-xs text-danger'

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="edit-tx-title"
    >
      {/* Backdrop blur layer */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="card relative w-[calc(100vw-2rem)] max-w-lg animate-[scaleIn_0.2s_cubic-bezier(0.34,1.56,0.64,1)_both] overflow-hidden"
        style={{ zIndex: 1 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 id="edit-tx-title" className="text-base font-semibold text-ink">
            Edit Transaction
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-md p-1.5 text-ink-muted hover:bg-surface-r hover:text-ink transition-colors focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:outline-none"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4 px-5 py-5">
            {/* Date + Type row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="edit-date" className={labelClass}>Date</label>
                <input
                  ref={firstInputRef}
                  id="edit-date"
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
                {fieldErrors.date && (
                  <p className={errorClass}>{fieldErrors.date[0]}</p>
                )}
              </div>
              <div>
                <label htmlFor="edit-type" className={labelClass}>Type</label>
                <select
                  id="edit-type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                  <option value="transfer">Transfer</option>
                </select>
                {fieldErrors.type && (
                  <p className={errorClass}>{fieldErrors.type[0]}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="edit-description" className={labelClass}>Description</label>
              <input
                id="edit-description"
                name="description"
                type="text"
                value={form.description}
                onChange={handleChange}
                required
                maxLength={500}
                placeholder="e.g. Grocery shopping"
                className={inputClass}
              />
              {fieldErrors.description && (
                <p className={errorClass}>{fieldErrors.description[0]}</p>
              )}
            </div>

            {/* Merchant */}
            <div>
              <label htmlFor="edit-merchant" className={labelClass}>
                Merchant <span className="text-ink-faint font-normal">(optional)</span>
              </label>
              <input
                id="edit-merchant"
                name="merchant"
                type="text"
                value={form.merchant}
                onChange={handleChange}
                maxLength={200}
                placeholder="e.g. Carrefour"
                className={inputClass}
              />
            </div>

            {/* Amount + Category row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="edit-amount" className={labelClass}>Amount</label>
                <input
                  id="edit-amount"
                  name="amount"
                  type="text"
                  inputMode="decimal"
                  value={form.amount}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                  className={`${inputClass} tabular-nums`}
                />
                {fieldErrors.amount && (
                  <p className={errorClass}>{fieldErrors.amount[0]}</p>
                )}
              </div>
              <div>
                <label htmlFor="edit-category" className={labelClass}>Category</label>
                <select
                  id="edit-category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Uncategorized</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="edit-notes" className={labelClass}>
                Notes <span className="text-ink-faint font-normal">(optional)</span>
              </label>
              <textarea
                id="edit-notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                maxLength={1000}
                rows={2}
                placeholder="Any additional context…"
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Server error */}
            {serverError && (
              <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">
                {serverError}
              </p>
            )}

            {/* Success */}
            {success && (
              <p className="rounded-lg bg-[var(--color-success-bg)] px-3 py-2 text-sm text-accent">
                Transaction updated successfully.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-border bg-surface-r px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-surface-r transition-colors focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:outline-none disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || success}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-h transition-colors focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:outline-none disabled:opacity-50 inline-flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <svg
                    className="h-3.5 w-3.5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray="31.4 31.4"
                      strokeLinecap="round"
                    />
                  </svg>
                  Saving…
                </>
              ) : (
                'Save changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
