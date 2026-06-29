'use client'
import { useTransition } from 'react'
import { logoutAction } from '@/server/actions/auth'
import type { SafeUser } from '@/types'

interface TopbarProps {
  user: SafeUser
}

export function Topbar({ user }: TopbarProps) {
  const [pending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      await logoutAction()
    })
  }

  return (
    <header className="h-13 border-b border-rule bg-paper flex items-center justify-end px-6 shrink-0">
      <div className="flex items-center gap-5">
        <span className="text-sm text-ink-muted">{user.name}</span>
        <button
          onClick={handleLogout}
          disabled={pending}
          className="text-sm text-ink-muted hover:text-ink transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:underline"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
