'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { deleteAccountAction } from '@/server/actions/settings'

export function DangerZone() {
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)

  const confirmed = confirmText === 'DELETE'

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await deleteAccountAction(formData)
      if (result.ok) {
        router.push('/login')
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-muted leading-relaxed">
        Permanently delete your account and all data — transactions, budgets, categories, and import history. This cannot be undone.
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-4 py-2 text-sm font-medium text-danger border border-danger/30 rounded-lg hover:bg-red-50 transition-colors"
        >
          Delete my account
        </button>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-danger/20 bg-red-50/40 p-4 animate-fade-up">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink-muted" htmlFor="delete-password">Your password</label>
            <input
              id="delete-password"
              name="password"
              type="password"
              required
              autoFocus
              className="w-full rounded-lg border border-rule bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-danger focus:ring-2 focus:ring-danger/20 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink-muted" htmlFor="delete-confirm-text">
              Type <span className="font-mono font-semibold text-danger">DELETE</span> to confirm
            </label>
            <input
              id="delete-confirm-text"
              name="confirm"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full rounded-lg border border-rule bg-paper px-3 py-2 text-sm font-mono text-ink placeholder:text-ink-muted/40 outline-none focus:border-danger focus:ring-2 focus:ring-danger/20 transition-colors"
            />
          </div>

          {error && <p className="text-xs text-danger">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setOpen(false); setError(null); setConfirmText('') }}
              className="px-4 py-2 text-sm text-ink-muted border border-rule rounded-lg hover:bg-mist transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!confirmed || isPending}
              className="px-4 py-2 text-sm font-medium bg-danger text-white rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? 'Deleting…' : 'Delete everything'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
