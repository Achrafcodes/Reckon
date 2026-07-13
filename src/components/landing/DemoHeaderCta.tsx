'use client'
import Link from 'next/link'
import { EarlyAccessModal } from '@/components/landing/EarlyAccessModal'

export function DemoHeaderCta() {
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="px-3 py-1.5 text-sm font-medium text-ink-muted hover:text-ink transition-colors rounded-lg hover:bg-surface-r"
      >
        Sign in
      </Link>
      <EarlyAccessModal source="demo-header">
        {({ onClick }) => (
          <button
            type="button"
            onClick={onClick}
            className="px-4 py-1.5 text-sm font-semibold text-white bg-brand hover:bg-brand-h rounded-lg transition-colors"
          >
            Request access
          </button>
        )}
      </EarlyAccessModal>
    </div>
  )
}
