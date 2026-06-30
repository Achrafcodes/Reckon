'use client'

import { useState, useTransition } from 'react'
import { updateProfileAction } from '@/server/actions/settings'
import { Select } from '@/components/ui/Select'

const CURRENCIES = [
  { value: 'MAD', label: 'MAD — Moroccan Dirham' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'AED', label: 'AED — UAE Dirham' },
  { value: 'SAR', label: 'SAR — Saudi Riyal' },
  { value: 'CAD', label: 'CAD — Canadian Dollar' },
  { value: 'CHF', label: 'CHF — Swiss Franc' },
]

interface Props {
  name: string
  email: string
  baseCurrency: string
}

export function ProfileForm({ name, email, baseCurrency }: Props) {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateProfileAction(formData)
      if (result.ok) setSuccess(true)
      else setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-ink-muted" htmlFor="profile-name">Full name</label>
          <input
            id="profile-name"
            name="name"
            type="text"
            required
            defaultValue={name}
            maxLength={60}
            className="input-base"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-ink-muted" htmlFor="profile-email">Email</label>
          <input
            id="profile-email"
            name="email"
            type="email"
            required
            defaultValue={email}
            className="input-base"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-ink-muted" htmlFor="profile-currency">Base currency</label>
        <Select
          id="profile-currency"
          name="baseCurrency"
          defaultValue={baseCurrency}
        >
          {CURRENCIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </Select>
        <p className="text-xs text-ink-muted">Used for display and exports. Doesn&apos;t convert existing transactions.</p>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}
      {success && <p className="text-xs text-accent">Profile updated.</p>}

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-brand text-white rounded-lg hover:bg-brand-h disabled:opacity-60 transition-colors"
        >
          {isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
