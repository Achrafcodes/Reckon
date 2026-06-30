'use client'
import { useTheme } from '@/components/ui/ThemeProvider'

const OPTIONS = [
  { value: 'light' as const, label: 'Light', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41" />
    </svg>
  )},
  { value: 'dark' as const, label: 'Dark', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )},
  { value: 'system' as const, label: 'System', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path strokeLinecap="round" d="M8 21h8m-4-4v4" />
    </svg>
  )},
]

export function ThemeForm() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex gap-3">
      {OPTIONS.map((opt) => {
        const active = theme === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            aria-pressed={active}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring ${
              active
                ? 'border-brand bg-brand-light text-brand-text'
                : 'border-border text-ink-muted hover:text-ink hover:border-border-s hover:bg-surface-r'
            }`}
          >
            {opt.icon}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
