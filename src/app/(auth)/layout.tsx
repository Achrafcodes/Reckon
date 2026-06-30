import type { Metadata } from 'next'
import { ReckLogo } from '@/components/ui/ReckLogo'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex">
      {/* ── Form panel ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-surface sm:px-10 lg:px-16">
        <div className="w-full max-w-sm mx-auto">
          {/* Logo */}
          <div className="mb-10">
            <ReckLogo width={108} color="#09090b" />
          </div>
          {children}
        </div>

        {/* Footer */}
        <p className="mt-16 text-center text-[11px] text-ink-faint">
          © {new Date().getFullYear()} Reckon. All rights reserved.
        </p>
      </div>

      {/* ── Brand panel (large screens) ───────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[480px] xl:w-[560px] shrink-0 flex-col justify-between px-14 py-14 relative overflow-hidden"
        style={{
          background: 'linear-gradient(150deg, #0f172a 0%, #0d2818 50%, #0f172a 100%)',
        }}
      >
        {/* Subtle grid pattern */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 40px),' +
              'repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)',
          }}
        />

        {/* Top: mark-only logo */}
        <div className="relative z-10">
          <ReckLogo markOnly width={32} markBg="rgba(255,255,255,0.08)" color="rgba(255,255,255,0.25)" />
        </div>

        {/* Middle: headline */}
        <div className="relative z-10">
          <p
            className="text-5xl xl:text-6xl leading-[1.1] text-white mb-6"
            style={{ fontFamily: 'var(--font-dm-serif)', fontStyle: 'italic' }}
          >
            Know where every dirham goes.
          </p>
          <p className="text-[15px] text-sidebar-txt leading-relaxed max-w-xs opacity-80">
            Upload a bank statement. Reckon categorises, tracks, and makes sense
            of your money — without the spreadsheet.
          </p>

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap gap-2">
            {['Auto-categorisation', 'Budget alerts', 'PDF & Excel export', 'Secure'].map((f) => (
              <span
                key={f}
                className="px-3 py-1 text-xs font-medium rounded-full border border-white/10 text-white/60"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="relative z-10 text-[11px] tracking-widest uppercase text-white/25 font-medium">
          Reckon &mdash; Financial clarity
        </p>
      </div>
    </div>
  )
}
