import Link from 'next/link'
import type { Metadata } from 'next'
import { ReckLogo } from '@/components/ui/ReckLogo'
import { LandingNavbar } from '@/components/landing/LandingNavbar'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingMockup } from '@/components/landing/LandingMockup'
import { LandingFeatures } from '@/components/landing/LandingFeatures'
import { LandingHowItWorks } from '@/components/landing/LandingHowItWorks'
import { LandingFaq } from '@/components/landing/LandingFaq'
import { LandingPricing } from '@/components/landing/LandingPricing'
import { LandingCta } from '@/components/landing/LandingCta'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://reckon.app'

export const metadata: Metadata = {
  title: 'Reckon — Expense Tracking & Budget Analytics App',
  description:
    'Upload your bank statement and instantly see where your money goes. Set budgets, track spending by category, detect recurring subscriptions, and export reports. 49 MAD/month.',
  keywords: [
    'expense tracker Morocco',
    'budget app MAD',
    'bank statement analyzer',
    'personal finance app',
    'spending tracker',
    'budget planner',
    'financial analytics dashboard',
    'CSV import expense tracker',
    'monthly budget tracker',
    'تتبع المصاريف',
  ],
  alternates: { canonical: APP_URL },
  openGraph: {
    title: 'Reckon — Expense Tracking & Budget Analytics',
    description: 'Upload your bank statement. See exactly where your money goes. Set budgets, get insights, export reports.',
    url: APP_URL,
    type: 'website',
  },
}

const FAQ_SCHEMA = [
  { q: 'What file formats does Reckon support?', a: 'CSV, Excel (XLSX/XLS), and text-based PDF exports from any bank.' },
  { q: 'Is my financial data private?', a: 'Yes. Your data is stored in your private account and never shared or sold.' },
  { q: 'How does auto-categorization work?', a: 'Reckon matches transaction descriptions against keyword rules for each category.' },
  { q: 'How do I get access?', a: "Reckon isn't open for self-serve signups yet. Request access and we'll set your account up personally." },
  { q: 'What currencies are supported?', a: 'MAD, USD, EUR, GBP, AED, SAR, CAD, CHF, and more.' },
  { q: 'Does Reckon work on mobile?', a: 'Yes — Reckon is a responsive web app and can be installed as a PWA on iOS and Android.' },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Reckon',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web, iOS, Android',
      url: APP_URL,
      description: 'Personal expense tracker and budget analytics app. Import bank statements, categorize spending, set budgets, and export reports.',
      offers: { '@type': 'Offer', price: '49', priceCurrency: 'MAD', availability: 'https://schema.org/PreOrder' },
      screenshot: `${APP_URL}/opengraph-image`,
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ_SCHEMA.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
    {
      '@type': 'Organization',
      name: 'Reckon',
      url: APP_URL,
      logo: `${APP_URL}/favicon.svg`,
      contactPoint: { '@type': 'ContactPoint', email: 'support@reckon.app', contactType: 'customer support' },
    },
  ],
}

export default function LandingPage() {
  return (
    <div className="min-h-dvh flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <LandingNavbar />

      <main id="main-content">
        <LandingHero />
        <LandingMockup />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingPricing />
        <LandingFaq />
        <LandingCta />
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="bg-[#0a0a0a] border-t border-white/5 py-10">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          {/* Top row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <ReckLogo width={72} color="rgba(255,255,255,0.25)" />

            {/* Links */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-zinc-600">
              <Link href="/demo" className="hover:text-zinc-300 transition-colors">Live demo</Link>
              <Link href="/login" className="hover:text-zinc-300 transition-colors">Sign in</Link>
              <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms of Service</Link>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/Achrafcodes"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub — Achrafcodes"
                className="text-zinc-600 hover:text-zinc-300 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/achrafcodes"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram — achrafcodes"
                className="text-zinc-600 hover:text-zinc-300 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069Zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Bottom row */}
          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-700">
            <p>© {new Date().getFullYear()} Reckon. Your data stays private.</p>
            <p>
              Made with <span className="text-red-500" aria-label="love">♥</span> by{' '}
              <a
                href="https://github.com/Achrafcodes"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Achraf Essoussy
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
