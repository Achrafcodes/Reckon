import 'server-only'
import { type NextRequest, NextResponse } from 'next/server'
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import mongoose from 'mongoose'
import { getCurrentUser } from '@/server/auth/session'
import { connectDB } from '@/server/db/connect'
import { Transaction } from '@/server/db/models'
import { rateLimit } from '@/lib/rate-limit'

// Use built-in Helvetica — no font file needed
const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', backgroundColor: '#fafaf8', paddingHorizontal: 48, paddingVertical: 44, fontSize: 9, color: '#1a1a18' },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#e5e4df' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1b5e3e', marginRight: 6 },
  brandName: { fontFamily: 'Helvetica-Bold', fontSize: 15, color: '#131a17', letterSpacing: 0.3 },
  headerRight: { alignItems: 'flex-end' },
  headerLabel: { fontSize: 7.5, color: '#8a8880', marginBottom: 2 },
  headerValue: { fontSize: 8.5, color: '#3a3a38' },

  // Section title
  sectionTitle: { fontFamily: 'Helvetica-Bold', fontSize: 7, color: '#8a8880', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 },

  // KPI strip
  kpiRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  kpiCard: { flex: 1, backgroundColor: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: '#e5e4df', padding: 14 },
  kpiLabel: { fontSize: 7.5, color: '#8a8880', marginBottom: 5 },
  kpiValue: { fontFamily: 'Helvetica-Bold', fontSize: 14 },
  kpiSub: { fontSize: 7, color: '#8a8880', marginTop: 3 },

  // Category bars
  catSection: { marginBottom: 28 },
  catRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  catDot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
  catName: { width: 110, fontSize: 8.5, color: '#3a3a38' },
  catBarBg: { flex: 1, height: 5, backgroundColor: '#f0efea', borderRadius: 3, marginRight: 10 },
  catBarFill: { height: 5, borderRadius: 3 },
  catAmt: { width: 70, fontSize: 8, color: '#3a3a38', textAlign: 'right' },

  // Transactions table
  txSection: { marginBottom: 0 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f5f4ef', borderRadius: 6, paddingVertical: 7, paddingHorizontal: 10, marginBottom: 2 },
  tableHeaderCell: { fontFamily: 'Helvetica-Bold', fontSize: 7.5, color: '#8a8880', textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', paddingVertical: 7, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#f0efea' },
  tableRowAlt: { backgroundColor: '#fdfcfb' },
  cellDate: { width: 62, fontSize: 8, color: '#8a8880' },
  cellDesc: { flex: 1, fontSize: 8, color: '#1a1a18' },
  cellCat: { width: 80, fontSize: 8, color: '#5a5a58' },
  cellAmt: { width: 70, fontSize: 8, fontFamily: 'Helvetica-Bold', textAlign: 'right' },

  // Footer
  footer: { position: 'absolute', bottom: 24, left: 48, right: 48, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#e5e4df', paddingTop: 10 },
  footerText: { fontSize: 7, color: '#b0afa9' },
})

function fmtAmt(n: number, type: string, currency: string) {
  const abs = Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  if (type === 'income') return `+${abs}`
  if (type === 'expense') return `−${abs}`
  return abs
}

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const limit = rateLimit(`report-pdf:${user._id}`, 20, 5 * 60 * 1000)
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

  const transactions = await Transaction.find({ user: uid, date: { $gte: from, $lte: to } })
    .populate('category', 'name color')
    .sort({ date: -1 })
    .limit(200)
    .lean()

  // Compute totals
  let totalIncome = 0
  let totalExpenses = 0
  const categoryMap = new Map<string, { name: string; color: string; total: number }>()

  for (const tx of transactions) {
    const amount = Math.abs(parseFloat(String(tx.amount)))
    const cat = tx.category as unknown as { _id: mongoose.Types.ObjectId; name: string; color: string } | null
    if (tx.type === 'income') totalIncome += amount
    else if (tx.type === 'expense') {
      totalExpenses += amount
      const id = cat ? String(cat._id) : 'uncategorized'
      const entry = categoryMap.get(id) ?? { name: cat?.name ?? 'Uncategorized', color: cat?.color ?? '#64748b', total: 0 }
      entry.total += amount
      categoryMap.set(id, entry)
    }
  }

  const balance = totalIncome - totalExpenses
  const topCategories = Array.from(categoryMap.values()).sort((a, b) => b.total - a.total).slice(0, 8)
  const maxCat = topCategories[0]?.total ?? 1

  const periodLabel = fromParam
    ? `${fmtDate(from)} – ${fmtDate(to)}`
    : 'All time'

  const fmt = (n: number) => n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  const doc = (
    <Document title={`Reckon Report — ${periodLabel}`} author="Reckon">
      {/* ── PAGE 1: Summary ── */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.brandRow}>
              <View style={styles.brandDot} />
              <Text style={styles.brandName}>Reckon</Text>
            </View>
            <Text style={{ fontSize: 8, color: '#8a8880', marginTop: 4 }}>Financial Report</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerLabel}>Generated</Text>
            <Text style={styles.headerValue}>{fmtDate(new Date())}</Text>
            <Text style={[styles.headerLabel, { marginTop: 6 }]}>Period</Text>
            <Text style={styles.headerValue}>{periodLabel}</Text>
            <Text style={[styles.headerLabel, { marginTop: 6 }]}>Account</Text>
            <Text style={styles.headerValue}>{user.name}</Text>
          </View>
        </View>

        {/* KPI strip */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Income</Text>
            <Text style={[styles.kpiValue, { color: '#1b5e3e' }]}>{fmt(totalIncome)}</Text>
            <Text style={styles.kpiSub}>{currency}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Expenses</Text>
            <Text style={[styles.kpiValue, { color: '#dc2626' }]}>{fmt(totalExpenses)}</Text>
            <Text style={styles.kpiSub}>{currency}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Net Balance</Text>
            <Text style={[styles.kpiValue, { color: balance >= 0 ? '#1b5e3e' : '#dc2626' }]}>
              {balance >= 0 ? '+' : '−'}{fmt(Math.abs(balance))}
            </Text>
            <Text style={styles.kpiSub}>{currency}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Transactions</Text>
            <Text style={[styles.kpiValue, { color: '#131a17' }]}>{transactions.length}</Text>
            <Text style={styles.kpiSub}>total</Text>
          </View>
        </View>

        {/* Category breakdown */}
        {topCategories.length > 0 && (
          <View style={styles.catSection}>
            <Text style={styles.sectionTitle}>Spending by category</Text>
            {topCategories.map((cat) => (
              <View key={cat.name} style={styles.catRow}>
                <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                <Text style={styles.catName}>{cat.name}</Text>
                <View style={styles.catBarBg}>
                  <View style={[styles.catBarFill, { width: `${(cat.total / maxCat) * 100}%`, backgroundColor: cat.color }]} />
                </View>
                <Text style={styles.catAmt}>{fmt(cat.total)} {currency}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Savings rate */}
        {totalIncome > 0 && (
          <View style={{ backgroundColor: '#f0faf5', borderRadius: 8, padding: 14, borderWidth: 1, borderColor: '#c6e8d6' }}>
            <Text style={{ fontSize: 7.5, color: '#1b5e3e', fontFamily: 'Helvetica-Bold' }}>
              Savings rate: {((balance / totalIncome) * 100).toFixed(1)}%
            </Text>
            <Text style={{ fontSize: 7.5, color: '#5a8a72', marginTop: 3 }}>
              You kept {fmt(Math.max(0, balance))} {currency} out of {fmt(totalIncome)} {currency} earned.
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Reckon — Personal Finance</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>

      {/* ── PAGE 2+: Transactions ── */}
      {transactions.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <View style={styles.brandDot} />
              <Text style={styles.brandName}>Reckon</Text>
            </View>
            <Text style={{ fontSize: 8, color: '#8a8880' }}>Transaction Detail</Text>
          </View>

          <Text style={styles.sectionTitle}>All transactions ({transactions.length})</Text>

          <View style={styles.txSection}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: 62 }]}>Date</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Description</Text>
              <Text style={[styles.tableHeaderCell, { width: 80 }]}>Category</Text>
              <Text style={[styles.tableHeaderCell, { width: 70, textAlign: 'right' }]}>Amount</Text>
            </View>
            {transactions.map((tx, i) => {
              const cat = tx.category as unknown as { name: string } | null
              const amount = parseFloat(String(tx.amount))
              const amtColor = tx.type === 'income' ? '#1b5e3e' : tx.type === 'expense' ? '#dc2626' : '#64748b'
              return (
                <View key={String(tx._id)} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]} wrap={false}>
                  <Text style={styles.cellDate}>{fmtDate(tx.date)}</Text>
                  <Text style={styles.cellDesc}>
                    {tx.description.length > 38 ? tx.description.slice(0, 36) + '…' : tx.description}
                  </Text>
                  <Text style={styles.cellCat}>{cat?.name ?? 'Uncategorized'}</Text>
                  <Text style={[styles.cellAmt, { color: amtColor }]}>
                    {fmtAmt(amount, tx.type, currency)}
                  </Text>
                </View>
              )
            })}
          </View>

          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>Reckon — Personal Finance</Text>
            <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
        </Page>
      )}
    </Document>
  )

  const buffer = await renderToBuffer(doc)
  const dateStr = new Date().toISOString().slice(0, 10)

  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="reckon-report-${dateStr}.pdf"`,
      'Cache-Control': 'no-store',
    },
  })
}
