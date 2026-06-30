import { type NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/server/auth/session'
import { importTransactions, type ParsedRow } from '@/server/services/import.service'
import { rateLimit } from '@/lib/rate-limit'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'application/csv',
])
const ALLOWED_EXTENSIONS = new Set(['.xlsx', '.xls', '.csv'])

function safeExt(name: string): string {
  const i = name.lastIndexOf('.')
  return i === -1 ? '' : name.slice(i).toLowerCase()
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  // 10 uploads per 5 minutes per user — uploads are CPU/IO heavy (parse + dedupe)
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

  if (!ALLOWED_TYPES.has(file.type) && !ALLOWED_EXTENSIONS.has(safeExt(file.name))) {
    return NextResponse.json({ ok: false, error: 'Unsupported file type' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  // Dynamic import keeps xlsx out of the edge bundle and avoids loading it server-side
  // for every request — only loaded when actually needed.
  const { read, utils } = await import('xlsx')

  let rows: ParsedRow[]
  try {
    const workbook = read(buffer, { type: 'buffer', cellDates: true })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const raw: Record<string, unknown>[] = utils.sheet_to_json(sheet, { defval: '' })

    rows = raw.map((r, i) => {
      // Sanitize keys to prevent prototype pollution
      const safe: Record<string, unknown> = Object.create(null)
      for (const key of Object.keys(r)) {
        if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
          safe[key.toLowerCase().trim()] = r[key]
        }
      }

      const rawDate = safe['date'] ?? safe['transaction date'] ?? safe['value date']
      const description = String(safe['description'] ?? safe['narrative'] ?? safe['details'] ?? `Row ${i + 1}`)
      const rawAmount = Number(safe['amount'] ?? safe['debit'] ?? safe['credit'] ?? 0)
      const currency = String(safe['currency'] ?? 'MAD').toUpperCase().slice(0, 3)

      let date: string
      if (rawDate instanceof Date) {
        date = rawDate.toISOString().split('T')[0]
      } else {
        const d = new Date(String(rawDate))
        date = isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0]
      }

      const amount = rawAmount.toFixed(2)
      const type: 'income' | 'expense' | 'transfer' = rawAmount >= 0 ? 'income' : 'expense'

      return { date, description, merchant: description, amount, currency, type }
    })
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to parse file' }, { status: 422 })
  }

  const result = await importTransactions(String(user._id), file.name, rows)

  return NextResponse.json({ ok: true, data: result }, { status: 201 })
}
