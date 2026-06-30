'use client'
import { motion, useReducedMotion } from 'motion/react'
import Link from 'next/link'

const STEPS = [
  {
    n: '1',
    title: 'Subscribe',
    body: 'Pick a plan. No trial barriers — you get full access from day one and can cancel any time.',
  },
  {
    n: '2',
    title: 'Upload a statement',
    body: 'Export a CSV or PDF from your bank app and drop it into Reckon. Done in under 10 seconds.',
  },
  {
    n: '3',
    title: 'See the picture clearly',
    body: 'Your dashboard, budgets, and category breakdown are live immediately. No setup, no manual entry.',
  },
]

export function LandingHowItWorks() {
  const reduce = useReducedMotion()

  return (
    <section className="py-20 sm:py-28 bg-white border-t border-zinc-100">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20 items-start">
          {/* Left: heading + CTA */}
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-zinc-400 mb-4">
              Getting started
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-normal text-zinc-900 leading-tight">
              Up and running<br />in three steps.
            </h2>
            <div className="mt-8">
              <Link
                href="/#pricing"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors"
              >
                Get started
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </motion.div>

          {/* Right: steps */}
          <div className="space-y-0 divide-y divide-zinc-100">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                className="py-7 flex gap-6 items-start"
                initial={reduce ? undefined : { opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.1, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="text-4xl font-bold text-zinc-100 tabular-nums leading-none select-none w-10 shrink-0" aria-hidden="true">
                  {s.n}
                </span>
                <div>
                  <p className="text-base font-semibold text-zinc-900 mb-1">{s.title}</p>
                  <p className="text-sm text-zinc-500 leading-relaxed">{s.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
