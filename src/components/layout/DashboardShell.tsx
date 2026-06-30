'use client'
import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { NotificationBell } from './NotificationBell'
import { RouteLoader } from '@/components/ui/RouteLoader'
import type { SafeUser } from '@/types'
import type { NotificationRow } from '@/server/services/notification.service'

export function DashboardShell({
  user,
  notifications,
  children,
}: {
  user: SafeUser
  notifications: NotificationRow[]
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-dvh overflow-hidden bg-bg">
      <RouteLoader />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar user={user} onMenuClick={() => setSidebarOpen(true)}>
          <NotificationBell initialNotifications={notifications} />
        </Topbar>
        <main id="main-content" className="flex-1 overflow-y-auto p-5 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
