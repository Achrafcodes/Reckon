import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Calistoga } from 'next/font/google'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
})

const calistoga = Calistoga({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
  weight: '400',
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://reckon.app'
const APP_NAME = 'Reckon'
const APP_DESCRIPTION =
  'Track expenses, set budgets, and gain clear financial insights — all in one place.'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} — Expense Tracking & Financial Analytics`,
    template: `%s — ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  keywords: [
    'expense tracker',
    'personal finance',
    'budget planner',
    'financial analytics',
    'bank statement import',
    'spending insights',
  ],
  authors: [{ name: 'Reckon' }],
  creator: 'Reckon',
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_URL,
    siteName: APP_NAME,
    title: `${APP_NAME} — Expense Tracking & Financial Analytics`,
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_NAME} — Expense Tracking & Financial Analytics`,
    description: APP_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f1f5f9' },
    { media: '(prefers-color-scheme: dark)',  color: '#0a0f1a' },
  ],
}

/* Inline script injected before paint to set .dark class — prevents flash */
const noFlashScript = `
(function(){
  try{
    var t=localStorage.getItem('reckon-theme');
    var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches);
    if(d)document.documentElement.classList.add('dark');
  }catch(e){}
})();
`

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${jetbrainsMono.variable} ${calistoga.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
