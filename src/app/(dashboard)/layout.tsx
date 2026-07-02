import { redirect } from 'next/navigation'
import { getCurrentUser, getSession } from '@/server/auth/session'
import { getRecentNotifications } from '@/server/services/notification.service'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { SessionProvider } from '@/components/providers/SessionProvider'
import type { Metadata } from 'next'
import type { SafeUser } from '@/types'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // getSession is JWT-only (no DB) — gives us the userId so the user fetch and
  // notification query can run in parallel instead of back-to-back
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  const [user, notifications] = await Promise.all([
    getCurrentUser(),
    getRecentNotifications(session.userId),
  ])

  if (!user) {
    redirect('/login')
  }

  const safeUser: SafeUser = {
    _id: String(user._id),
    name: user.name,
    email: user.email,
    settings: user.settings,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString(),
  }

  return (
    <SessionProvider user={{
      _id: safeUser._id,
      name: safeUser.name,
      email: safeUser.email,
      baseCurrency: safeUser.settings?.baseCurrency ?? 'USD',
    }}>
      <DashboardShell user={safeUser} notifications={notifications}>
        {children}
      </DashboardShell>
    </SessionProvider>
  )
}
