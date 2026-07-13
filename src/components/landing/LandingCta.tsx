'use client'
import { motion, useReducedMotion } from 'motion/react'
import Link from 'next/link'
import { ACCESS_MAILTO } from '@/lib/contact'

export function LandingCta() {
  const reduce = useReducedMotion()

  return (
    <section className="bg-[#0a0a0a] py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <motion.div
          className="max-w-xl"
          initial={reduce ? undefined : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="font-display text-4xl sm:text-5xl font-normal text-white leading-[1.1]">
            Ready to see where your money goes?
          </h2>
          <p className="mt-5 text-base text-zinc-400 leading-relaxed">
            Takes two minutes to set up. Start with a bank statement you already have.
          </p>
          <div className="mt-8 flex items-center gap-4 flex-wrap">
            <a
              href={ACCESS_MAILTO}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-zinc-900 text-sm font-semibold hover:bg-zinc-100 transition-colors"
            >
              Request access
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </a>
            <Link href="/demo" className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">
              Try demo first →
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
