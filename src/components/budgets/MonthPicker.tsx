'use client'

import { useState, useRef, useEffect } from 'react'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function MonthPicker({ value }: { value: string }) {
  const [year, setYear] = useState(() => parseInt(value.split('-')[0]))
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const [selYear, selMonthIdx] = value.split('-').map(Number)
  const displayLabel = new Date(selYear, selMonthIdx - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  function select(monthIdx: number) {
    const mm = String(monthIdx + 1).padStart(2, '0')
    const newValue = `${year}-${mm}`
    const url = new URL(window.location.href)
    url.searchParams.set('month', newValue)
    window.location.href = url.toString()
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-rule bg-paper hover:bg-mist text-sm font-medium text-ink transition-colors"
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden className="text-ink-muted shrink-0">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path strokeLinecap="round" d="M3 9h18M8 2v4M16 2v4" />
        </svg>
        {displayLabel}
        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden className={`text-ink-muted transition-transform ${open ? 'rotate-180' : ''}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 w-64 rounded-xl border border-rule bg-paper shadow-lg animate-fade-up origin-top-left p-3">
          {/* Year navigation */}
          <div className="flex items-center justify-between mb-3 px-1">
            <button
              type="button"
              onClick={() => setYear((y) => y - 1)}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-mist text-ink-muted hover:text-ink transition-colors"
              aria-label="Previous year"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-ink tabular-nums">{year}</span>
            <button
              type="button"
              onClick={() => setYear((y) => y + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-mist text-ink-muted hover:text-ink transition-colors"
              aria-label="Next year"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-3 gap-1">
            {MONTHS.map((name, i) => {
              const isActive = year === selYear && i + 1 === selMonthIdx
              const isToday = year === new Date().getFullYear() && i === new Date().getMonth()
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => select(i)}
                  className={[
                    'relative py-2 rounded-lg text-xs font-medium transition-all',
                    isActive
                      ? 'bg-forest text-white shadow-sm'
                      : 'text-ink hover:bg-mist',
                  ].join(' ')}
                >
                  {name}
                  {isToday && !isActive && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-forest" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
