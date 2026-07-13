import 'server-only'
import { type NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import mongoose from 'mongoose'
import { getCurrentUser } from '@/server/auth/session'
import { connectDB } from '@/server/db/connect'
import { Transaction, Category } from '@/server/db/models'
import { rateLimit } from '@/lib/rate-limit'
import { isApprovedAccount } from '@/lib/admin'

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isApprovedAccount(user)) return NextResponse.json({ error: 'Your account is pending approval.' }, { status: 403 })

  const limit = rateLimit(`report:${user._id}`, 20, 5 * 60 * 1000)
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many export requests. Please wait a few minutes.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((limit.resetAt - Date.now()) / 1000)) } },
    )
  }

  const { searchParams } = new URL(request.url)
  const fromParam = searchParams.get('from')
  const toParam = searchParams.get('to')
  const currency = searchParams.get('currency') ?? 'USD'

  const from = fromParam ? new Date(fromParam) : new Date('2000-01-01')
  const to = toParam ? new Date(toParam) : new Date('2099-12-31')

  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    return NextResponse.json({ error: 'Invalid date range' }, { status: 400 })
  }

  await connectDB()
  const uid = new mongoose.Types.ObjectId(String(user._id))

  // Fetch all transactions in range
  const transactions = await Transaction.find({
    user: uid,
    date: { $gte: from, $lte: to },
  })
    .populate('category', 'name color')
    .sort({ date: -1 })
    .lean()

  // Compute summary
  let totalIncome = 0
  let totalExpenses = 0
  const categoryMap = new Map<string, { name: string; color: string; total: number }>()

  for (const tx of transactions) {
    const amount = Math.abs(parseFloat(String(tx.amount)))
    if (tx.type === 'income') totalIncome += amount
    else if (tx.type === 'expense') {
      totalExpenses += amount
      const cat = tx.category as unknown as { _id: mongoose.Types.ObjectId; name: string; color: string } | null
      const catId = cat ? String(cat._id) : 'uncategorized'
      const catName = cat?.name ?? 'Uncategorized'
      const catColor = cat?.color ?? '#64748b'
      const existing = categoryMap.get(catId) ?? { name: catName, color: catColor, total: 0 }
      existing.total += amount
      categoryMap.set(catId, existing)
    }
  }

  // ── Sheet 1: Summary ──────────────────────────────────────────────────────
  const summaryData = [
    ['Reckon — Financial Report'],
    ['Generated', new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })],
    ['Period', `${from.toLocaleDateString('en-GB')} – ${to.toLocaleDateString('en-GB')}`],
    ['Currency', currency],
    [],
    ['Metric', 'Amount'],
    ['Total Income', totalIncome],
    ['Total Expenses', totalExpenses],
    ['Net Balance', totalIncome - totalExpenses],
    ['Transactions', transactions.length],
  ]

  // ── Sheet 2: Transactions ─────────────────────────────────────────────────
  const txHeaders = ['Date', 'Description', 'Category', 'Type', `Amount (${currency})`]
  const txRows = transactions.map((tx) => {
    const cat = tx.category as unknown as { name: string } | null
    const amount = parseFloat(String(tx.amount))
    return [
      new Date(tx.date).toLocaleDateString('en-GB'),
      tx.description,
      cat?.name ?? 'Uncategorized',
      tx.type.charAt(0).toUpperCase() + tx.type.slice(1),
      tx.type === 'income' ? Math.abs(amount) : -Math.abs(amount),
    ]
  })

  // ── Sheet 3: Category Breakdown ───────────────────────────────────────────
  const catHeaders = ['Category', `Total Spent (${currency})`, '% of Expenses']
  const catRows = Array.from(categoryMap.values())
    .sort((a, b) => b.total - a.total)
    .map((c) => [
      c.name,
      c.total,
      totalExpenses > 0 ? parseFloat(((c.total / totalExpenses) * 100).toFixed(1)) : 0,
    ])

  // ── Build workbook ────────────────────────────────────────────────────────
  const wb = XLSX.utils.book_new()

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
  wsSummary['!cols'] = [{ wch: 20 }, { wch: 18 }]
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary')

  const wsTx = XLSX.utils.aoa_to_sheet([txHeaders, ...txRows])
  wsTx['!cols'] = [{ wch: 12 }, { wch: 40 }, { wch: 20 }, { wch: 12 }, { wch: 16 }]
  XLSX.utils.book_append_sheet(wb, wsTx, 'Transactions')

  const wsCat = XLSX.utils.aoa_to_sheet([catHeaders, ...catRows])
  wsCat['!cols'] = [{ wch: 24 }, { wch: 18 }, { wch: 16 }]
  XLSX.utils.book_append_sheet(wb, wsCat, 'Category Breakdown')

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  const dateStr = new Date().toISOString().slice(0, 10)
  const filename = `reckon-report-${dateStr}.xlsx`

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
