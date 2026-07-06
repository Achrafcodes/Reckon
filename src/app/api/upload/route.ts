import { type NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/server/auth/session'
import { importTransactions, type ParsedRow } from '@/server/services/import.service'
import { detectBudgetSummary, importBudgetSummary } from '@/server/services/budget-import.service'
import { inferColumns, extractRows } from '@/lib/column-inference'
import { rateLimit } from '@/lib/rate-limit'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'application/csv',
  'application/pdf',
  'application/x-pdf',
])
const ALLOWED_EXTENSIONS = new Set(['.xlsx', '.xls', '.csv', '.pdf'])

// Column names we recognise as date / amount / description fields
const DATE_COLS   = new Set(['date', 'transaction date', 'trans date', 'value date', 'posting date'])
const AMOUNT_COLS = new Set(['amount', 'debit', 'credit', 'sum', 'value'])
const DESC_COLS   = new Set(['description', 'narrative', 'details', 'memo', 'particulars', 'reference', 'label'])

function safeExt(name: string): string {
  const i = name.lastIndexOf('.')
  return i === -1 ? '' : name.slice(i).toLowerCase()
}

function normaliseKey(k: string): string {
  return k.toLowerCase().replace(/[^a-z ]/g, '').trim()
}

// ── PDF text → rows ──────────────────────────────────────────────────────────

/**
 * Attempt to parse PDF extracted text as transaction rows.
 * Looks for lines that contain a date + amount pattern.
 */
function parsePdfText(text: string): ParsedRow[] {
  const rows: ParsedRow[] = []
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)

  // Date patterns: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY
  const dateRe = /(\d{4}-\d{2}-\d{2}|\d{2}[\/\-]\d{2}[\/\-]\d{4}|\d{2}[\/\-]\d{2}[\/\-]\d{2})/
  // Amount pattern: optional sign, digits, optional decimals, optional currency symbols
  const amountRe = /([-+]?\s*[\d,]+\.?\d*)/

  for (const line of lines) {
    const dateMatch = line.match(dateRe)
    if (!dateMatch) continue

    // Remove the date from the line to find description and amount
    const rest = line.replace(dateMatch[0], '').trim()
    const amountMatches = [...rest.matchAll(new RegExp(amountRe.source, 'g'))]
    if (amountMatches.length === 0) continue

    // The last number-like token is usually the amount
    const rawAmount = amountMatches[amountMatches.length - 1][0].replace(/\s/g, '')
    const amount = parseFloat(rawAmount.replace(/,/g, ''))
    if (isNaN(amount) || amount === 0) continue

    // Everything that's not the amount is the description
    const description = rest.replace(amountMatches[amountMatches.length - 1][0], '').trim()
      .replace(/\s{2,}/g, ' ')
      || 'Transaction'

    // Normalise date
    let dateStr = dateMatch[0]
    if (/^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/.test(dateStr)) {
      const [d, m, y] = dateStr.split(/[\/\-]/)
      dateStr = `${y}-${m}-${d}`
    } else if (/^\d{2}[\/\-]\d{2}[\/\-]\d{2}$/.test(dateStr)) {
      const [d, m, y] = dateStr.split(/[\/\-]/)
      dateStr = `20${y}-${m}-${d}`
    }

    rows.push({
      date: dateStr,
      description,
      merchant: description,
      amount: amount.toFixed(2),
      currency: 'CAD',
      type: amount >= 0 ? 'income' : 'expense',
    })
  }

  return rows
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const limit = rateLimit(`upload:${user._id}`, 10, 5 * 60 * 1000)
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: 'Too many uploads. Please wait a few minutes and try again.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((limit.resetAt - Date.now()) / 1000)) } },
    )
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'No file provided' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ ok: false, error: 'File exceeds 5 MB limit' }, { status: 400 })
  }

  const ext = safeExt(file.name)
  if (!ALLOWED_TYPES.has(file.type) && !ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json({ ok: false, error: 'Unsupported file type. Please upload .xlsx, .xls, .csv, or .pdf.' }, { status: 400 })
  }

  const accountType = (formData.get('accountType') ?? 'debit') === 'credit' ? 'credit' : 'debit'
  const buffer = Buffer.from(await file.arrayBuffer())

  // ── PDF path ────────────────────────────────────────────────────────────────
  if (ext === '.pdf' || file.type === 'application/pdf' || file.type === 'application/x-pdf') {
    let rows: ParsedRow[]
    try {
      // pdf-parse may export as CJS default or as the function directly
      const pdfModule = await import('pdf-parse')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfParse: (buf: Buffer) => Promise<{ text: string }> = (pdfModule as any).default ?? pdfModule
      const data = await pdfParse(buffer)
      rows = parsePdfText(data.text)
    } catch {
      return NextResponse.json(
        { ok: false, error: 'Could not read this PDF. Make sure it is a text-based PDF (not a scanned image). Try exporting your statement as CSV or Excel instead.' },
        { status: 422 },
      )
    }

    if (rows.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'No transactions found in this PDF. The file may be image-based (scanned) or use an unrecognised layout. Try exporting your statement as CSV or Excel instead.',
          hint: 'pdf_no_data',
        },
        { status: 422 },
      )
    }

    const result = await importTransactions(String(user._id), file.name, rows)
    return NextResponse.json({
      ok: true,
      data: {
        imported: result.imported,
        skipped: result.skipped,
        batchId: result.batchId,
        format: 'transactions',
      },
    }, { status: 201 })
  }

  // ── Spreadsheet / CSV path ───────────────────────────────────────────────────
  const { read, utils } = await import('xlsx')

  let rows: ParsedRow[]
  try {
    const workbook = read(buffer, { type: 'buffer', cellDates: true })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]

    // Read header row to identify format
    const allRows = utils.sheet_to_json<unknown[]>(sheet, { header: 1 })
    const headerRow = (allRows[0] ?? []) as unknown[]
    const headerNames = headerRow.map((h) => normaliseKey(String(h ?? '')))
    const namedHeaders = headerNames.filter(Boolean)

    const hasAmountCol = namedHeaders.some((h) => AMOUNT_COLS.has(h))
    const hasDateCol   = namedHeaders.some((h) => DATE_COLS.has(h))
    const hasDescCol   = namedHeaders.some((h) => DESC_COLS.has(h))

    const isTransactionList = hasAmountCol || (hasDateCol && hasDescCol)

    const raw: Record<string, unknown>[] = utils.sheet_to_json(sheet, { defval: '' })

    if (!isTransactionList) {
      // ── Try budget summary detection ──────────────────────────────────────
      const budgetData = detectBudgetSummary(raw)
      if (budgetData) {
        const result = await importBudgetSummary(String(user._id), file.name, budgetData)
        return NextResponse.json({
          ok: true,
          data: {
            imported: result.transactionsImported,
            skipped: result.skipped,
            batchId: result.batchId,
            format: 'budget_summary',
            budgetsCreated: result.budgetsCreated,
            budgetsUpdated: result.budgetsUpdated,
            month: result.month,
          },
        }, { status: 201 })
      }

      // ── Headerless / unrecognized headers → infer columns from the data ───
      // CSV: re-read with raw:true so cells stay as the original text — SheetJS
      // otherwise destroys "01/06/2026" at read() time by parsing it as a US
      // month-first Date. XLSX keeps the normal parse (serial dates are exact).
      const isCsv = ext === '.csv' || file.type.includes('csv')
      const gridSheet = isCsv
        ? (() => {
            const wbRaw = read(buffer, { type: 'buffer', raw: true })
            return wbRaw.Sheets[wbRaw.SheetNames[0]]
          })()
        : sheet
      const grid = utils.sheet_to_json<unknown[]>(gridSheet, { header: 1, defval: '' })
      const mapping = inferColumns(grid)
      const inferredRows = mapping ? extractRows(grid, mapping) : []

      if (inferredRows.length === 0) {
        // Not a recognised format
        const sample = namedHeaders.slice(0, 5).map((h) => `"${h}"`).join(', ')
        const hint = sample ? `Found columns: ${sample}.` : 'No column headers detected.'
        return NextResponse.json(
          {
            ok: false,
            error:
              `File format not recognised. Expected a transaction list with columns like "Date", "Description", "Amount" — or a budget summary with category columns and rows like "Week 1", "Budget Limit". ` +
              `${hint}`,
            hint: 'format_mismatch',
          },
          { status: 422 },
        )
      }

      rows = inferredRows.map((r) => {
        const type: 'income' | 'expense' | 'transfer' =
          r.amount < 0
            ? 'expense'
            : accountType === 'credit'
              ? 'transfer'
              : 'income'
        return {
          date: r.date,
          description: r.description,
          merchant: r.description,
          amount: r.amount.toFixed(2),
          currency: r.currency ?? 'CAD',
          type,
          accountType,
        } satisfies ParsedRow
      })
    } else {
    // ── Parse as transaction list ──────────────────────────────────────────
    rows = raw.map((r, i) => {
      const safe: Record<string, unknown> = Object.create(null)
      for (const key of Object.keys(r)) {
        if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
          safe[normaliseKey(key)] = r[key]
        }
      }

      const rawDate   = safe['date'] ?? safe['transaction date'] ?? safe['trans date'] ?? safe['value date'] ?? safe['posting date']
      const description = String(safe['description'] ?? safe['narrative'] ?? safe['details'] ?? safe['memo'] ?? safe['particulars'] ?? safe['reference'] ?? safe['label'] ?? `Row ${i + 1}`)
      let rawAmount: number
      if (safe['amount'] !== '' && safe['amount'] !== undefined) {
        rawAmount = Number(String(safe['amount']).replace(/[^0-9.\-]/g, ''))
      } else {
        const debit  = Number(String(safe['debit']  ?? '0').replace(/[^0-9.]/g, ''))
        const credit = Number(String(safe['credit'] ?? '0').replace(/[^0-9.]/g, ''))
        rawAmount = credit - debit
      }
      const currency = String(safe['currency'] ?? safe['ccy'] ?? safe['devise'] ?? '').toUpperCase().slice(0, 3) || 'CAD'

      let date: string
      if (rawDate instanceof Date) {
        date = rawDate.toISOString().split('T')[0]
      } else {
        const d = new Date(String(rawDate))
        date = isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0]
      }

      const amount = isNaN(rawAmount) ? '0.00' : rawAmount.toFixed(2)
      // Credit card: positive = card payment (transfer), negative = purchase (expense)
      // Debit account: positive = money received (income), negative = money spent (expense)
      const type: 'income' | 'expense' | 'transfer' =
        rawAmount < 0
          ? 'expense'
          : accountType === 'credit'
            ? 'transfer'
            : 'income'

      return { date, description, merchant: description, amount, currency, type, accountType } satisfies ParsedRow
    })
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'The file appears to be empty — no data rows found.' },
        { status: 422 },
      )
    }

    const nonZeroRows = rows.filter((r) => Number(r.amount) !== 0)
    if (nonZeroRows.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'All parsed amounts are zero. Please check your file contains actual transaction data.',
          hint: 'format_mismatch',
        },
        { status: 422 },
      )
    }

    rows = rows.filter((r) => Number(r.amount) !== 0 || !/^Row \d+$/.test(r.description))
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to parse file. Is it a valid spreadsheet or CSV?' }, { status: 422 })
  }

  const result = await importTransactions(String(user._id), file.name, rows)

  return NextResponse.json({
    ok: true,
    data: {
      imported: result.imported,
      skipped: result.skipped,
      batchId: result.batchId,
      format: 'transactions',
    },
  }, { status: 201 })
}
