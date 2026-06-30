'use client'

import { useState, useTransition, useRef } from 'react'
import { updatePasswordAction } from '@/server/actions/settings'

export function PasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updatePasswordAction(formData)
      if (result.ok) {
        setSuccess(true)
        formRef.current?.reset()
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-ink-muted" htmlFor="pw-current">Current password</label>
        <input
          id="pw-current"
          name="current"
          type="password"
          required
          autoComplete="current-password"
          className="input-base"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-ink-muted" htmlFor="pw-next">New password</label>
          <input
            id="pw-next"
            name="next"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="input-base"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-ink-muted" htmlFor="pw-confirm">Confirm new password</label>
          <input
            id="pw-confirm"
            name="confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="input-base"
          />
        </div>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}
      {success && <p className="text-xs text-accent">Password changed successfully.</p>}

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-brand text-white rounded-lg hover:bg-brand-h disabled:opacity-60 transition-colors"
        >
          {isPending ? 'Updating…' : 'Update password'}
        </button>
      </div>
    </form>
  )
}
