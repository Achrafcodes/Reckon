'use client'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { useRef } from 'react'

const features = [
  {
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
      </svg>
    ),
    title: 'Instant import',
    body: 'Drag and drop your bank statement — CSV, XLSX, XLS, or PDF — and transactions are parsed, deduplicated, and auto-categorized in seconds.',
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 20l4-8 4 4 4-6 4 4" />
      </svg>
    ),
    title: 'Live analytics',
    body: 'Spending by category, income vs. expenses, monthly trends. Drill into any time window — this month, quarter, year, or all time.',
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    title: 'Smart budgets',
    body: 'Set monthly limits per category. Reckon tracks actuals in real time and alerts you before you overspend — so you stay on plan.',
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
      </svg>
    ),
    title: 'Spending insights',
    body: 'Automatic month-over-month comparisons, budget pace warnings, and savings rate — no manual analysis needed.',
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l5 5v13a2 2 0 0 1-2 2Z" />
      </svg>
    ),
    title: 'Export reports',
    body: 'One-click PDF and Excel reports. Share a clean monthly summary with your accountant or save it for your records.',
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
    title: 'Private & secure',
    body: 'Your data stays yours. bcrypt-hashed passwords, httpOnly cookies, signed JWT sessions. No third-party tracking on your transactions.',
  },
]

export function LandingFeatures() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const reduce = useReducedMotion()

  return (
    <section className="py-16 sm:py-20 bg-[#f1f5f9]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <motion.div
          className="text-center mb-12"
          initial={reduce ? undefined : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Everything you need, nothing you don&apos;t
          </h2>
          <p className="mt-3 text-sm text-slate-500 max-w-xl mx-auto">
            Built for people who want clear answers about their money — without the complexity.
          </p>
        </motion.div>

        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="rounded-xl bg-white border border-slate-200 p-5 cursor-default"
              initial={reduce ? undefined : { opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.07, duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
              whileHover={reduce ? {} : {
                y: -5,
                borderColor: 'rgba(147,197,253,0.7)',
                boxShadow: '0 12px 32px -6px rgba(30,64,175,0.14)',
              }}
            >
              <motion.div
                className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-[#1e40af] mb-4"
                whileHover={reduce ? {} : { scale: 1.14, rotate: 8 }}
                transition={{ type: 'spring', stiffness: 360, damping: 14 }}
              >
                {f.icon}
              </motion.div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1.5">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
