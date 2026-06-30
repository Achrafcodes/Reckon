import type { Metadata } from 'next'
import Link from 'next/link'
import { ReckLogo } from '@/components/ui/ReckLogo'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

const HIGHLIGHTS = [
  {
    icon: '↑',
    label: 'Know your spending',
    sub: 'See exactly where every penny goes, broken into clear categories.',
  },
  {
    icon: '◎',
    label: 'Set budgets, get alerts',
    sub: 'Define limits per category and get notified before you overspend.',
  },
  {
    icon: '⬡',
    label: 'Upload any bank export',
    sub: 'Drag in a CSV or Excel from any bank — we parse it automatically.',
  },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex" style={{ colorScheme: 'light' }}>

      {/* ── Left: Form ──────────────────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col"
        style={{ background: '#fafafa' }}
      >
        {/* Top bar */}
        <header className="h-14 flex items-center px-6 sm:px-10">
          <Link href="/" aria-label="Reckon home">
            <ReckLogo width={88} color="#09090b" />
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[400px]">
            <div
              className="bg-white rounded-2xl border border-zinc-200 px-8 py-9"
              style={{ boxShadow: '0 4px 24px -4px rgba(0,0,0,0.06)', colorScheme: 'light' }}
            >
              {children}
            </div>
          </div>
        </main>

        <footer className="h-12 flex items-center justify-center">
          <p className="text-[11px] text-zinc-400">
            © {new Date().getFullYear()} Reckon · Your data stays private
          </p>
        </footer>
      </div>

      {/* ── Right: Dark editorial panel ─────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[460px] xl:w-[500px] flex-col flex-shrink-0 relative overflow-hidden"
        style={{ background: '#0a0a0a' }}
      >
        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #0a0a0a, transparent)' }}
        />

        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo */}
          <Link href="/" aria-label="Reckon home">
            <ReckLogo width={88} color="rgba(255,255,255,0.7)" markBg="#27272a" />
          </Link>

          {/* Content — pushed to bottom */}
          <div className="mt-auto mb-10">
            <p className="text-xs font-medium tracking-widest uppercase text-zinc-600 mb-5">
              Financial clarity
            </p>
            <h2 className="text-[2rem] font-bold leading-[1.1] tracking-[-0.03em] text-white">
              Know where your<br />
              <span className="text-zinc-500">money actually goes.</span>
            </h2>

            <div className="mt-10 flex flex-col gap-6">
              {HIGHLIGHTS.map(({ icon, label, sub }) => (
                <div key={label} className="flex gap-4 items-start">
                  <span
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold text-white/70"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    {icon}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white leading-tight">{label}</p>
                    <p className="text-sm text-zinc-500 mt-0.5 leading-snug">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
