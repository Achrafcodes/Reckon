import Link from 'next/link'
import type { Metadata } from 'next'
import { getCurrentUser } from '@/server/auth/session'
import { redirect } from 'next/navigation'
import { ReckLogo } from '@/components/ui/ReckLogo'
import { LogoutButton } from '@/components/ui/LogoutButton'

export const metadata: Metadata = { title: 'Subscribe — Reckon' }

export default async function SubscribePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.subscription?.status === 'active') redirect('/dashboard')

  return (
    <div className="min-h-dvh bg-[#fafafa] flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white px-6 py-4 flex items-center justify-between">
        <Link href="/" aria-label="Reckon home">
          <ReckLogo width={88} color="#09090b" />
        </Link>
        <LogoutButton className="text-xs text-zinc-400 hover:text-zinc-800 transition-colors" />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Welcome */}
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              Welcome, {user.name.split(' ')[0]}
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500">
              Your account is ready. Subscribe to unlock full access.
            </p>
          </div>

          {/* Plan card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-7"
            style={{ boxShadow: '0 8px 40px -8px rgba(0,0,0,0.08)' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Reckon Pro</p>
                <div className="mt-2 flex items-end gap-2">
                  <p className="text-4xl font-bold text-zinc-900 tracking-tight tabular-nums">49</p>
                  <div className="mb-1">
                    <p className="text-sm font-medium text-zinc-500">MAD / month</p>
                  </div>
                </div>
                <p className="mt-0.5 text-xs text-zinc-400">or 490 MAD / year — save 2 months</p>
              </div>
              <span className="mt-1 inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-600 uppercase tracking-wide">
                7-day trial
              </span>
            </div>

            <div className="my-5 border-t border-zinc-100" />

            <ul className="space-y-2.5">
              {[
                'Unlimited transactions & imports',
                'CSV, Excel & PDF import',
                'Budget summary import',
                'Budgets, analytics & insights',
                'Recurring subscription detection',
                'PDF & Excel reports',
                'Priority support',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-600">
                  <svg className="shrink-0 text-zinc-300" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <polyline strokeLinecap="round" strokeLinejoin="round" points="20 6 9 17 4 12" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            {/* Payment CTA */}
            <a
              href={`https://buy.stripe.com/your-link?prefilled_email=${encodeURIComponent(user.email)}`}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-700 py-3.5 text-sm font-semibold text-white transition-colors"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
              </svg>
              Subscribe now — 49 MAD / mo
            </a>
            <p className="mt-3 text-center text-xs text-zinc-400">
              7-day free trial · Cancel any time · Secure payment
            </p>
          </div>

          <p className="text-center text-xs text-zinc-400">
            Already subscribed or need help?{' '}
            <a href="mailto:support@reckon.app" className="text-zinc-700 hover:underline font-medium">
              Contact support
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
