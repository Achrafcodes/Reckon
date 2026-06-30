'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import type { CategorySummary } from '@/server/services/category.service'

interface Props {
  categories: CategorySummary[]
  total: number
}

export function TransactionFilters({ categories, total }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      // Reset to page 1 whenever a filter changes
      if (key !== 'page') params.delete('page')
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [router, pathname, searchParams],
  )

  const search = searchParams.get('search') ?? ''
  const type = searchParams.get('type') ?? ''
  const category = searchParams.get('category') ?? ''
  const sort = searchParams.get('sort') ?? 'date_desc'
  const hasFilters = search || type || category

  return (
    <div className={`flex flex-col gap-3 transition-opacity ${isPending ? 'opacity-60 pointer-events-none' : ''}`}>
      {/* Search + sort row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Search transactions…"
            defaultValue={search}
            onChange={(e) => update('search', e.target.value)}
            className="w-full rounded-lg border border-rule bg-paper pl-9 pr-3 py-2 text-sm text-ink placeholder:text-ink-muted outline-none focus:border-forest focus:ring-2 focus:ring-forest/20 transition-colors"
            aria-label="Search transactions"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => update('sort', e.target.value)}
          className="w-full sm:w-auto rounded-lg border border-rule bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-forest focus:ring-2 focus:ring-forest/20 transition-colors cursor-pointer"
          aria-label="Sort transactions"
        >
          <option value="date_desc">Newest first</option>
          <option value="date_asc">Oldest first</option>
          <option value="amount_desc">Highest amount</option>
          <option value="amount_asc">Lowest amount</option>
        </select>
      </div>

      {/* Filter chips row */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Type filter */}
        {(['income', 'expense', 'transfer'] as const).map((t) => (
          <button
            key={t}
            onClick={() => update('type', type === t ? '' : t)}
            className={[
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors',
              type === t
                ? t === 'income'
                  ? 'bg-forest text-white border-forest'
                  : t === 'expense'
                  ? 'bg-danger text-white border-danger'
                  : 'bg-ink text-white border-ink'
                : 'bg-paper text-ink-muted border-rule hover:border-ink hover:text-ink',
            ].join(' ')}
          >
            {t === 'income' ? '↑ Income' : t === 'expense' ? '↓ Expense' : '⇄ Transfer'}
          </button>
        ))}

        <div className="w-px h-4 bg-rule mx-1" />

        {/* Category filter */}
        <select
          value={category}
          onChange={(e) => update('category', e.target.value)}
          className="rounded-full border border-rule bg-paper px-3 py-1 text-xs text-ink outline-none focus:border-forest transition-colors cursor-pointer"
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={() => {
              const params = new URLSearchParams()
              if (sort !== 'date_desc') params.set('sort', sort)
              startTransition(() => router.push(`${pathname}?${params.toString()}`))
            }}
            className="text-xs text-ink-muted hover:text-danger transition-colors ml-auto"
          >
            Clear filters ×
          </button>
        )}

        <span className="text-xs text-ink-muted ml-auto">{total} transaction{total !== 1 ? 's' : ''}</span>
      </div>
    </div>
  )
}
