function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-rule ${className ?? ''}`} />
}

export default function AnalyticsLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-4 w-60" />
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card p-4 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5 space-y-4">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="card p-5 space-y-4">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-48 w-full rounded-full mx-auto aspect-square max-w-[200px]" />
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-56 w-full" />
      </div>
    </div>
  )
}
