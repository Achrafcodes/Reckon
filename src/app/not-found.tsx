import Link from 'next/link'
import { ReckLogo } from '@/components/ui/ReckLogo'

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <header className="border-b border-zinc-100 px-6 py-4">
        <Link href="/" aria-label="Reckon home">
          <ReckLogo width={88} color="#09090b" />
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="relative select-none mb-10" aria-hidden="true">
          <p className="text-[140px] sm:text-[180px] font-bold leading-none tabular-nums text-zinc-100 tracking-tight">
            404
          </p>
          <div className="absolute inset-0 flex items-end justify-center gap-2.5 pb-8 sm:pb-10">
            {[40, 65, 30, 80, 50].map((h, i) => (
              <div
                key={i}
                className="w-5 sm:w-7 rounded-t-md"
                style={{ height: `${h}%`, background: i === 3 ? '#09090b' : '#e4e4e7' }}
              />
            ))}
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 tracking-tight">
          This page doesn&apos;t exist
        </h1>
        <p className="mt-2 text-sm text-zinc-500 max-w-xs leading-relaxed">
          The page you&apos;re looking for may have been moved, deleted, or you may have mistyped the URL.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors"
          >
            Go to dashboard
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </main>
    </div>
  )
}
