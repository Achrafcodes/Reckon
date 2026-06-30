'use client'
import { motion, useReducedMotion } from 'motion/react'
import Link from 'next/link'

const STATS = [
  { value: '< 5s',      label: 'to parse a statement' },
  { value: '100%',      label: 'private — no tracking' },
  { value: 'PDF + XLS', label: 'export formats' },
]

const ease = [0.21, 0.47, 0.32, 0.98] as const

export function LandingHero() {
  const reduce = useReducedMotion()

  function fadeUp(delay = 0) {
    if (reduce) return {}
    return {
      initial: { opacity: 0, y: 28 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.65, delay, ease },
    }
  }

  return (
    <section className="relative overflow-hidden bg-[#0f172a] text-white">
      {/* Subtle grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Pulsing blue orb */}
      <motion.div
        aria-hidden="true"
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[780px] h-[560px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(30,64,175,0.38) 0%, transparent 68%)' }}
        animate={reduce ? {} : { scale: [1, 1.07, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Drifting teal accent */}
      <motion.div
        aria-hidden="true"
        className="absolute top-24 -right-48 w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(52,211,153,0.1) 0%, transparent 70%)' }}
        animate={reduce ? {} : { x: [0, 18, 0], y: [0, -22, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-20 sm:py-28 text-center">
        {/* Badge */}
        <motion.div {...fadeUp(0)}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-blue-300 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" aria-hidden="true" />
            Personal finance, finally simple
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...fadeUp(0.1)}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]"
        >
          Your money,{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(135deg, #60a5fa 0%, #34d399 50%, #60a5fa 100%)',
              backgroundSize: '200% auto',
              animation: reduce ? 'none' : 'landing-gradient-x 5s ease infinite',
            }}
          >
            finally clear.
          </span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          {...fadeUp(0.2)}
          className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
        >
          Upload a bank statement and instantly see where your money goes. Budgets, category
          analytics, and recurring detection — no spreadsheet acrobatics required.
        </motion.p>

        {/* CTAs */}
        <motion.div
          {...fadeUp(0.3)}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/#pricing"
            className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-[#1e40af] hover:bg-[#1d4ed8] rounded-xl transition-all duration-200 shadow-lg shadow-blue-900/40 hover:shadow-blue-800/60 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            See pricing →
          </Link>
          <Link
            href="/demo"
            className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-slate-300 border border-white/15 hover:border-white/35 hover:text-white rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            Try live demo
          </Link>
        </motion.div>

        {/* Stats */}
        <div className="mt-14 grid grid-cols-3 gap-6 border-t border-white/10 pt-10">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              className="flex flex-col items-center gap-1"
              initial={reduce ? undefined : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 + i * 0.09, duration: 0.5, ease }}
            >
              <span className="text-xl sm:text-2xl font-bold text-white tabular-nums">{s.value}</span>
              <span className="text-xs text-slate-400">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Soft blend into next section */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 inset-x-0 h-20 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.06))' }}
      />
    </section>
  )
}
