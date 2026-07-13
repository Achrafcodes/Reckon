import Link from 'next/link'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/server/auth/session'
import { isAdminEmail } from '@/lib/admin'
import { getAdminStats, listUsersForAdmin, listEarlyAccessRequests } from '@/server/services/admin.service'
import { ReckLogo } from '@/components/ui/ReckLogo'
import { LogoutButton } from '@/components/ui/LogoutButton'
import { UserActions } from '@/components/admin/UserActions'
import { DeleteSignupButton } from '@/components/admin/DeleteSignupButton'

export const metadata: Metadata = { title: 'Admin — Reckon', robots: { index: false, follow: false } }

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const STATUS_STYLE: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-zinc-100 text-zinc-500',
}

export default async function AdminPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!isAdminEmail(user.email)) redirect('/dashboard')

  const [stats, users, signups] = await Promise.all([
    getAdminStats(),
    listUsersForAdmin(),
    listEarlyAccessRequests(),
  ])

  const cards = [
    { label: 'Total users', value: stats.totalUsers },
    { label: 'Active', value: stats.activeUsers },
    { label: 'Pending approval', value: stats.pendingUsers },
    { label: 'Access requests', value: stats.earlyAccessRequests },
    { label: 'Total transactions', value: stats.totalTransactions },
  ]

  return (
    <div className="min-h-dvh bg-[#fafafa]">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Reckon home">
            <ReckLogo width={88} color="#09090b" />
          </Link>
          <span className="inline-flex items-center rounded-full bg-zinc-900 px-2.5 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wide">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-xs text-zinc-500 hover:text-zinc-800 transition-colors">
            Your dashboard
          </Link>
          <LogoutButton className="text-xs text-zinc-400 hover:text-zinc-800 transition-colors" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-10">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-2xl font-bold text-zinc-900 tabular-nums">{c.value}</p>
              <p className="mt-0.5 text-xs text-zinc-500">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Access requests */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-900 mb-3">
            Access requests <span className="text-zinc-400 font-normal">({signups.length})</span>
          </h2>
          <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
            {signups.length === 0 ? (
              <p className="p-6 text-sm text-zinc-400 text-center">No access requests yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50 text-left">
                    <th className="px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Email</th>
                    <th className="px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Name</th>
                    <th className="px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Source</th>
                    <th className="px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Requested</th>
                    <th className="px-4 py-2.5 w-16" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {signups.map((s) => (
                    <tr key={s._id}>
                      <td className="px-4 py-2.5">
                        <a href={`mailto:${s.email}`} className="text-zinc-800 hover:underline">{s.email}</a>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-500">{s.firstName || '—'}</td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500">{s.source}</span>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-400 text-xs whitespace-nowrap">{timeAgo(s.createdAt)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <DeleteSignupButton id={s._id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Users */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-900 mb-3">
            Users <span className="text-zinc-400 font-normal">({users.length})</span>
          </h2>
          <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50 text-left">
                  <th className="px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Name</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Email</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Joined</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wide">Last login</th>
                  <th className="px-4 py-2.5 w-28" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {users.map((u) => (
                  <tr key={u._id}>
                    <td className="px-4 py-2.5 font-medium text-zinc-800">{u.name}</td>
                    <td className="px-4 py-2.5 text-zinc-500">{u.email}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${STATUS_STYLE[u.subscriptionStatus]}`}>
                        {u.subscriptionStatus}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-zinc-400 text-xs whitespace-nowrap">{timeAgo(u.createdAt)}</td>
                    <td className="px-4 py-2.5 text-zinc-400 text-xs whitespace-nowrap">
                      {u.lastLoginAt ? timeAgo(u.lastLoginAt) : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <UserActions userId={u._id} status={u.subscriptionStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
