'use client'
import { useState, useRef, useEffect, useId, type ReactNode } from 'react'

export interface ComboboxOption { value: string; label: string; disabled?: boolean; meta?: ReactNode }

interface ComboboxProps {
  id?: string
  name?: string
  value?: string
  onChange?: (value: string) => void
  options: ComboboxOption[]
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  required?: boolean
  label?: string
  error?: string
  className?: string
}

export function Combobox({
  id, name, value = '', onChange, options, placeholder = 'Select…',
  searchPlaceholder = 'Search…', disabled, required, label, error, className = '',
}: ComboboxProps) {
  const uid = useId()
  const triggerId = id ?? uid
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [focusedIdx, setFocusedIdx] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const selected = options.find((o) => o.value === value)
  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  function openDropdown() {
    setQuery('')
    setFocusedIdx(0)
    setOpen(true)
    setTimeout(() => searchRef.current?.focus(), 10)
  }

  useEffect(() => {
    if (open && focusedIdx >= 0) {
      listRef.current?.children[focusedIdx]?.scrollIntoView({ block: 'nearest' })
    }
  }, [focusedIdx, open])

  useEffect(() => {
    function onOutside(e: Event) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) {
      document.addEventListener('mousedown', onOutside)
      document.addEventListener('touchstart', onOutside)
    }
    return () => {
      document.removeEventListener('mousedown', onOutside)
      document.removeEventListener('touchstart', onOutside)
    }
  }, [open])

  function select(opt: ComboboxOption) {
    if (opt.disabled) return
    onChange?.(opt.value)
    setOpen(false)
  }

  function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedIdx((i) => Math.min(i + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setFocusedIdx((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter') {
      e.preventDefault()
      const opt = filtered[focusedIdx]
      if (opt) select(opt)
    }
  }

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label htmlFor={triggerId} className="text-sm font-medium text-ink">{label}</label>}
      <div ref={containerRef} className="relative">
        <input type="hidden" name={name} value={value} required={required} />

        {/* Trigger */}
        <button
          id={triggerId}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          disabled={disabled}
          onClick={() => (open ? setOpen(false) : openDropdown())}
          className={[
            'input-base w-full text-left flex items-center justify-between gap-2 pr-8',
            !selected ? 'text-ink-faint' : 'text-ink',
            error ? 'border-danger/50' : '',
            open ? 'border-brand-ring shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-brand-ring)_30%,transparent)]' : '',
          ].filter(Boolean).join(' ')}
        >
          <span className="truncate">{selected?.label ?? placeholder}</span>
        </button>

        {/* Chevron */}
        <svg
          className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden
        >
          <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* Dropdown */}
        {open && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-rule bg-paper shadow-lg overflow-hidden animate-fade-up origin-top">
            {/* Search input */}
            <div className="p-2 border-b border-rule">
              <div className="relative">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" aria-hidden>
                  <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
                </svg>
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setFocusedIdx(0) }}
                  onKeyDown={onSearchKeyDown}
                  placeholder={searchPlaceholder}
                  className="input-base pl-9 py-1.5 text-sm"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Options list */}
            <ul ref={listRef} role="listbox" className="max-h-48 overflow-y-auto py-1">
              {filtered.map((opt, i) => {
                const isActive = opt.value === value
                const isFocused = i === focusedIdx
                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={isActive}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => select(opt)}
                    onMouseEnter={() => setFocusedIdx(i)}
                    className={[
                      'flex items-center justify-between gap-2 px-3 py-2 text-sm cursor-pointer transition-colors select-none',
                      opt.disabled ? 'opacity-40 cursor-not-allowed' : '',
                      isFocused && !isActive ? 'bg-mist text-ink' : '',
                      isActive ? 'bg-forest/10 text-forest font-medium' : 'text-ink',
                    ].filter(Boolean).join(' ')}
                  >
                    <span className="flex items-center gap-2 truncate min-w-0">
                      {opt.meta && <span className="shrink-0">{opt.meta}</span>}
                      <span className="truncate">{opt.label}</span>
                    </span>
                    {isActive && (
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="shrink-0 text-forest" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </li>
                )
              })}
              {filtered.length === 0 && (
                <li className="px-3 py-4 text-sm text-ink-muted text-center">No results for &quot;{query}&quot;</li>
              )}
            </ul>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
