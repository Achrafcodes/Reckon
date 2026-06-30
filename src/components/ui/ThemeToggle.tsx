'use client'
import { useTheme } from '@/components/ui/ThemeProvider'

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`relative p-1.5 rounded-md text-ink-muted hover:text-ink hover:bg-surface-r transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring ${className ?? ''}`}
    >
      {/* Sun icon (show in dark mode to switch to light) */}
      <svg
        width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2} aria-hidden="true"
        className={isDark ? 'block' : 'hidden'}
      >
        <circle cx="12" cy="12" r="4" />
        <path strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41" />
      </svg>
      {/* Moon icon (show in light mode to switch to dark) */}
      <svg
        width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2} aria-hidden="true"
        className={isDark ? 'hidden' : 'block'}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  )
}
