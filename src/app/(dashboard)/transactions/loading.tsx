function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`animate-pulse rounded-lg bg-rule ${className ?? ''}`} style={style} />
}

export default function TransactionsLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 flex-1 min-w-[180px] rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      {/* Table card */}
      <div className="card overflow-hidden">
        {/* Table header */}
        <div className="hidden md:flex border-b border-rule bg-mist/50 px-4 py-3 gap-4">
          {[112, undefined, 144, 128, 40].map((w, i) => (
            <Skeleton
              key={i}
              className="h-3"
              style={{ width: w ?? undefined, flex: w ? undefined : 1 }}
            />
          ))}
        </div>
        {/* Rows */}
        <div className="divide-y divide-rule">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5">
              <Skeleton className="h-3 w-20 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-2.5 w-24" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full shrink-0" />
              <Skeleton className="h-3 w-16 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
