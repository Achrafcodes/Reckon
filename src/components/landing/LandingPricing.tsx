'use client'
import { motion, useReducedMotion } from 'motion/react'
import { EarlyAccessModal } from '@/components/landing/EarlyAccessModal'

const INCLUDED = [
  'Unlimited transactions & imports',
  'CSV, Excel & PDF bank statements',
  'Budget summary import',
  'Monthly budgets per category',
  'Analytics & spending trends',
  'Auto-generated spending insights',
  'Recurring subscription detection',
  'PDF & Excel export',
  'Private, no third-party tracking',
  'Priority support',
]

export function LandingPricing() {
  const reduce = useReducedMotion()

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-[#fafafa] border-t border-zinc-100">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left: copy */}
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-zinc-600 mb-4">
              Pricing
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-normal text-zinc-900 leading-tight">
              One plan.<br />Everything included.
            </h2>
            <p className="mt-5 text-base text-zinc-500 leading-relaxed max-w-sm">
              No tiers, no feature gates, no usage limits. You get the full product from day one.
            </p>

            <ul className="mt-10 space-y-3">
              {INCLUDED.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-zinc-600">
                  <svg className="shrink-0 text-zinc-300" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <polyline strokeLinecap="round" strokeLinejoin="round" points="20 6 9 17 4 12" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right: card */}
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="rounded-2xl bg-white border border-zinc-200 p-8"
              style={{ boxShadow: '0 8px 40px -8px rgba(0,0,0,0.08)' }}
            >
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Reckon Pro</p>

              <div className="mt-5 flex items-end gap-2">
                <span className="text-6xl font-bold text-zinc-900 tracking-tight tabular-nums leading-none">49</span>
                <div className="mb-1">
                  <p className="text-sm font-medium text-zinc-500">MAD</p>
                  <p className="text-xs text-zinc-400">/ month</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-zinc-400">or 490 MAD / year (2 months free)</p>

              <div className="my-6 border-t border-zinc-100" />

              <EarlyAccessModal source="pricing">
                {({ onClick }) => (
                  <button
                    type="button"
                    onClick={onClick}
                    className="block w-full rounded-xl bg-zinc-900 hover:bg-zinc-700 py-3.5 text-center text-sm font-semibold text-white transition-colors"
                  >
                    Get early access
                  </button>
                )}
              </EarlyAccessModal>

              <p className="mt-3 text-center text-xs text-zinc-400">
                Launch pricing — early-access members lock it in.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
