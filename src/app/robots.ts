import type { MetadataRoute } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://reckon.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/demo'],
        disallow: [
          '/api/',
          '/dashboard',
          '/transactions',
          '/budgets',
          '/analytics',
          '/categories',
          '/reports',
          '/upload',
          '/settings',
          '/subscribe',
          '/login',
          '/register',
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  }
}
