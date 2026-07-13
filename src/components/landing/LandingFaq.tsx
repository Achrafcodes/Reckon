'use client'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'

const FAQ = [
  {
    q: 'What file formats does Reckon support?',
    a: 'CSV, Excel (XLSX/XLS), and text-based PDF exports from any bank. Reckon also accepts budget summary spreadsheets with categories as columns.',
  },
  {
    q: 'Is my financial data private?',
    a: 'Yes. Your data is stored in your private account and never shared or sold. All connections use HTTPS, passwords are bcrypt-hashed, and sessions use signed JWT cookies.',
  },
  {
    q: 'How does auto-categorization work?',
    a: 'Reckon matches transaction descriptions against keyword rules for each category (groceries, transport, dining, etc.) and assigns the best match. You can edit or reassign any category at any time.',
  },
  {
    q: 'How do I get access?',
    a: "Reckon isn't open for self-serve signups yet. Email us and we'll set your account up personally, at the launch price.",
  },
  {
    q: 'What currencies are supported?',
    a: 'MAD, USD, EUR, GBP, AED, SAR, CAD, CHF, and more. Each transaction stores its original currency.',
  },
  {
    q: 'Does Reckon work on mobile?',
    a: 'Yes — Reckon is a responsive web app that works on any device and can be installed as a PWA from the browser on iOS and Android.',
  },
]

export function LandingFaq() {
  const [open, setOpen] = useState<string | null>(null)
  const reduce = useReducedMotion()

  return (
    <section className="py-20 sm:py-28 bg-white border-t border-zinc-100">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12 lg:gap-20 items-start">
          {/* Left */}
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-zinc-600 mb-4">
              FAQ
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-normal text-zinc-900 leading-tight">
              Questions.
            </h2>
          </div>

          {/* Right: accordion */}
          <dl className="divide-y divide-zinc-100">
            {FAQ.map(({ q, a }, i) => {
              const isOpen = open === q
              return (
                <motion.div
                  key={q}
                  initial={reduce ? undefined : { opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                >
                  <button
                    type="button"
                    className="w-full flex items-start justify-between gap-6 py-5 text-left group"
                    onClick={() => setOpen(isOpen ? null : q)}
                    aria-expanded={isOpen}
                  >
                    <dt className="text-sm font-medium text-zinc-800 group-hover:text-zinc-900 transition-colors">
                      {q}
                    </dt>
                    <motion.svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="shrink-0 text-zinc-300 mt-0.5"
                      animate={reduce ? {} : { rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </motion.svg>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.dd
                        key="body"
                        initial={reduce ? {} : { height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={reduce ? {} : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <p className="pb-5 text-sm text-zinc-500 leading-relaxed max-w-xl">{a}</p>
                      </motion.dd>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </dl>
        </div>
      </div>
    </section>
  )
}
