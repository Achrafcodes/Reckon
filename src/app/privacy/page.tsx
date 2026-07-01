import type { Metadata } from 'next'
import Link from 'next/link'
import { ReckLogo } from '@/components/ui/ReckLogo'

export const metadata: Metadata = {
  title: 'Privacy Policy — Reckon',
  description: 'How Reckon collects, uses, and protects your personal and financial data.',
}

const LAST_UPDATED = 'July 1, 2026'

export default function PrivacyPage() {
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
        <h1 className="font-display text-4xl font-normal text-zinc-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-zinc-400 mb-10">Last updated: {LAST_UPDATED}</p>

        <div className="prose prose-zinc prose-sm sm:prose-base max-w-none space-y-8 text-zinc-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">1. Overview</h2>
            <p>Reckon (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is a personal expense tracking and financial analytics application. This Privacy Policy explains how we collect, use, store, and protect information you provide when using our service at reckon-kappa.vercel.app and any associated domains.</p>
            <p className="mt-3">By using Reckon, you agree to the practices described in this policy. If you do not agree, please discontinue use of the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">2. Information We Collect</h2>
            <h3 className="text-base font-medium text-zinc-800 mb-2">Account information</h3>
            <p>When you register, we collect your name, email address, and a hashed version of your password. We never store your password in plaintext.</p>

            <h3 className="text-base font-medium text-zinc-800 mt-4 mb-2">Financial data you upload</h3>
            <p>When you upload bank statements or spreadsheets, we parse and store the transaction data (dates, amounts, descriptions, merchants) in your private account. This data is associated exclusively with your user account and is never shared with or sold to third parties.</p>

            <h3 className="text-base font-medium text-zinc-800 mt-4 mb-2">Usage data</h3>
            <p>We may collect anonymous technical data such as error logs and performance metrics to improve the service. This data does not include your financial information.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">3. How We Use Your Data</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To provide the expense tracking, budgeting, and analytics features of Reckon</li>
              <li>To send you monthly digest emails summarising your spending (if enabled)</li>
              <li>To send budget alert notifications when you approach spending limits</li>
              <li>To authenticate you securely and maintain your session</li>
              <li>To improve the reliability and performance of the service</li>
            </ul>
            <p className="mt-3">We do not use your financial data to train machine learning models, serve advertisements, or sell to data brokers.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">4. Data Storage & Security</h2>
            <p>Your data is stored in a MongoDB Atlas database hosted on AWS infrastructure. We implement the following security measures:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-3">
              <li>Passwords are hashed using bcrypt with a cost factor of 12</li>
              <li>Sessions are managed via signed, short-lived JWTs in httpOnly, Secure cookies</li>
              <li>All traffic is encrypted in transit via HTTPS/TLS</li>
              <li>Database access is restricted to allowlisted IP addresses</li>
              <li>Input validation is applied to every request at the server boundary</li>
            </ul>
            <p className="mt-3">Despite these measures, no system is 100% secure. We recommend using a strong, unique password for your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">5. Data Retention</h2>
            <p>We retain your data for as long as your account is active. If you delete your account, we will delete or anonymise your personal and financial data within 30 days. Anonymised aggregate statistics may be retained indefinitely.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">6. Third-Party Services</h2>
            <p>Reckon uses the following third-party services:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-3">
              <li><strong>Vercel</strong> — hosting and serverless functions (USA). Subject to <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-zinc-900 underline underline-offset-2">Vercel&apos;s Privacy Policy</a>.</li>
              <li><strong>MongoDB Atlas</strong> — database (AWS, EU/USA regions). Subject to <a href="https://www.mongodb.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-zinc-900 underline underline-offset-2">MongoDB&apos;s Privacy Policy</a>.</li>
              <li><strong>Resend</strong> — transactional email (if you have email notifications enabled). Subject to <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-zinc-900 underline underline-offset-2">Resend&apos;s Privacy Policy</a>.</li>
            </ul>
            <p className="mt-3">We do not use Google Analytics, Facebook Pixel, or any advertising tracking.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-3">
              <li>Access and download all data associated with your account</li>
              <li>Correct inaccurate personal information</li>
              <li>Delete your account and all associated data</li>
              <li>Opt out of marketing emails at any time</li>
            </ul>
            <p className="mt-3">To exercise these rights, contact us at <a href="mailto:support@reckon.app" className="text-zinc-900 underline underline-offset-2">support@reckon.app</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">8. Cookies</h2>
            <p>Reckon uses only functional cookies required for authentication:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-3">
              <li><strong>access_token</strong> — short-lived JWT (15 minutes) for session authentication</li>
              <li><strong>refresh_token</strong> — longer-lived token (7 days) to re-issue access tokens</li>
            </ul>
            <p className="mt-3">We do not use advertising cookies, tracking pixels, or third-party analytics cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. When we do, we will update the &ldquo;Last updated&rdquo; date at the top. Continued use of Reckon after changes constitutes your acceptance of the revised policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 mb-3">10. Contact</h2>
            <p>For any privacy-related questions or requests, contact us at:</p>
            <p className="mt-2"><a href="mailto:support@reckon.app" className="text-zinc-900 underline underline-offset-2">support@reckon.app</a></p>
          </section>
        </div>
      </main>

      <footer className="border-t border-zinc-200 bg-white py-6 text-center text-xs text-zinc-400">
        © {new Date().getFullYear()} Reckon ·{' '}
        <Link href="/terms" className="hover:text-zinc-700 transition-colors">Terms of Service</Link>
      </footer>
    </div>
  )
}
