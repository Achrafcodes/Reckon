'use client'
import { useTransition, useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/server/actions/auth'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import type { SafeUser } from '@/types'

const PAGE_LABELS: Record<string, string> = {
  '/':             'Dashboard',
  '/transactions': 'Transactions',
  '/budgets':      'Budgets',
  '/analytics':    'Analytics',
  '/reports':      'Reports',
  '/upload':       'Import',
  '/settings':     'Settings',
}

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <span
      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-light text-brand-text text-xs font-semibold select-none"
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}

interface TopbarProps {
  user: SafeUser
  onMenuClick?: () => void
  children?: React.ReactNode
}

export function Topbar({ user, onMenuClick, children }: TopbarProps) {
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const pageLabel = Object.entries(PAGE_LABELS).find(([key]) =>
    key === '/' ? pathname === '/' : pathname.startsWith(key),
  )?.[1] ?? 'Reckon'

  // Close dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [menuOpen])

  function handleLogout() {
    setMenuOpen(false)
    startTransition(async () => {
      await logoutAction()
    })
  }

  return (
    <header className="h-14 border-b border-border bg-surface flex items-center px-4 md:px-6 shrink-0 gap-3">
      {/* Mobile menu trigger */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-1.5 rounded-md text-ink-muted hover:text-ink hover:bg-surface-r transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring"
        aria-label="Open menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Page title */}
      <h1 className="flex-1 text-sm font-semibold text-ink truncate">
        {pageLabel}
      </h1>

      {/* Right-side controls */}
      <div className="flex items-center gap-1">
        <ThemeToggle />
        {children}
      </div>

      {/* User menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label={`User menu — ${user.name}`}
          className="flex items-center gap-2.5 rounded-full p-0.5 pr-2 hover:bg-surface-r transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring"
        >
          <UserAvatar name={user.name} />
          <span className="hidden sm:block text-sm font-medium text-ink max-w-[120px] truncate">
            {user.name}
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className={`text-ink-muted transition-transform duration-150 ${menuOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown */}
        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-full mt-2 w-52 bg-surface border border-border rounded-xl shadow-lg shadow-black/8 animate-scale-in py-1 z-50 origin-top-right"
          >
            <div className="px-3 py-2 border-b border-border mb-1">
              <p className="text-xs font-medium text-ink truncate">{user.name}</p>
              <p className="text-xs text-ink-muted truncate">{user.email}</p>
            </div>
            <a
              href="/settings"
              role="menuitem"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-ink hover:bg-surface-r transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              Profile &amp; settings
            </a>
            <button
              role="menuitem"
              onClick={handleLogout}
              disabled={pending}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-danger hover:bg-danger-bg transition-colors disabled:opacity-40"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
              {pending ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
