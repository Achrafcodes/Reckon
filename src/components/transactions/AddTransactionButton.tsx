'use client'

import { useState } from 'react'
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal'
import type { CategorySummary } from '@/server/services/category.service'

export function AddTransactionButton({ categories }: { categories: CategorySummary[] }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-h transition-colors focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:outline-none shadow-sm"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
        Add transaction
      </button>

      <AddTransactionModal
        categories={categories}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
