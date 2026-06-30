import Link from 'next/link'

export function ImportPrompt() {
  return (
    <div
      className="animate-fade-up mt-6 rounded-xl border border-dashed border-rule bg-paper flex flex-col items-center justify-center text-center py-20 px-8 gap-5"
      style={{ animationDelay: '280ms' }}
    >
      {/* Icon */}
      <div className="w-14 h-14 rounded-full bg-forest-subtle flex items-center justify-center">
        <svg
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.75}
          className="text-forest"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m-4-4l4-4 4 4" />
        </svg>
      </div>

      <div className="max-w-xs">
        <p className="text-base font-semibold text-ink tracking-tight">
          Your financial picture starts here
        </p>
        <p className="mt-2 text-sm text-ink-muted leading-relaxed">
          Import a bank statement or expense spreadsheet and Reckon will categorize and analyze your spending automatically.
        </p>
      </div>

      <Link
        href="/upload"
        className="inline-flex items-center gap-2 bg-brand text-white text-sm font-medium px-5 py-2.5 rounded-md hover:bg-brand-h transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:ring-offset-2"
      >
        Import file
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </Link>

      <p className="text-xs text-ink-muted/60">
        Supports .xlsx, .xls, and .csv — your data stays private.
      </p>
    </div>
  )
}
