function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-rule ${className ?? ''}`} />
}

export default function SettingsLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-48" />
      </div>

      {[0, 1, 2].map((i) => (
        <div key={i} className="card p-6 space-y-5">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      ))}
    </div>
  )
}
