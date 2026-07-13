'use client'
import { EarlyAccessModal } from '@/components/landing/EarlyAccessModal'

export function DemoBanner() {
  return (
    <div className="bg-brand text-white text-xs font-medium text-center py-2 px-4">
      <span className="opacity-80">You&apos;re viewing a demo with sample data.</span>
      {' '}
      <EarlyAccessModal source="demo-banner">
        {({ onClick }) => (
          <button
            type="button"
            onClick={onClick}
            className="underline underline-offset-2 font-semibold hover:opacity-90 transition-opacity"
          >
            Request access to use Reckon with your own data →
          </button>
        )}
      </EarlyAccessModal>
    </div>
  )
}
