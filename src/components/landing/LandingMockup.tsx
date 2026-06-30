'use client'
import { motion, useInView, useReducedMotion } from 'motion/react'
import Link from 'next/link'
import { useRef } from 'react'

const BARS = [45, 62, 38, 71, 55, 80, 48, 66, 52, 74, 60, 43]
const KPIS = [
  { label: 'Total spent',     value: '4,280.00', color: '#dc2626' },
  { label: 'Total income',    value: '7,500.00', color: '#059669' },
  { label: 'Top category',    value: 'Groceries', color: '#1e40af' },
  { label: 'Biggest expense', value: '1,200.00', color: '#d97706' },
]
const CATEGORIES = [
  { label: 'Groceries', pct: 38, color: '#059669' },
  { label: 'Transport', pct: 24, color: '#1e40af' },
  { label: 'Dining',    pct: 18, color: '#d97706' },
]

export function LandingMockup() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduce = useReducedMotion()

  return (
    <section className="bg-white border-b border-slate-200 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest mb-8">
          What you get on day one
        </p>

        <motion.div
          ref={ref}
          className="rounded-2xl border border-slate-200 overflow-hidden"
          style={{
            boxShadow: '0 24px 64px -12px rgba(30,64,175,0.14), 0 8px 24px -6px rgba(0,0,0,0.07)',
          }}
          animate={reduce ? {} : { y: [0, -7, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-1.5 px-4 py-3 bg-slate-100 border-b border-slate-200">
            <span className="w-3 h-3 rounded-full bg-red-400" aria-hidden="true" />
            <span className="w-3 h-3 rounded-full bg-amber-400" aria-hidden="true" />
            <span className="w-3 h-3 rounded-full bg-emerald-400" aria-hidden="true" />
            <span className="ml-3 text-xs text-slate-400 font-mono">reckon.app/dashboard</span>
          </div>

          <div className="bg-[#f1f5f9] p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* KPI cards */}
            {KPIS.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                className="rounded-xl bg-white border border-slate-200 p-4"
                initial={reduce ? undefined : { opacity: 0, y: 14 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 + i * 0.07, duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
              >
                <p className="text-xs text-slate-500 mb-1">{kpi.label}</p>
                <p className="text-base font-bold tabular-nums" style={{ color: kpi.color }}>{kpi.value}</p>
              </motion.div>
            ))}

            {/* Bar chart */}
            <div className="col-span-2 sm:col-span-3 rounded-xl bg-white border border-slate-200 p-4">
              <p className="text-xs font-medium text-slate-600 mb-3">Monthly spending</p>
              <div className="flex items-end gap-1.5 h-14" aria-label="Decorative bar chart">
                {BARS.map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-t-sm"
                    style={{
                      height: `${h}%`,
                      background: i === 11 ? '#1e40af' : '#dbeafe',
                      transformOrigin: '50% 100%',
                    }}
                    initial={reduce ? undefined : { scaleY: 0 }}
                    animate={inView ? { scaleY: 1 } : {}}
                    transition={{
                      delay: 0.3 + i * 0.04,
                      duration: 0.55,
                      ease: [0.34, 1.46, 0.64, 1],
                    }}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>

            {/* Category bars */}
            <div className="col-span-2 sm:col-span-1 rounded-xl bg-white border border-slate-200 p-4 flex flex-col gap-2">
              <p className="text-xs font-medium text-slate-600">By category</p>
              {CATEGORIES.map((c, i) => (
                <div key={c.label} className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>{c.label}</span>
                    <span>{c.pct}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: c.color }}
                      initial={reduce ? undefined : { width: 0 }}
                      animate={inView ? { width: `${c.pct}%` } : {}}
                      transition={{ delay: 0.6 + i * 0.1, duration: 0.75, ease: 'easeOut' }}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="mt-6 text-center">
          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1e40af] hover:underline underline-offset-2"
          >
            Explore the live demo →
          </Link>
        </div>
      </div>
    </section>
  )
}
