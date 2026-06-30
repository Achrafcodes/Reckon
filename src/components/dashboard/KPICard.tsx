interface KPICardProps {
  label: string
  value: string
  sub: string
  subColor?: string
  icon: React.ReactNode
  /** Optional trend: positive = green up-arrow, negative = red down-arrow */
  trend?: 'up' | 'down' | 'neutral'
  style?: React.CSSProperties
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'neutral' }) {
  if (trend === 'neutral') return null
  const up = trend === 'up'
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
        up ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'
      }`}
      aria-hidden="true"
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d={up ? 'M2.25 18 9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.519l2.74-1.22m0 0-5.94-2.28m5.94 2.28-2.28 5.941' : 'M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181'}
        />
      </svg>
    </span>
  )
}

export function KPICard({ label, value, sub, subColor, icon, trend, style }: KPICardProps) {
  return (
    <div
      className="animate-fade-up card p-4 sm:p-5 flex flex-col gap-3 cursor-default"
      style={style}
    >
      {/* Header row: label + icon */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-widest">
          {label}
        </span>
        <span className="text-ink-faint p-1.5 rounded-md bg-surface-r">
          {icon}
        </span>
      </div>

      {/* Value */}
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <span
            className="text-xl sm:text-2xl font-semibold text-ink tabular-nums tracking-tight leading-none"
            style={{ fontFamily: 'var(--font-geist-mono)' }}
          >
            {value}
          </span>
          {trend && trend !== 'neutral' && <TrendIcon trend={trend} />}
        </div>
        <span className={`text-xs ${subColor ?? 'text-ink-muted'}`}>{sub}</span>
      </div>
    </div>
  )
}
