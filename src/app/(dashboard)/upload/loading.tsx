function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-rule ${className ?? ''}`} />
}

export default function UploadLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-4 w-56" />
      </div>
      {/* Upload zone */}
      <Skeleton className="h-52 w-full rounded-xl border-2 border-dashed border-rule" />
      {/* History */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="card flex items-center gap-4 px-4 py-3">
            <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-2.5 w-24" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
