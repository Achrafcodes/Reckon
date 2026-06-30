'use client'
import { motion, useReducedMotion } from 'motion/react'
import Link from 'next/link'

const ease = [0.16, 1, 0.3, 1] as const

export function LandingHero() {
  const reduce = useReducedMotion()

  return (
    <section className="relative bg-[#0a0a0a] text-white overflow-hidden">
      {/* Dot grid — very subtle */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Bottom fade to white */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #0a0a0a 60%, #fff 100%)' }}
      />

      <div className="relative mx-auto max-w-6xl px-6 sm:px-8 pt-20 pb-32 sm:pt-28 sm:pb-40">
        {/* Eyebrow */}
        <motion.p
          className="text-[11px] font-semibold tracking-[0.18em] uppercase text-zinc-500 mb-10"
          initial={reduce ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease }}
        >
          Personal finance · Morocco
        </motion.p>

        {/* Headline — big, plain, no tricks */}
        <motion.h1
          className="text-[clamp(2.8rem,7vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.03em] max-w-4xl"
          initial={reduce ? undefined : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.05, ease }}
        >
          <span className="text-white">Know where</span>
          <br />
          <span className="text-white">every dirham</span>
          <br />
          <span className="text-zinc-500">actually goes.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          className="mt-8 text-base sm:text-lg text-zinc-400 max-w-md leading-relaxed"
          initial={reduce ? undefined : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.18, ease }}
        >
          Upload your bank statement. Reckon categorises spending, tracks budgets,
          and surfaces insights — automatically.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="mt-10 flex items-center gap-4 flex-wrap"
          initial={reduce ? undefined : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.28, ease }}
        >
          <Link
            href="/#pricing"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-zinc-900 text-sm font-semibold hover:bg-zinc-100 transition-colors"
          >
            See pricing
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <Link
            href="/demo"
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Try live demo →
          </Link>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          className="mt-16 flex flex-wrap gap-x-8 gap-y-4"
          initial={reduce ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.42, ease }}
        >
          {[
            { value: '< 5 s',     label: 'to parse a statement' },
            { value: '100 %',     label: 'private — no tracking' },
            { value: 'PDF + XLS', label: 'export formats' },
          ].map((s) => (
            <div key={s.label} className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-white tabular-nums">{s.value}</span>
              <span className="text-xs text-zinc-600">{s.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
