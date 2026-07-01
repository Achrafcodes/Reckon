'use client'
import { motion, useReducedMotion } from 'motion/react'

const FEATURES = [
  {
    num: '01',
    title: 'Import any bank statement.',
    body: 'CSV, Excel, or PDF — drag and drop your export from any Moroccan bank. Reckon parses it in under five seconds, deduplicates transactions, and assigns each one a category automatically.',
    detail: 'Supported: Attijariwafa, CIH, BMCE, BMCI, Banque Populaire, and any CSV/Excel export.',
    visual: (
      <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-2">
        {[
          { name: '01_dec_statement.pdf', size: '248 KB', status: 'Parsed', count: '143 transactions' },
          { name: 'nov_export.xlsx',      size: '92 KB',  status: 'Parsed', count: '118 transactions' },
        ].map((f) => (
          <div key={f.name} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 border border-zinc-100">
            <div className="w-7 h-7 rounded-md bg-[#1e40af]/8 flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-800 truncate">{f.name}</p>
              <p className="text-[10px] text-zinc-400">{f.count} · {f.size}</p>
            </div>
            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {f.status}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-zinc-200 text-zinc-400">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
          <span className="text-[11px]">Drop a file to import</span>
        </div>
      </div>
    ),
  },
  {
    num: '02',
    title: 'Budgets that actually warn you.',
    body: 'Set a monthly limit per category. Reckon computes actuals from your real transactions and alerts you before you overspend — not after.',
    detail: 'Budget pace, overspend projection, and spending insights are generated automatically every time you import.',
    visual: (
      <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-3">
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">December budgets</p>
        {[
          { cat: 'Groceries',  spent: 1240, limit: 1500, pct: 83, warn: false },
          { cat: 'Dining',     spent: 780,  limit: 600,  pct: 100, warn: true },
          { cat: 'Transport',  spent: 340,  limit: 800,  pct: 43, warn: false },
          { cat: 'Shopping',   spent: 420,  limit: 500,  pct: 84, warn: false },
        ].map((b) => (
          <div key={b.cat} className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-zinc-700">{b.cat}</span>
              <span className={`text-[10px] font-semibold tabular-nums ${b.warn ? 'text-red-500' : 'text-zinc-500'}`}>
                {b.spent} / {b.limit} MAD{b.warn ? ' · Over limit' : ''}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(b.pct, 100)}%`,
                  background: b.warn ? '#ef4444' : b.pct > 75 ? '#f59e0b' : '#1e40af',
                }}
                aria-hidden="true"
              />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    num: '03',
    title: 'Reports in one click.',
    body: 'Export a clean PDF or Excel summary for any time range. Useful for accountants, tax prep, or just keeping a record of your year.',
    detail: 'Exports include totals by category, a full transaction list, and your monthly savings rate.',
    visual: (
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Export report</p>
        </div>
        <div className="space-y-2">
          {[
            { label: 'Date range', value: 'Jan – Dec 2024' },
            { label: 'Transactions', value: '1,284' },
            { label: 'Total spent', value: '52,840 MAD' },
            { label: 'Total income', value: '90,000 MAD' },
            { label: 'Saved', value: '37,160 MAD (41%)' },
          ].map((row) => (
            <div key={row.label} className="flex justify-between py-1.5 border-b border-zinc-50 last:border-0">
              <span className="text-[10px] text-zinc-400">{row.label}</span>
              <span className="text-[10px] font-medium text-zinc-700">{row.value}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <div className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md bg-zinc-900 text-white text-[10px] font-medium">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            PDF
          </div>
          <div className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md bg-zinc-100 text-zinc-700 text-[10px] font-medium">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Excel
          </div>
        </div>
      </div>
    ),
  },
]

export function LandingFeatures() {
  const reduce = useReducedMotion()

  return (
    <section className="py-20 sm:py-28 bg-[#fafafa] border-t border-zinc-100">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        {/* Section header */}
        <div className="mb-16 sm:mb-20 max-w-xl">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-zinc-600 mb-4">
            Features
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-normal text-zinc-900 leading-tight">
            Everything you need.<br />Nothing you don't.
          </h2>
        </div>

        {/* Feature rows */}
        <div className="space-y-20 sm:space-y-28">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.num}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${i % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''}`}
              initial={reduce ? undefined : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Text */}
              <div>
                <span className="text-5xl font-bold text-zinc-100 tabular-nums select-none" aria-hidden="true">
                  {f.num}
                </span>
                <h3 className="mt-3 text-2xl sm:text-3xl font-bold text-zinc-900 leading-snug tracking-tight">
                  {f.title}
                </h3>
                <p className="mt-4 text-base text-zinc-500 leading-relaxed">
                  {f.body}
                </p>
                <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                  {f.detail}
                </p>
              </div>

              {/* Visual */}
              <div>{f.visual}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
