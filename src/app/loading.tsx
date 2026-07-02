// Root loading screen — streams instantly while Server Components do auth +
// DB work (first paint after login, hard reloads, slow navigations).
export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-bg animate-fade-in">
      {/* Logo mark with bouncing chart bars */}
      <div className="relative w-14 h-14 rounded-[14px] bg-brand flex items-end justify-center gap-1 px-2.5 pb-2.5 pt-3 shadow-lg shadow-black/10">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="loader-bar w-1.5 rounded-full bg-white origin-bottom"
            style={{
              height: `${14 + i * 6}px`,
              opacity: 0.35 + i * 0.3,
              animation: `loaderBar 1.1s cubic-bezier(0.45,0,0.55,1) ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Wordmark */}
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-lg font-semibold tracking-tight text-ink">Reckon</span>
        <span className="text-xs text-ink-muted">Loading your finances…</span>
      </div>
    </div>
  )
}
