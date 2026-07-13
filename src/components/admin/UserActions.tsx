'use client'
import { useState, useTransition } from 'react'
import { approveUserAction, revokeUserAction } from '@/server/actions/admin'

export function UserActions({ userId, status }: { userId: string; status: 'pending' | 'active' | 'cancelled' }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function approve() {
    setError(null)
    startTransition(async () => {
      const result = await approveUserAction(userId)
      if (!result.ok) setError(result.error)
    })
  }

  function revoke() {
    setError(null)
    startTransition(async () => {
      const result = await revokeUserAction(userId)
      if (!result.ok) setError(result.error)
    })
  }

  return (
    <div className="flex items-center gap-2">
      {status !== 'active' ? (
        <button
          type="button"
          onClick={approve}
          disabled={isPending}
          className="px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
        >
          {isPending ? '…' : 'Approve'}
        </button>
      ) : (
        <button
          type="button"
          onClick={revoke}
          disabled={isPending}
          className="px-2.5 py-1 text-xs font-medium rounded-md bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors disabled:opacity-50"
        >
          {isPending ? '…' : 'Revoke'}
        </button>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
