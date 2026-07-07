'use client'
import { useState, useRef, useEffect, useId, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

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
  /** Opens the dropdown immediately on mount — for inline pickers spawned by
   * a separate trigger (e.g. clicking a category pill), where a second click
   * to open would be redundant. */
  autoOpen?: boolean
  /** Fires whenever the dropdown closes for any reason (selection, Escape,
   * outside click) — lets a parent that spawned this via autoOpen (e.g. a
   * table-cell picker) stay in sync, since the dropdown panel is portaled
   * to <body> and so isn't inside the parent's own outside-click bounds. */
  onClose?: () => void
}

export function Combobox({
  id, name, value = '', onChange, options, placeholder = 'Select…',
  searchPlaceholder = 'Search…', disabled, required, label, error, className = '', autoOpen = false, onClose,
}: ComboboxProps) {
  const uid = useId()
  const triggerId = id ?? uid
  const [open, setOpen] = useState(autoOpen)
  const [query, setQuery] = useState('')
  const [focusedIdx, setFocusedIdx] = useState(0)
  const [panelStyle, setPanelStyle] = useState<{ top: number; left: number; width: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const selected = options.find((o) => o.value === value)
  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  // Dropdown content is portaled to <body> and positioned in fixed coords
  // from the trigger's own rect — sidesteps table/overflow stacking-context
  // bugs where a plain `absolute` child gets clipped or painted under later
  // sibling rows (this bit the category picker embedded in a table cell).
  function updatePanelPosition() {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setPanelStyle({ top: rect.bottom + 6, left: rect.left, width: rect.width })
  }

  function openDropdown() {
    setQuery('')
    setFocusedIdx(0)
    updatePanelPosition()
    setOpen(true)
    setTimeout(() => searchRef.current?.focus(), 10)
  }

  function closeDropdown() {
    setOpen(false)
    onClose?.()
  }

  useEffect(() => {
    if (autoOpen) {
      updatePanelPosition()
      setTimeout(() => searchRef.current?.focus(), 10)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (open && focusedIdx >= 0) {
      listRef.current?.children[focusedIdx]?.scrollIntoView({ block: 'nearest' })
    }
  }, [focusedIdx, open])

  useEffect(() => {
    if (!open) return
    function onOutside(e: Event) {
      const target = e.target as Node
      if (!containerRef.current?.contains(target) && !panelRef.current?.contains(target)) {
        closeDropdown()
      }
    }
    function onReposition() {
      updatePanelPosition()
    }
    document.addEventListener('mousedown', onOutside)
    document.addEventListener('touchstart', onOutside)
    window.addEventListener('scroll', onReposition, true)
    window.addEventListener('resize', onReposition)
    return () => {
      document.removeEventListener('mousedown', onOutside)
      document.removeEventListener('touchstart', onOutside)
      window.removeEventListener('scroll', onReposition, true)
      window.removeEventListener('resize', onReposition)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function select(opt: ComboboxOption) {
    if (opt.disabled) return
    onChange?.(opt.value)
    closeDropdown()
  }

  function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') { e.preventDefault(); closeDropdown(); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedIdx((i) => Math.min(i + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setFocusedIdx((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter') {
      e.preventDefault()
      const opt = filtered[focusedIdx]
      if (opt) select(opt)
    }
  }

  const panel = open && panelStyle && (
    <div
      ref={panelRef}
      style={{ position: 'fixed', top: panelStyle.top, left: panelStyle.left, width: panelStyle.width }}
      className="z-[100] rounded-xl border border-rule bg-paper shadow-lg overflow-hidden animate-fade-up origin-top"
    >
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
  )

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
          onClick={() => (open ? closeDropdown() : openDropdown())}
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
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      {typeof document !== 'undefined' && panel && createPortal(panel, document.body)}
    </div>
  )
}
