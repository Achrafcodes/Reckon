'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

interface Props {
  page: number
  totalPages: number
  total: number
  limit: number
}

export function TransactionPagination({ page, totalPages, total, limit }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  if (totalPages <= 1) return null

  const go = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className={`px-4 py-3 border-t border-rule flex items-center justify-between text-sm transition-opacity ${isPending ? 'opacity-60' : ''}`}>
      <span className="text-xs text-ink-muted">
        Showing {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => go(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-rule px-3 py-1.5 text-xs text-ink-muted hover:bg-mist hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ← Prev
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i
          return (
            <button
              key={p}
              onClick={() => go(p)}
              className={[
                'rounded-lg border px-3 py-1.5 text-xs transition-colors',
                p === page
                  ? 'border-forest bg-forest text-white'
                  : 'border-rule text-ink-muted hover:bg-mist hover:text-ink',
              ].join(' ')}
            >
              {p}
            </button>
          )
        })}
        <button
          onClick={() => go(page + 1)}
          disabled={page >= totalPages}
          className="rounded-lg border border-rule px-3 py-1.5 text-xs text-ink-muted hover:bg-mist hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
