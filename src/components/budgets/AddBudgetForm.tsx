'use client'

import { useRef, useState, useTransition } from 'react'
import { createBudgetAction } from '@/server/actions/budget'
import { createCategoryAction } from '@/server/actions/category'
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
        onCreated({ _id: result.id, name: result.name, color, icon: 'tag', type: 'expense' })
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
        className="text-xs text-forest hover:underline mt-1 inline-flex items-center gap-1"
      >
        <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Category not listed? Add it
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 rounded-lg border border-rule bg-mist/40 p-3 space-y-3 animate-fade-up">
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
          className="w-full rounded-lg border border-rule bg-paper px-3 py-1.5 text-sm text-ink placeholder:text-ink-muted outline-none focus:border-forest focus:ring-2 focus:ring-forest/20 transition-colors"
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
          className="text-xs text-ink-muted hover:text-ink px-2 py-1 rounded border border-rule hover:bg-mist transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="text-xs font-medium bg-forest text-white px-3 py-1 rounded hover:bg-forest-hover disabled:opacity-60 transition-colors"
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
        className="inline-flex items-center gap-2 bg-forest text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-forest-hover transition-colors"
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

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1">
          <label className="text-xs font-medium text-ink-muted" htmlFor="budget-category">Category</label>
          <select
            id="budget-category"
            name="category"
            required
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-lg border border-rule bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-forest focus:ring-2 focus:ring-forest/20 transition-colors"
          >
            <option value="">Select a category…</option>
            {expenseCategories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
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
            className="w-full rounded-lg border border-rule bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-muted outline-none focus:border-forest focus:ring-2 focus:ring-forest/20 transition-colors"
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
            className="w-full rounded-lg border border-rule bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-forest focus:ring-2 focus:ring-forest/20 transition-colors"
          />
        </div>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}

      <div className="flex gap-2 justify-end pt-1">
        <button
          type="button"
          onClick={() => { setOpen(false); setError(null) }}
          className="px-4 py-2 text-sm text-ink-muted hover:text-ink border border-rule rounded-lg hover:bg-mist transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium bg-forest text-white rounded-lg hover:bg-forest-hover disabled:opacity-60 transition-colors"
        >
          {isPending ? 'Saving…' : 'Save budget'}
        </button>
      </div>
    </form>
  )
}
