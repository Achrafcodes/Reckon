import type { Metadata } from 'next'
import { ReckLogo } from '@/components/ui/ReckLogo'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex">
      {/* ── Form panel ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-white sm:px-10 lg:px-16">
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-10">
            <ReckLogo width={104} color="#09090b" />
          </div>
          {children}
        </div>
        <p className="mt-16 text-center text-[11px] text-zinc-400">
          © {new Date().getFullYear()} Reckon. All rights reserved.
        </p>
      </div>

      {/* ── Brand panel (large screens) ───────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[460px] xl:w-[520px] shrink-0 flex-col justify-between px-14 py-14 relative overflow-hidden bg-[#0a0a0a]"
      >
        {/* Same dot grid as landing hero */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Top: mark */}
        <div className="relative z-10">
          <ReckLogo markOnly width={28} markBg="#27272a" color="white" />
        </div>

        {/* Middle: headline */}
        <div className="relative z-10">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-zinc-600 mb-6">
            Personal finance · Morocco
          </p>
          <p className="text-4xl xl:text-5xl font-bold text-white leading-[1.05] tracking-tight mb-5">
            Know where<br />every dirham<br />
            <span className="text-zinc-500">actually goes.</span>
          </p>
          <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
            Upload a bank statement. Reckon categorises your spending, tracks
            budgets, and surfaces insights automatically.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {['Auto-categorisation', 'Budget alerts', 'PDF & Excel export', 'Private'].map((f) => (
              <span
                key={f}
                className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-white/8 text-zinc-500"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="relative z-10 text-[10px] tracking-[0.2em] uppercase text-zinc-700 font-medium">
          Reckon — Financial clarity
        </p>
      </div>
    </div>
  )
}
