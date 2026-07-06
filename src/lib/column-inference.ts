/**
 * Headerless spreadsheet column inference.
 *
 * Given a raw cell grid (from sheet_to_json with header:1), classifies each
 * column by sampling its values — no header labels needed. Deterministic
 * heuristics only: date-like, amount-like, currency-code, and free-text
 * columns are scored over the first rows, then mapped to the transaction
 * fields the importer needs.
 */

export interface InferredColumns {
  /** Leading rows to skip (1 when an unrecognized header row was detected). */
  headerRows: number
  dateCol: number
  /** Single signed amount column… */
  amountCol: number | null
  /** …or a mutually-exclusive debit/credit pair (leftmost = money out). */
  debitCol: number | null
  creditCol: number | null
  descriptionCol: number | null
  currencyCol: number | null
}

export interface InferredRow {
  date: string // YYYY-MM-DD
  description: string
  amount: number // signed; negative = money out
  currency: string | null
}

const DATE_PATTERNS = [
  /^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/, // 2026-06-01
  /^\d{1,2}[-/.]\d{1,2}[-/.]\d{4}$/, // 01/06/2026
  /^\d{1,2}[-/.]\d{1,2}[-/.]\d{2}$/, // 01/06/26
  /^[A-Za-z]{3,9}\.? \d{1,2},? \d{4}$/, // Jun 1, 2026
  /^\d{1,2} [A-Za-z]{3,9}\.? \d{4}$/, // 1 Jun 2026
]

const AMOUNT_RE = /^\(?\s*[-+]?\s*[$€£¥]?\s*\d{1,3}(?:[,\s']\d{3})*(?:\.\d+)?\s*\)?$|^\(?\s*[-+]?\s*[$€£¥]?\s*\d+(?:\.\d+)?\s*\)?$/

export function isDateLike(v: unknown): boolean {
  if (v instanceof Date) return !isNaN(v.getTime())
  if (typeof v !== 'string') return false
  const s = v.trim()
  return s.length > 0 && DATE_PATTERNS.some((re) => re.test(s))
}

/** Parse a cell as a signed amount; null if it doesn't look like money. */
export function parseAmountLike(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  if (typeof v !== 'string') return null
  const s = v.trim()
  if (!s || !AMOUNT_RE.test(s)) return null
  const negative = /^\(.*\)$/.test(s) || s.includes('-')
  const digits = s.replace(/[^0-9.]/g, '')
  if (!digits) return null
  const n = Number(digits)
  if (isNaN(n)) return null
  return negative ? -n : n
}

function isCurrencyCode(v: unknown): boolean {
  return typeof v === 'string' && /^[A-Z]{3}$/.test(v.trim())
}

function isEmptyCell(v: unknown): boolean {
  return v === undefined || v === null || String(v).trim() === ''
}

/** Convert a date cell to YYYY-MM-DD; null when unparseable. */
export function normalizeDateCell(v: unknown): string | null {
  if (v instanceof Date) {
    return isNaN(v.getTime()) ? null : v.toISOString().split('T')[0]
  }
  if (typeof v !== 'string') return null
  const s = v.trim()

  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/)
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`

  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2}|\d{4})$/)
  if (m) {
    const year = m[3].length === 2 ? `20${m[3]}` : m[3]
    const [a, b] = [Number(m[1]), Number(m[2])]
    // a/b ambiguity: >12 disambiguates; otherwise assume day-first (matches
    // the documented DD/MM/YYYY format in the upload guide)
    let day = a
    let month = b
    if (a <= 12 && b > 12) {
      month = a
      day = b
    }
    if (month < 1 || month > 12 || day < 1 || day > 31) return null
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  // Month-name formats — JS Date parses these as local midnight, so read
  // local date parts (toISOString would shift the day in western timezones)
  if (/[A-Za-z]{3,9}/.test(s)) {
    const d = new Date(s)
    if (isNaN(d.getTime())) return null
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  return null
}

interface ColumnStats {
  nonEmpty: number
  dates: number
  amounts: number
  currencies: number
  negatives: number
  textLenSum: number
  texts: number
}

const SAMPLE_LIMIT = 40

/**
 * Infer the column layout of a grid with no (recognized) header row.
 * Returns null when no date column or no amount information can be found —
 * the caller should fall back to its normal "format not recognised" error.
 */
export function inferColumns(grid: unknown[][]): InferredColumns | null {
  const rows = grid.filter((r) => Array.isArray(r) && r.some((c) => !isEmptyCell(c)))
  if (rows.length < 2) return null

  // Header detection: a first row made of text labels (no dates, no amounts)
  const first = rows[0]
  const labelish = first.filter(
    (c) => typeof c === 'string' && c.trim() !== '' && !isDateLike(c) && parseAmountLike(c) === null,
  ).length
  const dataish = first.filter((c) => isDateLike(c) || (parseAmountLike(c) !== null && !isCurrencyCode(c))).length
  const headerRows = labelish >= 2 && dataish === 0 ? 1 : 0

  const dataRows = rows.slice(headerRows)
  if (dataRows.length === 0) return null
  const sample = dataRows.slice(0, SAMPLE_LIMIT)

  const colCount = Math.max(...sample.map((r) => r.length))
  const stats: ColumnStats[] = Array.from({ length: colCount }, () => ({
    nonEmpty: 0, dates: 0, amounts: 0, currencies: 0, negatives: 0, textLenSum: 0, texts: 0,
  }))

  for (const row of sample) {
    for (let c = 0; c < colCount; c++) {
      const v = row[c]
      if (isEmptyCell(v)) continue
      const st = stats[c]
      st.nonEmpty++
      if (isDateLike(v)) {
        st.dates++
        continue
      }
      if (isCurrencyCode(v)) {
        st.currencies++
        continue
      }
      const amt = parseAmountLike(v)
      if (amt !== null) {
        st.amounts++
        if (amt < 0) st.negatives++
        continue
      }
      st.texts++
      st.textLenSum += String(v).trim().length
    }
  }

  const frac = (part: number, st: ColumnStats) => (st.nonEmpty === 0 ? 0 : part / st.nonEmpty)

  // Date column: strongest date signal
  let dateCol = -1
  let bestDateFrac = 0
  stats.forEach((st, c) => {
    const f = frac(st.dates, st)
    if (st.dates >= 2 && f >= 0.6 && f > bestDateFrac) {
      bestDateFrac = f
      dateCol = c
    }
  })
  if (dateCol === -1) return null

  // Currency column
  let currencyCol: number | null = null
  stats.forEach((st, c) => {
    if (c !== dateCol && st.nonEmpty >= 2 && frac(st.currencies, st) >= 0.6) currencyCol = c
  })

  // Amount candidates
  const candidates = stats
    .map((st, c) => ({ st, c }))
    .filter(({ st, c }) => c !== dateCol && c !== currencyCol && st.nonEmpty >= 2 && frac(st.amounts, st) >= 0.6)
    .map(({ c }) => c)

  let amountCol: number | null = null
  let debitCol: number | null = null
  let creditCol: number | null = null

  if (candidates.length === 1) {
    amountCol = candidates[0]
  } else if (candidates.length >= 2) {
    // Mutually-exclusive pair → debit/credit (leftmost = money out, the
    // conventional order in bank exports)
    const [a, b] = candidates
    let exclusive = 0
    let both = 0
    for (const row of sample) {
      const hasA = !isEmptyCell(row[a]) && parseAmountLike(row[a]) !== 0
      const hasB = !isEmptyCell(row[b]) && parseAmountLike(row[b]) !== 0
      if (hasA && hasB) both++
      else if (hasA || hasB) exclusive++
    }
    if (exclusive > 0 && both / Math.max(exclusive + both, 1) <= 0.2) {
      debitCol = a
      creditCol = b
    } else {
      // Prefer the column with signed values (a balance column never goes
      // negative row-to-row the way a transaction amount does)
      const signed = candidates.find((c) => stats[c].negatives > 0)
      amountCol = signed ?? candidates[0]
    }
  } else {
    return null
  }

  // Description: longest-text column among what's left
  let descriptionCol: number | null = null
  let bestLen = 0
  stats.forEach((st, c) => {
    if (c === dateCol || c === currencyCol || c === amountCol || c === debitCol || c === creditCol) return
    if (st.texts < Math.max(2, st.nonEmpty * 0.5)) return
    const avg = st.textLenSum / st.texts
    if (avg > bestLen) {
      bestLen = avg
      descriptionCol = c
    }
  })

  return { headerRows, dateCol, amountCol, debitCol, creditCol, descriptionCol, currencyCol }
}

/** Materialize grid rows through an inferred mapping. Unparseable rows are dropped. */
export function extractRows(grid: unknown[][], mapping: InferredColumns): InferredRow[] {
  const rows = grid.filter((r) => Array.isArray(r) && r.some((c) => !isEmptyCell(c)))
  const out: InferredRow[] = []

  for (let i = mapping.headerRows; i < rows.length; i++) {
    const row = rows[i]
    const date = normalizeDateCell(row[mapping.dateCol])
    if (!date) continue

    let amount: number | null = null
    if (mapping.amountCol !== null) {
      amount = parseAmountLike(row[mapping.amountCol])
    } else if (mapping.debitCol !== null && mapping.creditCol !== null) {
      const debit = parseAmountLike(row[mapping.debitCol]) ?? 0
      const credit = parseAmountLike(row[mapping.creditCol]) ?? 0
      amount = credit - Math.abs(debit)
    }
    if (amount === null || amount === 0) continue

    const rawDesc = mapping.descriptionCol !== null ? String(row[mapping.descriptionCol] ?? '').trim() : ''
    const rawCurr = mapping.currencyCol !== null ? String(row[mapping.currencyCol] ?? '').trim().toUpperCase() : ''

    out.push({
      date,
      description: rawDesc || `Row ${i + 1}`,
      amount,
      currency: /^[A-Z]{3}$/.test(rawCurr) ? rawCurr : null,
    })
  }

  return out
}
