import type { Insight, InsightKind } from '@/server/services/insights.service'

const kindConfig: Record<InsightKind, { bg: string; border: string; iconBg: string; icon: React.ReactNode }> = {
  positive: {
    bg: 'bg-forest-subtle',
    border: 'border-forest/20',
    iconBg: 'bg-forest',
    icon: (
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <polyline points="1.5 5 4 7.5 8.5 2.5" />
      </svg>
    ),
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-amber-200 dark:border-amber-800/40',
    iconBg: 'bg-amber-500',
    icon: (
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
        <line x1="5" y1="2" x2="5" y2="6" />
        <line x1="5" y1="8" x2="5" y2="8.5" />
      </svg>
    ),
  },
  danger: {
    bg: 'bg-danger-bg',
    border: 'border-danger/20',
    iconBg: 'bg-danger',
    icon: (
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
        <line x1="5" y1="2" x2="5" y2="5.5" />
        <line x1="5" y1="7.5" x2="5" y2="8" />
      </svg>
    ),
  },
  info: {
    bg: 'bg-brand/5',
    border: 'border-brand/15',
    iconBg: 'bg-brand',
    icon: (
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
        <line x1="5" y1="4.5" x2="5" y2="8" />
        <circle cx="5" cy="2.5" r="0.6" fill="white" />
      </svg>
    ),
  },
}

export function InsightsPanel({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) return null

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-ink">Spending insights</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {insights.map((insight, i) => {
          const cfg = kindConfig[insight.kind]
          return (
            <div
              key={i}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3.5 animate-fade-up ${cfg.bg} ${cfg.border}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${cfg.iconBg}`}>
                {cfg.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-ink">{insight.title}</p>
                <p className="mt-0.5 text-xs text-ink-muted leading-relaxed">{insight.body}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
