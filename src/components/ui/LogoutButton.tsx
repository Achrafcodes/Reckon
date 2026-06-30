'use client'

import { useTransition } from 'react'
import { logoutAction } from '@/server/actions/auth'

export function LogoutButton({ className }: { className?: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => logoutAction())}
      disabled={isPending}
      className={className}
    >
      {isPending ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
