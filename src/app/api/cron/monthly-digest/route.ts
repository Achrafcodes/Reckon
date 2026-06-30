import { NextResponse } from 'next/server'
import { connectDB } from '@/server/db/connect'
import { User } from '@/server/db/models'
import { getSummary, getSpendByCategory } from '@/server/services/analytics.service'
import { sendMonthlyDigest } from '@/server/services/email.service'

/* Vercel Cron — runs on the 1st of every month at 08:00 UTC
 * Add to vercel.json:
 *   { "crons": [{ "path": "/api/cron/monthly-digest", "schedule": "0 8 1 * *" }] }
 * Protected by CRON_SECRET env var.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  // Compute last month's date range
  const now = new Date()
  const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
  const month = now.getMonth() === 0 ? 12 : now.getMonth()
  const from = new Date(year, month - 1, 1)
  const to = new Date(year, month, 0, 23, 59, 59, 999)
  const monthLabel = from.toLocaleString('en-US', { month: 'long', year: 'numeric' })

  const users = await User.find({}).select('name email settings').lean()

  let sent = 0
  let failed = 0

  for (const user of users) {
    const userId = String(user._id)

    try {
      const [summary, categories] = await Promise.all([
        getSummary(userId, from, to),
        getSpendByCategory(userId, from, to),
      ])

      if (summary.transactionCount === 0) continue

      const result = await sendMonthlyDigest(user.email, {
        userName: user.name,
        month: monthLabel,
        totalIncome: summary.totalIncome,
        totalExpenses: summary.totalExpenses,
        balance: summary.balance,
        topCategories: categories.slice(0, 5).map((c) => ({ name: c.name, total: c.total })),
        transactionCount: summary.transactionCount,
        currency: user.settings?.baseCurrency ?? 'MAD',
      })

      if (result.ok) sent++
      else {
        failed++
        console.error(`[cron:digest] Failed for ${user.email}:`, result.error)
      }
    } catch (err) {
      failed++
      console.error(`[cron:digest] Error for ${user.email}:`, err)
    }
  }

  return NextResponse.json({ ok: true, sent, failed, month: monthLabel })
}
