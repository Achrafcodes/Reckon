'use client'
import Link from 'next/link'
import { ReckLogo } from '@/components/ui/ReckLogo'
import { EarlyAccessModal } from '@/components/landing/EarlyAccessModal'

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-zinc-200/80">
      <div className="mx-auto max-w-6xl px-6 sm:px-8 flex h-14 items-center justify-between">
        <Link href="/" aria-label="Reckon home">
          <ReckLogo width={88} color="#09090b" markBg="#09090b" />
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Primary">
          <Link href="/demo" className="hidden sm:inline px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-900 rounded-md hover:bg-zinc-100 transition-colors">
            Demo
          </Link>
          <Link href="/#pricing" className="hidden sm:inline px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-900 rounded-md hover:bg-zinc-100 transition-colors">
            Pricing
          </Link>
          <Link href="/login" className="px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-900 rounded-md hover:bg-zinc-100 transition-colors">
            Sign in
          </Link>
          <EarlyAccessModal source="navbar">
            {({ onClick }) => (
              <button
                type="button"
                onClick={onClick}
                className="ml-1 px-4 py-1.5 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-700 rounded-lg transition-colors"
              >
                Request access
              </button>
            )}
          </EarlyAccessModal>
        </nav>
      </div>
    </header>
  )
}
