'use client'

import { useState } from 'react'
import { updateTransactionAction } from '@/server/actions/transactions'
import { Combobox, type ComboboxOption } from '@/components/ui/Combobox'
import type { CategorySummary } from '@/server/services/category.service'

type PickedCategory = { _id: string; name: string; color: string } | null | undefined

interface CategoryPickerProps {
  transactionId: string
  category: PickedCategory
  categories: CategorySummary[]
  onSaved?: (category: { _id: string; name: string; color: string; icon: string } | null) => void
  align?: 'left' | 'right'
}

// Click the category cell (or "Uncategorized") to reveal an inline searchable
// picker in place — no full edit modal needed for the single most common fix.
export function CategoryPicker({ transactionId, category, categories, onSaved, align = 'left' }: CategoryPickerProps) {
  const [open, setOpen] = useState(false)
  const [optimistic, setOptimistic] = useState<PickedCategory>(category)
  const [error, setError] = useState<string | null>(null)

  // Keep in sync when the server sends fresh data (e.g. after a full page revalidation)
  const [prevCategory, setPrevCategory] = useState(category)
  if (prevCategory !== category) {
    setPrevCategory(category)
    setOptimistic(category)
  }

  const options: ComboboxOption[] = categories.map((c) => ({
    value: c._id,
    label: c.name,
    meta: <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />,
  }))

  function handleSelect(categoryId: string) {
    setError(null)
    const picked = categories.find((c) => c._id === categoryId)
    const previous = optimistic

    // Optimistic: reflect the pick immediately and close, matching the rest
    // of the app's inline-edit conventions — don't make the user wait on the
    // network for what should feel instant.
    setOptimistic(picked ? { _id: picked._id, name: picked.name, color: picked.color } : null)
    setOpen(false)

    updateTransactionAction(transactionId, { category: categoryId }).then((result) => {
      if (!result.ok) {
        setOptimistic(previous)
        setError('error' in result ? result.error : 'Failed to update')
        return
      }
      onSaved?.(picked ? { _id: picked._id, name: picked.name, color: picked.color, icon: picked.icon } : null)
    })
  }

  return (
    <div className={`relative inline-block ${align === 'right' ? 'text-right' : ''}`}>
      {open ? (
        <div className="w-48 inline-block text-left">
          <Combobox
            value={optimistic?._id ?? ''}
            onChange={handleSelect}
            onClose={() => setOpen(false)}
            options={options}
            placeholder="Select category…"
            searchPlaceholder="Search categories…"
            autoOpen
          />
        </div>
      ) : optimistic ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-all hover:ring-2 hover:ring-offset-1 hover:ring-offset-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring"
          style={{ background: optimistic.color + '18', color: optimistic.color }}
          aria-label={`Change category, currently ${optimistic.name}`}
        >
          {optimistic.name}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border border-dashed border-ink-faint/50 text-ink-muted/70 italic hover:border-brand-ring hover:text-ink hover:not-italic hover:bg-mist transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring"
          aria-label="Uncategorized — click to assign a category"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Uncategorized
        </button>
      )}
      {error && (
        <p className={`absolute top-full mt-1 text-xs text-danger whitespace-nowrap ${align === 'right' ? 'right-0' : 'left-0'}`}>
          {error}
        </p>
      )}
    </div>
  )
}
