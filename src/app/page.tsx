import Link from 'next/link'
import type { Metadata } from 'next'
import { ReckLogo } from '@/components/ui/ReckLogo'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingMockup } from '@/components/landing/LandingMockup'
import { LandingFeatures } from '@/components/landing/LandingFeatures'
import { LandingHowItWorks } from '@/components/landing/LandingHowItWorks'
import { LandingFaq } from '@/components/landing/LandingFaq'
import { LandingPricing } from '@/components/landing/LandingPricing'

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
      offers: {
        '@type': 'Offer',
        price: '49',
        priceCurrency: 'MAD',
        availability: 'https://schema.org/InStock',
        description: 'Reckon Pro — monthly subscription with 7-day free trial',
      },
      screenshot: `${APP_URL}/opengraph-image`,
      featureList: [
        'Bank statement import (CSV, Excel, PDF)',
        'Auto-categorization',
        'Monthly budget tracking',
        'Spending analytics and charts',
        'Recurring subscription detection',
        'PDF and Excel export',
        'Dark mode',
        'Mobile PWA',
      ],
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
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'support@reckon.app',
        contactType: 'customer support',
      },
    },
  ],
}

export default function LandingPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-[#f1f5f9]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex h-14 items-center justify-between">
          <Link href="/" aria-label="Reckon home">
            <ReckLogo width={96} color="#1e40af" />
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3" aria-label="Primary">
            <Link
              href="/demo"
              className="hidden sm:inline px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-100"
            >
              Live demo
            </Link>
            <Link
              href="/#pricing"
              className="hidden sm:inline px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-100"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-100"
            >
              Sign in
            </Link>
            <Link
              href="/#pricing"
              className="px-4 py-1.5 text-sm font-semibold text-white bg-[#1e40af] hover:bg-[#1d4ed8] rounded-lg transition-colors"
            >
              Subscribe
            </Link>
          </nav>
        </div>
      </header>

      <main id="main-content">
        <LandingHero />
        <LandingMockup />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingFaq />
        <LandingPricing />
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <ReckLogo width={72} color="#94a3b8" />
          <p>© {new Date().getFullYear()} Reckon. Your data stays private.</p>
          <div className="flex gap-4">
            <Link href="/demo" className="hover:text-slate-700 transition-colors">Live demo</Link>
            <Link href="/login" className="hover:text-slate-700 transition-colors">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
