import Link from 'next/link'
import { ReckLogo } from '@/components/ui/ReckLogo'

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      <header className="border-b border-border bg-surface px-6 py-4">
        <Link href="/" aria-label="Reckon home">
          <ReckLogo width={88} />
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        {/* Large 404 */}
        <div className="relative select-none mb-8" aria-hidden="true">
          <p className="text-[120px] sm:text-[160px] font-bold leading-none tabular-nums text-border">
            404
          </p>
          {/* Overlaid bar chart — reuses the brand mark concept */}
          <div className="absolute inset-0 flex items-end justify-center gap-2 pb-6 sm:pb-8">
            {[40, 65, 30, 80, 50].map((h, i) => (
              <div
                key={i}
                className="w-5 sm:w-7 rounded-t-md"
                style={{
                  height: `${h}%`,
                  background: i === 3 ? 'var(--color-brand)' : 'var(--color-border-s)',
                  opacity: i === 3 ? 1 : 0.5,
                }}
              />
            ))}
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-semibold text-ink tracking-tight">
          This page doesn&apos;t exist
        </h1>
        <p className="mt-2 text-sm text-ink-muted max-w-xs">
          The page you&apos;re looking for may have been moved, deleted, or you may have mistyped the URL.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-h transition-colors"
          >
            Go to dashboard
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-border bg-surface text-sm font-medium text-ink hover:bg-surface-r transition-colors"
          >
            Back to home
          </Link>
        </div>
      </main>
    </div>
  )
}
