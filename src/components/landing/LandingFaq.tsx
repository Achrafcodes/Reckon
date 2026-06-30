'use client'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'

const FAQ = [
  {
    q: 'What file formats does Reckon support?',
    a: 'Reckon imports CSV, Excel (XLSX/XLS), and text-based PDF bank statements. It also accepts budget summary spreadsheets with categories as columns.',
  },
  {
    q: 'Is my financial data private?',
    a: 'Yes. Your data is stored in your private account and never shared or sold. All connections use HTTPS, passwords are bcrypt-hashed, and sessions use signed JWT cookies.',
  },
  {
    q: 'How does auto-categorization work?',
    a: 'Reckon matches transaction descriptions against keyword rules for each category (groceries, transport, dining, etc.) and assigns the best match automatically. You can edit categories at any time.',
  },
  {
    q: 'Can I cancel my subscription?',
    a: 'Yes, you can cancel any time. Your data remains accessible until the end of your billing period.',
  },
  {
    q: 'What currencies are supported?',
    a: 'Reckon supports MAD, USD, EUR, GBP, AED, SAR, CAD, CHF, and more. Each transaction stores its original currency.',
  },
  {
    q: 'Does Reckon work on mobile?',
    a: 'Yes. Reckon is a responsive web app optimised for mobile and can be installed as a PWA (add to home screen) on iOS and Android.',
  },
]

export function LandingFaq() {
  const [open, setOpen] = useState<string | null>(null)
  const reduce = useReducedMotion()

  return (
    <section className="py-16 sm:py-20 bg-white border-t border-slate-200">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <motion.div
          className="text-center mb-12"
          initial={reduce ? undefined : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            Everything you need to know before you subscribe.
          </p>
        </motion.div>

        <dl className="divide-y divide-slate-200">
          {FAQ.map(({ q, a }, i) => {
            const isOpen = open === q
            return (
              <motion.div
                key={q}
                initial={reduce ? undefined : { opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ delay: i * 0.05, duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
              >
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-4 py-5 text-left"
                  onClick={() => setOpen(isOpen ? null : q)}
                  aria-expanded={isOpen}
                >
                  <dt className={`text-sm font-semibold transition-colors duration-150 ${isOpen ? 'text-[#1e40af]' : 'text-slate-900'}`}>
                    {q}
                  </dt>
                  <motion.svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="shrink-0 text-slate-400"
                    animate={reduce ? {} : { rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
                  </motion.svg>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.dd
                      key="content"
                      initial={reduce ? {} : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={reduce ? {} : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-sm text-slate-500 leading-relaxed pr-8">{a}</p>
                    </motion.dd>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </dl>
      </div>
    </section>
  )
}
