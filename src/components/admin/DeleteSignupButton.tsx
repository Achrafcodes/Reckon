'use client'
import { useState, useTransition } from 'react'
import { deleteEarlyAccessRequestAction } from '@/server/actions/admin'

export function DeleteSignupButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState(false)

  function handleDelete() {
    startTransition(async () => {
      await deleteEarlyAccessRequestAction(id)
    })
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="px-2 py-1 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {isPending ? '…' : 'Confirm'}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="px-2 py-1 text-xs font-medium text-zinc-500 hover:text-zinc-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="px-2 py-1 text-xs font-medium text-zinc-400 hover:text-red-600 transition-colors"
    >
      Delete
    </button>
  )
}
