'use client'
import { motion, useInView, useReducedMotion } from 'motion/react'
import Link from 'next/link'
import { useRef } from 'react'

const BARS = [45, 62, 38, 71, 55, 80, 48, 66, 52, 74, 60, 90]
const MONTHS = ['J','F','M','A','M','J','J','A','S','O','N','D']
const TRANSACTIONS = [
  { name: 'Carrefour Market',     cat: 'Groceries',  amount: '-320.00', color: '#059669' },
  { name: 'Total Énergies',       cat: 'Transport',  amount: '-180.00', color: '#2563eb' },
  { name: 'Salary — December',    cat: 'Income',     amount: '+7,500.00', color: '#059669', income: true },
  { name: 'McDonald\'s Maarif',   cat: 'Dining',     amount: '-95.00',  color: '#d97706' },
  { name: 'Netflix',              cat: 'Subscriptions', amount: '-109.00', color: '#7c3aed' },
]

export function LandingMockup() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const reduce = useReducedMotion()

  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        {/* Label */}
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-zinc-400 mb-8">
          Your dashboard
        </p>

        {/* Browser window */}
        <motion.div
          ref={ref}
          className="rounded-xl overflow-hidden border border-zinc-200"
          style={{ boxShadow: '0 32px 80px -16px rgba(0,0,0,0.14), 0 8px 24px -6px rgba(0,0,0,0.06)' }}
          initial={reduce ? undefined : { opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Chrome bar */}
          <div className="flex items-center gap-1.5 px-4 h-10 bg-zinc-100 border-b border-zinc-200">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" aria-hidden="true" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" aria-hidden="true" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" aria-hidden="true" />
            <span className="ml-4 text-[11px] text-zinc-400 font-mono">reckon.app/dashboard</span>
          </div>

          {/* App shell */}
          <div className="bg-[#f8fafc] flex">
            {/* Sidebar */}
            <div className="hidden sm:flex flex-col w-48 bg-white border-r border-zinc-100 p-3 gap-0.5">
              {['Dashboard','Transactions','Budgets','Analytics','Reports'].map((item, i) => (
                <div
                  key={item}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-medium ${i === 0 ? 'bg-zinc-900 text-white' : 'text-zinc-500'}`}
                >
                  {item}
                </div>
              ))}
            </div>

            {/* Main */}
            <div className="flex-1 p-4 sm:p-5 space-y-4 min-w-0">
              {/* KPI row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Spent this month', value: '4,280', currency: 'MAD', delta: '+12%', up: true },
                  { label: 'Income',           value: '7,500', currency: 'MAD', delta: '—', up: false },
                  { label: 'Saved',            value: '3,220', currency: 'MAD', delta: '43%', up: false },
                ].map((k, i) => (
                  <motion.div
                    key={k.label}
                    className="bg-white rounded-lg border border-zinc-100 px-4 py-3"
                    initial={reduce ? undefined : { opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
                  >
                    <p className="text-[10px] text-zinc-400 mb-1">{k.label}</p>
                    <p className="text-base font-bold text-zinc-900 tabular-nums">{k.value} <span className="text-xs font-normal text-zinc-400">{k.currency}</span></p>
                    {k.delta !== '—' && (
                      <p className={`text-[10px] mt-0.5 ${k.up ? 'text-red-500' : 'text-emerald-600'}`}>{k.delta} vs last month</p>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Chart + transactions row */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {/* Bar chart */}
                <div className="sm:col-span-3 bg-white rounded-lg border border-zinc-100 p-4">
                  <p className="text-[10px] font-medium text-zinc-500 mb-4">Monthly spending (MAD)</p>
                  <div className="flex items-end gap-1 h-16">
                    {BARS.map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <motion.div
                          className="w-full rounded-sm"
                          style={{
                            background: i === 11 ? '#0a0a0a' : '#e4e4e7',
                            transformOrigin: '50% 100%',
                            height: `${h}%`,
                          }}
                          initial={reduce ? undefined : { scaleY: 0 }}
                          animate={inView ? { scaleY: 1 } : {}}
                          transition={{ delay: 0.35 + i * 0.035, duration: 0.5, ease: [0.34, 1.3, 0.64, 1] }}
                          aria-hidden="true"
                        />
                        <span className="text-[8px] text-zinc-400">{MONTHS[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent transactions */}
                <div className="sm:col-span-2 bg-white rounded-lg border border-zinc-100 p-4">
                  <p className="text-[10px] font-medium text-zinc-500 mb-3">Recent</p>
                  <div className="space-y-2.5">
                    {TRANSACTIONS.slice(0, 4).map((tx, i) => (
                      <motion.div
                        key={tx.name}
                        className="flex items-center justify-between"
                        initial={reduce ? undefined : { opacity: 0, x: 8 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: 0.45 + i * 0.07, duration: 0.35 }}
                      >
                        <div className="min-w-0">
                          <p className="text-[10px] font-medium text-zinc-800 truncate">{tx.name}</p>
                          <p className="text-[9px] text-zinc-400">{tx.cat}</p>
                        </div>
                        <span
                          className={`text-[10px] font-semibold tabular-nums ml-2 shrink-0 ${tx.income ? 'text-emerald-600' : 'text-zinc-700'}`}
                        >
                          {tx.amount}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <p className="mt-5 text-xs text-zinc-400">
          Sample data.{' '}
          <Link href="/demo" className="text-zinc-900 underline underline-offset-2 hover:text-[#1e40af]">
            Try the live demo →
          </Link>
        </p>
      </div>
    </section>
  )
}
