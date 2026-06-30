interface ReckLogoProps {
  /** Total rendered width in px. Height auto-scales. */
  width?: number
  /** Wordmark text colour. Defaults to currentColor. */
  color?: string
  /** Show the square mark only — no wordmark. */
  markOnly?: boolean
  className?: string
}

/**
 * Reckon logo — branded square mark (ascending bar chart) + wordmark.
 *
 * Mark: brand-blue rounded square, three ascending white bars, accent dot at
 * the peak. Always renders in brand colours so it looks right on any background.
 * `color` controls only the wordmark text colour.
 */
export function ReckLogo({
  width = 120,
  color = 'currentColor',
  markOnly = false,
  className,
}: ReckLogoProps) {
  const markSize = markOnly
    ? width
    : Math.max(Math.round(width / 4.2), 20)

  const fontSize = Math.round(markSize * 0.68)

  return (
    <div
      className={['inline-flex items-center', markOnly ? '' : 'gap-2.5', className ?? ''].filter(Boolean).join(' ')}
      role="img"
      aria-label="Reckon"
    >
      {/* ── Mark ── */}
      <svg
        width={markSize}
        height={markSize}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ display: 'block', flexShrink: 0 }}
      >
        {/* Rounded square container */}
        <rect width="28" height="28" rx="7" fill="#1e40af" />

        {/* Ascending bars — bottom-aligned at y=23, left-to-right: short → tall */}
        <rect x="6"  y="18" width="4" height="5"  rx="1.5" fill="white" fillOpacity="0.45" />
        <rect x="12" y="13" width="4" height="10" rx="1.5" fill="white" fillOpacity="0.72" />
        <rect x="18" y="8"  width="4" height="15" rx="1.5" fill="white" />

        {/* Subtle trend line connecting bar tops */}
        <path
          d="M8 18L14 13L20 8"
          stroke="white"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.35"
        />

        {/* Accent dot at the peak — signals "data point" */}
        <circle cx="20" cy="8" r="2" fill="#93c5fd" />
      </svg>

      {/* ── Wordmark ── */}
      {!markOnly && (
        <span
          style={{
            color,
            fontSize,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            fontFamily: 'var(--font-geist-sans, system-ui, -apple-system, sans-serif)',
            userSelect: 'none',
          }}
        >
          Reckon
        </span>
      )}
    </div>
  )
}
