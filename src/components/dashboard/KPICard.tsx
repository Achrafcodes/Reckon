interface KPICardProps {
  label: string
  value: string
  sub: string
  icon: React.ReactNode
  style?: React.CSSProperties
}

export function KPICard({ label, value, sub, icon, style }: KPICardProps) {
  return (
    <div
      className="animate-fade-up bg-paper border border-rule rounded-xl p-6 flex flex-col gap-4"
      style={style}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink-muted uppercase tracking-widest">{label}</span>
        <span className="text-ink-muted/60">{icon}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span
          className="text-3xl font-semibold text-ink tabular-nums tracking-tight"
          style={{ fontFamily: 'var(--font-geist-mono)' }}
        >
          {value}
        </span>
        <span className="text-xs text-ink-muted">{sub}</span>
      </div>
    </div>
  )
}
