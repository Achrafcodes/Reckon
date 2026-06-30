'use client'
import { motion, useReducedMotion } from 'motion/react'
import Link from 'next/link'

const FEATURES = [
  'Unlimited transactions',
  'Unlimited budgets & categories',
  'CSV, Excel & PDF import',
  'Budget summary import',
  'Advanced analytics & trends',
  'Spending insights (auto-generated)',
  'Recurring subscription detection',
  'PDF & Excel reports',
  'Private — no third-party tracking',
  'Priority support',
]

export function LandingPricing() {
  const reduce = useReducedMotion()

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-[#f1f5f9] border-t border-slate-200">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Simple, honest pricing
          </h2>
          <p className="mt-3 text-sm text-slate-500 max-w-md mx-auto">
            One plan. Everything included. Cancel any time.
          </p>
        </motion.div>

        <div className="mt-12 max-w-sm mx-auto">
          <motion.div
            className="rounded-2xl border-2 border-[#1e40af] bg-white p-8 text-left flex flex-col relative overflow-hidden"
            initial={reduce ? undefined : { opacity: 0, y: 32, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
            style={{
              boxShadow: '0 20px 60px -10px rgba(30,64,175,0.18), 0 4px 16px -4px rgba(0,0,0,0.06)',
              animation: reduce ? 'none' : 'landing-border-glow 4s ease-in-out infinite',
            }}
          >
            {/* Subtle top shine */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(30,64,175,0.4), transparent)' }}
            />

            <p className="text-sm font-semibold text-[#1e40af] uppercase tracking-wide">Reckon Pro</p>

            <div className="mt-3 flex items-end gap-2">
              <p className="text-5xl font-bold text-slate-900 tracking-tight tabular-nums">49</p>
              <div className="mb-1.5 text-left">
                <p className="text-sm font-medium text-slate-500">MAD</p>
                <p className="text-xs text-slate-400">per month</p>
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-400">or 490 MAD / year — save 2 months</p>

            <ul className="mt-7 space-y-3">
              {FEATURES.map((f, i) => (
                <motion.li
                  key={f}
                  className="flex items-center gap-2.5 text-sm text-slate-700"
                  initial={reduce ? undefined : { opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.04, duration: 0.35 }}
                >
                  <svg className="shrink-0 text-[#1e40af]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <polyline strokeLinecap="round" strokeLinejoin="round" points="20 6 9 17 4 12" />
                  </svg>
                  {f}
                </motion.li>
              ))}
            </ul>

            {/* CTA */}
            <div className="mt-8 relative group">
              <Link
                href="/register"
                className="block w-full rounded-xl bg-[#1e40af] hover:bg-[#1d4ed8] py-3 text-center text-sm font-semibold text-white transition-all duration-200 shadow-md shadow-blue-900/20 hover:shadow-blue-800/40 hover:-translate-y-0.5 active:scale-[0.98] relative overflow-hidden"
              >
                {/* Shimmer effect */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
                  }}
                />
                <span className="relative">Subscribe now</span>
              </Link>
            </div>

            <p className="mt-3 text-center text-xs text-slate-400">
              7-day free trial · Cancel any time
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
