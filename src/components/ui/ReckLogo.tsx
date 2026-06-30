/**
 * Reckon logo — geometric mark (balance ledger) + wordmark.
 * Mark: two horizontal ledger lines anchored by a vertical spine,
 * forming a stylised "R" / balance-sheet icon.
 */
interface ReckLogoProps {
  /** Total rendered width. Height scales proportionally (aspect ≈ 3.4:1). */
  width?: number
  /** Override mark + text colour (defaults to currentColor). */
  color?: string
  /** Show mark only — no wordmark. */
  markOnly?: boolean
  className?: string
}

export function ReckLogo({
  width = 120,
  color = 'currentColor',
  markOnly = false,
  className,
}: ReckLogoProps) {
  /* The mark is 24×24; the full lockup is ~120×32 */
  const markSize = Math.round((width / (markOnly ? 1 : 4.5)) * 1)
  const totalW = markOnly ? markSize : width
  const totalH = Math.round(markSize * (markOnly ? 1 : 1.1))

  return (
    <svg
      width={totalW}
      height={Math.max(totalH, 28)}
      viewBox={markOnly ? '0 0 24 24' : '0 0 120 28'}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Reckon"
      role="img"
      className={className}
    >
      {/* ── Mark: ledger / balance icon ── */}
      {/* Vertical spine */}
      <line
        x1="4" y1="4" x2="4" y2="20"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        style={{ strokeDasharray: 160, strokeDashoffset: 0 }}
      />
      {/* Top bar (full width) */}
      <line
        x1="4" y1="4" x2="18" y2="4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Mid bar (shorter — suggest balance) */}
      <line
        x1="4" y1="12" x2="15" y2="12"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Diagonal leg — like a rising trend / R leg */}
      <line
        x1="15" y1="12" x2="20" y2="20"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Corner bracket — closes the "R" shoulder */}
      <path
        d="M18 4 Q22 4 22 8 Q22 12 15 12"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* ── Wordmark ── (hidden in markOnly mode) */}
      {!markOnly && (
        <text
          x="30"
          y="20"
          fontFamily="var(--font-dm-serif), Georgia, serif"
          fontStyle="italic"
          fontSize="18"
          fill={color}
          letterSpacing="-0.3"
        >
          Reckon
        </text>
      )}
    </svg>
  )
}
