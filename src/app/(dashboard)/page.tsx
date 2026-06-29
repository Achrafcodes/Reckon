import { getCurrentUser } from '@/server/auth/session'
import { KPICard } from '@/components/dashboard/KPICard'
import { ImportPrompt } from '@/components/dashboard/ImportPrompt'
import { Greeting } from '@/components/dashboard/Greeting'

export const metadata = { title: 'Dashboard — Reckon' }

const kpis = [
  {
    label: 'This month',
    value: '£—',
    sub: 'No transactions yet',
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Transactions',
    value: '0',
    sub: 'Import to get started',
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" />
      </svg>
    ),
  },
  {
    label: 'Categories',
    value: '0',
    sub: 'Auto-assigned on import',
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 12h.01M7 17h.01M11 7h6M11 12h6M11 17h6" />
      </svg>
    ),
  },
  {
    label: 'Budget usage',
    value: '—',
    sub: 'Set a budget to track',
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" d="M12 7v5l3 3" />
      </svg>
    ),
  },
]

export default async function DashboardPage() {
  const user = await getCurrentUser()

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Greeting */}
      <Greeting name={user?.name ?? 'there'} />

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <KPICard
            key={kpi.label}
            {...kpi}
            style={{ animationDelay: `${60 + i * 70}ms` }}
          />
        ))}
      </div>

      {/* Empty state */}
      <ImportPrompt />
    </div>
  )
}
