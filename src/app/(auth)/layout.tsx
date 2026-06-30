import type { Metadata } from 'next'
import Link from 'next/link'
import { ReckLogo } from '@/components/ui/ReckLogo'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ colorScheme: 'light', background: '#fafafa' }}
    >
      {/* Top bar */}
      <header className="h-14 flex items-center px-6 sm:px-8">
        <Link href="/" aria-label="Reckon home">
          <ReckLogo width={96} color="#09090b" />
        </Link>
      </header>

      {/* Form area */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[400px]">
          <div
            className="bg-white rounded-2xl border border-zinc-200 px-8 py-9"
            style={{ boxShadow: '0 4px 24px -4px rgba(0,0,0,0.06)' }}
          >
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-12 flex items-center justify-center">
        <p className="text-[11px] text-zinc-400">
          © {new Date().getFullYear()} Reckon · Your data stays private
        </p>
      </footer>
    </div>
  )
}
