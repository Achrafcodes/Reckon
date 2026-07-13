import { ACCESS_MAILTO } from '@/lib/contact'

export function DemoBanner() {
  return (
    <div className="bg-brand text-white text-xs font-medium text-center py-2 px-4">
      <span className="opacity-80">You&apos;re viewing a demo with sample data.</span>
      {' '}
      <a
        href={ACCESS_MAILTO}
        className="underline underline-offset-2 font-semibold hover:opacity-90 transition-opacity"
      >
        Email us to use Reckon with your own data →
      </a>
    </div>
  )
}
