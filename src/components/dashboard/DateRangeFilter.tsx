'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

type Range = 'month' | 'quarter' | 'year' | 'all'

interface Props {
  current: string
}

const OPTIONS: { label: string; value: Range }[] = [
  { label: 'This month', value: 'month' },
  { label: '3 months', value: 'quarter' },
  { label: 'This year', value: 'year' },
  { label: 'All time', value: 'all' },
]

export function DateRangeFilter({ current }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function handleSelect(value: Range) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('range')
    } else {
      params.set('range', value)
    }
    const qs = params.toString()
    startTransition(() => {
      router.push(qs ? `?${qs}` : '?')
    })
  }

  const active = (OPTIONS.some((o) => o.value === current) ? current : 'all') as Range

  return (
    <div
      className="flex items-center gap-1 flex-wrap"
      aria-label="Date range filter"
      role="group"
    >
      {OPTIONS.map((opt) => {
        const isActive = active === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleSelect(opt.value)}
            disabled={isPending}
            aria-pressed={isActive}
            className={
              isActive
                ? 'bg-brand text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-colors'
                : 'text-ink-muted hover:text-ink hover:bg-surface-r rounded-lg px-3 py-1.5 text-xs transition-colors disabled:opacity-50'
            }
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
