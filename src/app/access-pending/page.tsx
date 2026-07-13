import Link from 'next/link'
import type { Metadata } from 'next'
import { getCurrentUser } from '@/server/auth/session'
import { redirect } from 'next/navigation'
import { ReckLogo } from '@/components/ui/ReckLogo'
import { LogoutButton } from '@/components/ui/LogoutButton'
import { ACCESS_CONTACT_EMAIL, ACCESS_MAILTO } from '@/lib/contact'
import { isAdminEmail } from '@/lib/admin'

export const metadata: Metadata = { title: 'Access pending — Reckon' }

export default async function AccessPendingPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.subscription?.status === 'active' || isAdminEmail(user.email)) redirect('/dashboard')

  return (
    <div className="min-h-dvh bg-[#fafafa] flex flex-col">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 flex items-center justify-between">
        <Link href="/" aria-label="Reckon home">
          <ReckLogo width={88} color="#09090b" />
        </Link>
        <LogoutButton className="text-xs text-zinc-400 hover:text-zinc-800 transition-colors" />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="text-zinc-500" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              Hey {user.name.split(' ')[0]}, your account is created
            </h1>
            <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
              Reckon isn&apos;t self-serve yet — accounts are set up by hand. We&apos;ll email you at{' '}
              <span className="font-medium text-zinc-700">{user.email}</span> once access is turned on.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-left space-y-3"
            style={{ boxShadow: '0 8px 40px -8px rgba(0,0,0,0.08)' }}
          >
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">In the meantime</p>
            <Link
              href="/demo"
              className="flex items-center justify-between gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
            >
              Try the live demo
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <a
              href={ACCESS_MAILTO}
              className="flex items-center justify-between gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
            >
              Need it sooner? Email {ACCESS_CONTACT_EMAIL}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
