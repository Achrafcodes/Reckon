import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/server/auth/session'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
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

  return (
    <div className="flex h-screen overflow-hidden bg-mist">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar user={safeUser} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
