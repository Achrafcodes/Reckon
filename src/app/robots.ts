import type { MetadataRoute } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://reckon.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/login', '/register'],
      // Authenticated app surface and API must never be indexed
      disallow: [
        '/api/',
        '/transactions',
        '/budgets',
        '/analytics',
        '/reports',
        '/upload',
        '/settings',
      ],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
