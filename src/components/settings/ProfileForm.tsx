'use client'

import { useState, useTransition } from 'react'
import { updateProfileAction } from '@/server/actions/settings'
import { Combobox } from '@/components/ui/Combobox'

const CURRENCIES = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'CAD', label: 'CAD — Canadian Dollar' },
  { value: 'AUD', label: 'AUD — Australian Dollar' },
  { value: 'CHF', label: 'CHF — Swiss Franc' },
  { value: 'JPY', label: 'JPY — Japanese Yen' },
  { value: 'CNY', label: 'CNY — Chinese Yuan' },
  { value: 'INR', label: 'INR — Indian Rupee' },
  { value: 'BRL', label: 'BRL — Brazilian Real' },
  { value: 'MXN', label: 'MXN — Mexican Peso' },
  { value: 'KRW', label: 'KRW — South Korean Won' },
  { value: 'SGD', label: 'SGD — Singapore Dollar' },
  { value: 'HKD', label: 'HKD — Hong Kong Dollar' },
  { value: 'NOK', label: 'NOK — Norwegian Krone' },
  { value: 'SEK', label: 'SEK — Swedish Krona' },
  { value: 'DKK', label: 'DKK — Danish Krone' },
  { value: 'NZD', label: 'NZD — New Zealand Dollar' },
  { value: 'AED', label: 'AED — UAE Dirham' },
  { value: 'SAR', label: 'SAR — Saudi Riyal' },
  { value: 'QAR', label: 'QAR — Qatari Riyal' },
  { value: 'KWD', label: 'KWD — Kuwaiti Dinar' },
  { value: 'MAD', label: 'MAD — Moroccan Dirham' },
  { value: 'EGP', label: 'EGP — Egyptian Pound' },
  { value: 'TRY', label: 'TRY — Turkish Lira' },
  { value: 'ZAR', label: 'ZAR — South African Rand' },
  { value: 'NGN', label: 'NGN — Nigerian Naira' },
  { value: 'PKR', label: 'PKR — Pakistani Rupee' },
  { value: 'BDT', label: 'BDT — Bangladeshi Taka' },
  { value: 'IDR', label: 'IDR — Indonesian Rupiah' },
  { value: 'MYR', label: 'MYR — Malaysian Ringgit' },
  { value: 'THB', label: 'THB — Thai Baht' },
  { value: 'PHP', label: 'PHP — Philippine Peso' },
  { value: 'VND', label: 'VND — Vietnamese Dong' },
  { value: 'COP', label: 'COP — Colombian Peso' },
  { value: 'ARS', label: 'ARS — Argentine Peso' },
  { value: 'CLP', label: 'CLP — Chilean Peso' },
  { value: 'PLN', label: 'PLN — Polish Zloty' },
  { value: 'CZK', label: 'CZK — Czech Koruna' },
  { value: 'HUF', label: 'HUF — Hungarian Forint' },
  { value: 'RON', label: 'RON — Romanian Leu' },
  { value: 'DZD', label: 'DZD — Algerian Dinar' },
  { value: 'TND', label: 'TND — Tunisian Dinar' },
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
  const [currency, setCurrency] = useState(baseCurrency)

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
        <Combobox
          id="profile-currency"
          name="baseCurrency"
          value={currency}
          onChange={setCurrency}
          options={CURRENCIES}
          searchPlaceholder="Search currencies…"
        />
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
