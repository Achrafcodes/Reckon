'use client'

import { useRef, useState, useTransition } from 'react'
import { createBudgetAction } from '@/server/actions/budget'
import { createCategoryAction } from '@/server/actions/category'
import { Select } from '@/components/ui/Select'
import type { CategorySummary } from '@/server/services/category.service'

interface Props {
  categories: CategorySummary[]
  month: string
}

const PRESET_COLORS = [
  '#1b5e3e','#0891b2','#7c3aed','#d97706','#dc2626',
  '#ea580c','#be185d','#0e7490','#16a34a','#9333ea','#64748b','#0284c7',
]

function AddCategoryInline({ onCreated }: { onCreated: (cat: CategorySummary) => void }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [color, setColor] = useState('#64748b')
  const nameRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createCategoryAction(formData)
      if (!result.ok) {
        setError(result.error)
      } else {
        onCreated({ _id: result.id, name: result.name, color, icon: 'tag', type: 'expense', isSystem: false })
        setOpen(false)
        setColor('#64748b')
      }
    })
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => { setOpen(true); setTimeout(() => nameRef.current?.focus(), 50) }}
        className="text-xs text-brand hover:underline mt-1 inline-flex items-center gap-1"
      >
        <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Category not listed? Add it
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 rounded-lg border border-border bg-surface-r p-3 space-y-3 animate-fade-up">
      <p className="text-xs font-semibold text-ink">New category</p>

      <input type="hidden" name="type" value="expense" />
      <input type="hidden" name="color" value={color} />

      <div className="space-y-1">
        <label className="text-xs text-ink-muted" htmlFor="new-cat-name">Name</label>
        <input
          ref={nameRef}
          id="new-cat-name"
          name="name"
          type="text"
          required
          maxLength={40}
          placeholder="e.g. Pet care"
          className="input-base"
        />
      </div>

      <div className="space-y-1">
        <p className="text-xs text-ink-muted">Color</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
              style={{ background: c, borderColor: color === c ? '#131a17' : 'transparent' }}
              aria-label={c}
            />
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setOpen(false); setError(null) }}
          className="text-xs text-ink-muted hover:text-ink px-2 py-1 rounded border border-border hover:bg-surface-r transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="text-xs font-medium bg-brand text-white px-3 py-1 rounded hover:bg-brand-h disabled:opacity-60 transition-colors"
        >
          {isPending ? 'Adding…' : 'Add category'}
        </button>
      </div>
    </form>
  )
}

export function AddBudgetForm({ categories: initialCategories, month }: Props) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [categories, setCategories] = useState(initialCategories)
  const [selectedCategory, setSelectedCategory] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const expenseCategories = categories.filter((c) => c.type === 'expense')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createBudgetAction(formData)
      if (!result.ok) {
        setError(result.error)
      } else {
        formRef.current?.reset()
        setSelectedCategory('')
        setOpen(false)
      }
    })
  }

  function handleCategoryCreated(cat: CategorySummary) {
    setCategories((prev) => [...prev, cat])
    setSelectedCategory(cat._id)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-brand text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-h transition-colors"
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add budget
      </button>
    )
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="card p-5 space-y-4 animate-fade-up"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">New budget</h3>
        <button type="button" onClick={() => { setOpen(false); setError(null) }} className="text-ink-muted hover:text-ink transition-colors text-lg leading-none">×</button>
      </div>

      <input type="hidden" name="month" value={month} />
      <input type="hidden" name="currency" value="MAD" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1">
          <label className="text-xs font-medium text-ink-muted" htmlFor="budget-category">Category</label>
          <Select
            id="budget-category"
            name="category"
            required
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Select a category…</option>
            {expenseCategories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </Select>
          <AddCategoryInline onCreated={handleCategoryCreated} />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-ink-muted" htmlFor="budget-limit">Monthly limit (MAD)</label>
          <input
            id="budget-limit"
            name="limit"
            type="number"
            min="1"
            step="0.01"
            required
            placeholder="e.g. 1500"
            className="input-base"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-ink-muted" htmlFor="budget-threshold">Warn me at (%)</label>
          <input
            id="budget-threshold"
            name="alertThreshold"
            type="number"
            min="10"
            max="99"
            step="5"
            defaultValue="80"
            className="input-base"
          />
        </div>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={() => { setOpen(false); setError(null) }}
          className="w-full sm:w-auto px-4 py-2 text-sm text-ink-muted hover:text-ink border border-border rounded-lg hover:bg-surface-r transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-brand text-white rounded-lg hover:bg-brand-h disabled:opacity-60 transition-colors"
        >
          {isPending ? 'Saving…' : 'Save budget'}
        </button>
      </div>
    </form>
  )
}
