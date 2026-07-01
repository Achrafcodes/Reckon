'use client'
import { forwardRef, useState, useRef, useEffect, useId, Children, isValidElement, type ReactNode } from 'react'

interface SelectProps {
  id?: string
  name?: string
  value?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange?: (e: any) => void
  required?: boolean
  disabled?: boolean
  className?: string
  label?: string
  error?: string
  children?: ReactNode
  placeholder?: string
}

interface OptionData { value: string; label: string; disabled?: boolean }

function parseOptions(children: ReactNode): OptionData[] {
  const opts: OptionData[] = []
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return
    const el = child as React.ReactElement<{ value?: string; disabled?: boolean; children?: ReactNode }>
    const value = String(el.props.value ?? '')
    const label = typeof el.props.children === 'string' ? el.props.children : value
    opts.push({ value, label, disabled: el.props.disabled })
  })
  return opts
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  ({ id, name, value = '', onChange, required, disabled, className = '', label, error, children, placeholder }, _ref) => {
    const uid = useId()
    const triggerId = id ?? uid
    const [open, setOpen] = useState(false)
    const [focusedIdx, setFocusedIdx] = useState(-1)
    const containerRef = useRef<HTMLDivElement>(null)
    const listRef = useRef<HTMLUListElement>(null)

    const options = parseOptions(children)
    const selected = options.find((o) => o.value === value)
    const displayLabel = selected?.label ?? placeholder ?? ''
    const isEmpty = !selected

    useEffect(() => {
      if (!open) { setFocusedIdx(-1); return }
      const idx = options.findIndex((o) => o.value === value)
      setFocusedIdx(idx >= 0 ? idx : 0)
    }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
      if (open && focusedIdx >= 0) {
        listRef.current?.children[focusedIdx]?.scrollIntoView({ block: 'nearest' })
      }
    }, [focusedIdx, open])

    useEffect(() => {
      function onOutside(e: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
      }
      if (open) document.addEventListener('mousedown', onOutside)
      return () => document.removeEventListener('mousedown', onOutside)
    }, [open])

    function select(opt: OptionData) {
      if (opt.disabled) return
      onChange?.({ target: { value: opt.value, name } })
      setOpen(false)
    }

    function onKeyDown(e: React.KeyboardEvent) {
      if (!open) {
        if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) { e.preventDefault(); setOpen(true) }
        return
      }
      if (e.key === 'Escape') { e.preventDefault(); setOpen(false); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedIdx((i) => Math.min(i + 1, options.length - 1)) }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setFocusedIdx((i) => Math.max(i - 1, 0)) }
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        const opt = focusedIdx >= 0 ? options[focusedIdx] : null
        if (opt) select(opt)
      }
    }

    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        {label && <label htmlFor={triggerId} className="text-sm font-medium text-ink">{label}</label>}
        <div ref={containerRef} className="relative">
          <input type="hidden" name={name} value={value} required={required} />

          <button
            ref={_ref}
            id={triggerId}
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            disabled={disabled}
            onKeyDown={onKeyDown}
            onClick={() => setOpen((o) => !o)}
            className={[
              'input-base w-full text-left flex items-center justify-between gap-2 pr-8',
              isEmpty ? 'text-ink-faint' : 'text-ink',
              error ? 'border-danger/50' : '',
              open ? 'border-brand-ring shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-brand-ring)_30%,transparent)]' : '',
            ].filter(Boolean).join(' ')}
          >
            <span className="truncate">{displayLabel}</span>
          </button>

          <svg
            className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
            width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden
          >
            <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          {open && (
            <ul
              ref={listRef}
              role="listbox"
              className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-56 overflow-y-auto rounded-xl border border-rule bg-paper shadow-lg py-1 animate-fade-up origin-top"
            >
              {options.map((opt, i) => {
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
                    <span className="truncate">{opt.label}</span>
                    {isActive && (
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="shrink-0 text-forest" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </li>
                )
              })}
              {options.length === 0 && (
                <li className="px-3 py-2 text-sm text-ink-muted text-center">No options</li>
              )}
            </ul>
          )}
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    )
  },
)
Select.displayName = 'Select'
