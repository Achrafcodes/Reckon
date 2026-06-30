'use client'
import { motion, useInView, useReducedMotion } from 'motion/react'
import Link from 'next/link'
import { useRef } from 'react'

const STEPS = [
  { step: '1', title: 'Subscribe',          body: 'Pick a plan. Instant access, cancel any time.' },
  { step: '2', title: 'Upload a statement', body: 'CSV, Excel, or PDF from any bank. Parsed in seconds.' },
  { step: '3', title: 'Gain clarity',       body: 'Dashboard, budgets, reports — live immediately.' },
]

export function LandingHowItWorks() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const reduce = useReducedMotion()

  return (
    <section className="py-16 sm:py-20 bg-white border-t border-slate-200">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <motion.h2
          className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-12"
          initial={reduce ? undefined : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          Up and running in three steps
        </motion.h2>

        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
          {/* Animated connector line */}
          <div
            className="hidden sm:block absolute top-7 left-[calc(16.67%+16px)] right-[calc(16.67%+16px)] h-px bg-slate-100 overflow-hidden"
            aria-hidden="true"
          >
            <motion.div
              className="h-full bg-slate-300"
              initial={{ scaleX: 0, originX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              style={{ transformOrigin: '0% 50%' }}
              transition={{ delay: 0.4, duration: 0.9, ease: 'easeOut' }}
            />
          </div>

          {STEPS.map((item, i) => (
            <motion.div
              key={item.step}
              className="flex flex-col items-center gap-3 relative"
              initial={reduce ? undefined : { opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.14, duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <motion.div
                className="w-14 h-14 rounded-full bg-[#1e40af] text-white flex items-center justify-center text-xl font-bold shadow-md shadow-blue-900/20 shrink-0 relative z-10"
                whileHover={reduce ? {} : { scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 380, damping: 14 }}
              >
                {item.step}
              </motion.div>
              <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-500 max-w-[180px] mx-auto">{item.body}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-12"
          initial={reduce ? undefined : { opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Link
            href="/#pricing"
            className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white bg-[#1e40af] hover:bg-[#1d4ed8] rounded-xl transition-all duration-200 shadow-lg shadow-blue-900/30 hover:shadow-blue-800/50 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            View pricing
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
