function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-rule ${className ?? ''}`} />
}

export default function CategoriesLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-72" />
      </div>

      {['Your categories', 'System categories'].map((section) => (
        <div key={section} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-52" />
            </div>
            {section === 'Your categories' && <Skeleton className="h-9 w-32 rounded-lg" />}
          </div>
          <div className="card divide-y divide-rule overflow-hidden">
            {Array.from({ length: section === 'Your categories' ? 3 : 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="w-3 h-3 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
                {section === 'Your categories' && (
                  <div className="flex gap-1">
                    <Skeleton className="w-7 h-7 rounded-md" />
                    <Skeleton className="w-7 h-7 rounded-md" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
