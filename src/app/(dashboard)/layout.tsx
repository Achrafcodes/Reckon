import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/server/auth/session'
import { DashboardShell } from '@/components/layout/DashboardShell'
import type { SafeUser } from '@/types'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

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

  return <DashboardShell user={safeUser}>{children}</DashboardShell>
}
