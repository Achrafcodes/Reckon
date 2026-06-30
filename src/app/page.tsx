import Link from 'next/link'
import type { Metadata } from 'next'
import { ReckLogo } from '@/components/ui/ReckLogo'
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
  { q: 'Can I cancel my subscription?', a: 'Yes. Cancel any time. Your data remains accessible until the end of your billing period.' },
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
      offers: { '@type': 'Offer', price: '49', priceCurrency: 'MAD', availability: 'https://schema.org/InStock' },
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

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-zinc-200/80">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 flex h-14 items-center justify-between">
          <Link href="/" aria-label="Reckon home">
            <ReckLogo width={88} color="#09090b" markBg="#09090b" />
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Primary">
            <Link href="/demo" className="hidden sm:inline px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-900 rounded-md hover:bg-zinc-100 transition-colors">
              Demo
            </Link>
            <Link href="/#pricing" className="hidden sm:inline px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-900 rounded-md hover:bg-zinc-100 transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-900 rounded-md hover:bg-zinc-100 transition-colors">
              Sign in
            </Link>
            <Link
              href="/#pricing"
              className="ml-1 px-4 py-1.5 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-700 rounded-lg transition-colors"
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
        <LandingPricing />
        <LandingFaq />
        <LandingCta />
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="bg-[#0a0a0a] border-t border-white/5 py-8">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <ReckLogo width={72} color="rgba(255,255,255,0.25)" />
          <p className="text-xs text-zinc-600">© {new Date().getFullYear()} Reckon. Your data stays private.</p>
          <div className="flex gap-5 text-xs text-zinc-600">
            <Link href="/demo" className="hover:text-zinc-300 transition-colors">Live demo</Link>
            <Link href="/login" className="hover:text-zinc-300 transition-colors">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
