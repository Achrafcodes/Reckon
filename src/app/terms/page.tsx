import type { Metadata } from 'next'
import Link from 'next/link'
import { ReckLogo } from '@/components/ui/ReckLogo'

export const metadata: Metadata = {
  title: 'Terms of Service — Reckon',
  description: 'Terms and conditions for using the Reckon expense tracking application.',
}

const LAST_UPDATED = 'July 1, 2026'

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-[#fafafa]">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <Link href="/" aria-label="Reckon home">
            <ReckLogo width={80} color="#09090b" />
          </Link>
          <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-800 transition-colors">← Back to home</Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
        <h1 className="font-display text-4xl font-normal text-zinc-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-zinc-400 mb-10">Last updated: {LAST_UPDATED}</p>

        <div className="space-y-8 text-zinc-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Reckon (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the Service. These terms apply to all users, visitors, and others who access or use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">2. Description of Service</h2>
            <p>Reckon is a personal expense tracking and financial analytics web application. The Service allows you to import bank statements and spreadsheets, categorise transactions, set budgets, view analytics, and export reports. The Service is provided &ldquo;as is&rdquo; and is intended for personal, non-commercial use.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">3. Account Registration</h2>
            <p>To use the Service, you must create an account with a valid email address and password. You are responsible for:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-3">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activity that occurs under your account</li>
              <li>Providing accurate and up-to-date registration information</li>
              <li>Notifying us immediately of any unauthorised use of your account</li>
            </ul>
            <p className="mt-3">You must be at least 16 years old to create an account.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">4. Pricing & Payments</h2>
            <p>Reckon is currently in early access and does not charge for the Service. Planned pricing is shown on our <Link href="/#pricing" className="text-zinc-900 underline underline-offset-2">pricing page</Link> for reference; early-access members will lock in that rate when paid plans launch. When billing is introduced, these terms will be updated in advance and you will be notified before any charge applies to your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">5. Acceptable Use</h2>
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-3">
              <li>Upload files containing malicious code, viruses, or exploits</li>
              <li>Attempt to gain unauthorised access to other users&apos; data</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
              <li>Use automated scripts to scrape, abuse, or overload the Service</li>
              <li>Violate any applicable local, national, or international law</li>
              <li>Share your account credentials with others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">6. Your Data</h2>
            <p>You retain ownership of all financial data you upload to Reckon. By uploading data, you grant us a limited licence to process and store it solely to provide the Service to you. We do not claim ownership of your data and will not sell or share it with third parties. See our <Link href="/privacy" className="text-zinc-900 underline underline-offset-2">Privacy Policy</Link> for full details.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">7. Disclaimer of Financial Advice</h2>
            <p>Reckon is a personal finance tool and does not provide financial, investment, tax, or legal advice. The analytics, insights, and categorisations presented in the Service are informational only. You should consult a qualified professional before making financial decisions based on information in the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">8. Availability & Uptime</h2>
            <p>We strive to keep the Service available at all times but do not guarantee uninterrupted access. We may perform maintenance, updates, or experience outages. We are not liable for any loss caused by unavailability of the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">9. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Reckon and its creators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data, revenue, or profits, arising from your use of or inability to use the Service. Our total liability to you for any claim shall not exceed the amount you paid us in the 12 months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">10. Termination</h2>
            <p>We reserve the right to suspend or terminate your account at any time if you violate these Terms. You may delete your account at any time from your account settings. Upon termination, your right to use the Service ceases immediately.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">11. Changes to These Terms</h2>
            <p>We may update these Terms from time to time. We will notify you of material changes via email or a prominent notice in the Service. Continued use after changes constitutes acceptance of the revised Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">12. Governing Law</h2>
            <p>These Terms are governed by and construed in accordance with applicable law. Any disputes arising under these Terms shall be resolved through good-faith negotiation, and if necessary, binding arbitration.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">13. Contact</h2>
            <p>For questions about these Terms, contact us at:</p>
            <p className="mt-2"><a href="mailto:support@reckon.app" className="text-zinc-900 underline underline-offset-2">support@reckon.app</a></p>
          </section>
        </div>
      </main>

      <footer className="border-t border-zinc-200 bg-white py-6 text-center text-xs text-zinc-400">
        © {new Date().getFullYear()} Reckon ·{' '}
        <Link href="/privacy" className="hover:text-zinc-700 transition-colors">Privacy Policy</Link>
      </footer>
    </div>
  )
}
