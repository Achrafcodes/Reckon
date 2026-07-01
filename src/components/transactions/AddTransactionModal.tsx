'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { createTransactionAction } from '@/server/actions/transactions'
import { Select } from '@/components/ui/Select'
import { Combobox } from '@/components/ui/Combobox'
import type { CategorySummary } from '@/server/services/category.service'

interface AddTransactionModalProps {
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

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function emptyForm(): FormState {
  return {
    date: todayISO(),
    description: '',
    merchant: '',
    amount: '',
    type: 'expense',
    category: '',
    notes: '',
  }
}

export function AddTransactionModal({ categories, open, onClose }: AddTransactionModalProps) {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const panelRef = useRef<HTMLDivElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)

  // Reset form when modal opens. setState in effect is intentional: syncing controlled
  // state from the open prop change is a legitimate use of useEffect.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!open) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(emptyForm())
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFieldErrors({})
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setServerError(null)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSuccess(false)
  }, [open])

  // Focus first input on open
  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => { firstInputRef.current?.focus() })
      return () => cancelAnimationFrame(id)
    }
  }, [open])

  // ESC closes
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Focus trap
  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    if (!panel) return
    function trap(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      const els = panel?.querySelectorAll<HTMLElement>(
        'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',
      )
      if (!els || els.length === 0) return
      const first = els[0]
      const last = els[els.length - 1]
      if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
        e.preventDefault()
        ;(e.shiftKey ? last : first).focus()
      }
    }
    document.addEventListener('keydown', trap)
    return () => document.removeEventListener('keydown', trap)
  }, [open])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => { const n = { ...prev }; delete n[name]; return n })
    setServerError(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)
    setFieldErrors({})

    if (!form.description.trim()) {
      setFieldErrors({ description: ['Description is required'] })
      return
    }
    if (!form.amount || Number.isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setFieldErrors({ amount: ['Enter a valid positive amount'] })
      return
    }

    startTransition(async () => {
      const result = await createTransactionAction({
        date: form.date,
        description: form.description.trim(),
        merchant: form.merchant.trim() || undefined,
        amount: String(Math.abs(Number(form.amount))),
        currency: 'MAD',
        type: form.type,
        category: form.category || undefined,
        notes: form.notes.trim() || undefined,
      })

      if (!result.ok) {
        setServerError(result.error)
        if (result.fields) setFieldErrors(result.fields)
        return
      }

      setSuccess(true)
      setTimeout(onClose, 700)
    })
  }

  if (!open) return null

  const inputClass = 'input-base'
  const labelClass = 'block text-xs font-medium text-ink-muted mb-1'
  const errorClass = 'mt-1 text-xs text-danger'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="add-tx-title"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        ref={panelRef}
        className="card relative w-[calc(100vw-2rem)] max-w-lg animate-[scaleIn_0.2s_cubic-bezier(0.34,1.56,0.64,1)_both] overflow-hidden"
        style={{ zIndex: 1 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 id="add-tx-title" className="text-base font-semibold text-ink">Add Transaction</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
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
            {/* Date + Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="add-date" className={labelClass}>Date</label>
                <input
                  ref={firstInputRef}
                  id="add-date"
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
                {fieldErrors.date && <p className={errorClass}>{fieldErrors.date[0]}</p>}
              </div>
              <div>
                <label htmlFor="add-type" className={labelClass}>Type</label>
                <Select id="add-type" name="type" value={form.type} onChange={handleChange}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                  <option value="transfer">Transfer</option>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="add-description" className={labelClass}>
                Description <span className="text-danger" aria-hidden="true">*</span>
              </label>
              <input
                id="add-description"
                name="description"
                type="text"
                value={form.description}
                onChange={handleChange}
                required
                maxLength={500}
                placeholder="e.g. Grocery shopping at Marjane"
                className={inputClass}
              />
              {fieldErrors.description && <p className={errorClass}>{fieldErrors.description[0]}</p>}
            </div>

            {/* Merchant */}
            <div>
              <label htmlFor="add-merchant" className={labelClass}>
                Merchant <span className="text-ink-faint font-normal">(optional)</span>
              </label>
              <input
                id="add-merchant"
                name="merchant"
                type="text"
                value={form.merchant}
                onChange={handleChange}
                maxLength={200}
                placeholder="e.g. Carrefour"
                className={inputClass}
              />
            </div>

            {/* Amount + Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="add-amount" className={labelClass}>
                  Amount (MAD) <span className="text-danger" aria-hidden="true">*</span>
                </label>
                <input
                  id="add-amount"
                  name="amount"
                  type="text"
                  inputMode="decimal"
                  value={form.amount}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                  className={`${inputClass} tabular-nums`}
                />
                {fieldErrors.amount && <p className={errorClass}>{fieldErrors.amount[0]}</p>}
              </div>
              <div>
                <label htmlFor="add-category" className={labelClass}>Category</label>
                <Combobox
                  id="add-category"
                  name="category"
                  value={form.category}
                  onChange={(v) => handleChange({ target: { name: 'category', value: v } } as React.ChangeEvent<HTMLSelectElement>)}
                  options={[
                    { value: '', label: 'Uncategorized' },
                    ...categories.map((cat) => ({ value: cat._id, label: cat.name })),
                  ]}
                  placeholder="Uncategorized"
                  searchPlaceholder="Search categories…"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="add-notes" className={labelClass}>
                Notes <span className="text-ink-faint font-normal">(optional)</span>
              </label>
              <textarea
                id="add-notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                maxLength={1000}
                rows={2}
                placeholder="Any context…"
                className={`${inputClass} resize-none`}
              />
            </div>

            {serverError && (
              <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">{serverError}</p>
            )}
            {success && (
              <p className="rounded-lg bg-[var(--color-success-bg)] px-3 py-2 text-sm text-accent">
                Transaction added successfully.
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
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                  </svg>
                  Saving…
                </>
              ) : (
                'Add transaction'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
