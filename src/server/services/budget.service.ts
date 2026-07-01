import 'server-only'
import mongoose from 'mongoose'
import { connectDB } from '@/server/db/connect'
import { Budget, Transaction } from '@/server/db/models'
import { toDecimal128, fromDecimal128 } from '@/lib/money'
import { Notification } from '@/server/db/models'
import type { CreateBudgetInput, UpdateBudgetInput } from '@/schemas/budget'

export interface BudgetWithActual {
  _id: string
  category: { _id: string; name: string; color: string; icon: string }
  month: string
  recurring: boolean
  limit: number
  actual: number
  currency: string
  alertThreshold: number
  pct: number
}

export async function listBudgets(
  userId: string,
  month: string,
  userCurrency = 'CAD',
): Promise<BudgetWithActual[]> {
  await connectDB()
  const uid = new mongoose.Types.ObjectId(userId)

  const [year, m] = month.split('-').map(Number)
  const from = new Date(year, m - 1, 1)
  const to = new Date(year, m, 0, 23, 59, 59, 999)

  // Fetch month-specific budgets + recurring budgets; deduplicate by category
  // (month-specific wins over recurring for the same category)
  const [monthBudgets, recurringBudgets] = await Promise.all([
    Budget.find({ user: uid, month }).populate('category', 'name color icon').lean().exec(),
    Budget.find({ user: uid, recurring: true }).populate('category', 'name color icon').lean().exec(),
  ])
  const monthCategoryIds = new Set(monthBudgets.map((b) => String((b.category as unknown as { _id: mongoose.Types.ObjectId })._id)))
  const budgets = [
    ...monthBudgets,
    ...recurringBudgets.filter((b) => !monthCategoryIds.has(String((b.category as unknown as { _id: mongoose.Types.ObjectId })._id))),
  ]

  const categoryIds = budgets
    .map((b) => (b.category as unknown as { _id: mongoose.Types.ObjectId } | null)?._id)
    .filter((id): id is mongoose.Types.ObjectId => id != null)

  const actuals: { _id: mongoose.Types.ObjectId; total: number }[] =
    await Transaction.aggregate([
      {
        $match: {
          user: uid,
          type: 'expense',
          date: { $gte: from, $lte: to },
          category: { $in: categoryIds },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: { $abs: { $toDouble: '$amount' } } },
        },
      },
    ])

  const actualMap = new Map(actuals.map((a) => [String(a._id), a.total]))

  const results = budgets
    .filter((b) => b.category != null)
    .map((b) => {
      const cat = b.category as unknown as { _id: mongoose.Types.ObjectId; name: string; color: string; icon: string }
      const limit = fromDecimal128(b.limit as mongoose.Types.Decimal128)
      const actual = actualMap.get(String(cat._id)) ?? 0
      const pct = limit > 0 ? actual / limit : 0
      return {
        _id: String(b._id),
        category: { _id: String(cat._id), name: cat.name, color: cat.color, icon: cat.icon },
        month: b.month,
        recurring: b.recurring ?? false,
        limit,
        actual,
        currency: b.currency,
        alertThreshold: b.alertThreshold,
        pct,
      }
    })

  // Bulk-insert budget alert notifications — one insertMany instead of N individual creates.
  // Only fires for budgets that crossed a threshold this load; existing alerts for the same
  // budgetId+month are ignored by the sparse unique check on { user, meta.budgetId, month }.
  const alerts = results
    .filter((b) => b.pct >= Math.min(b.alertThreshold / 100, 1.0))
    .map((b) => ({
      user: new mongoose.Types.ObjectId(userId),
      kind: 'budget_alert' as const,
      title:
        b.pct >= 1.0
          ? `Budget exceeded: ${b.category.name}`
          : `${b.category.name} budget at ${(b.pct * 100).toFixed(0)}%`,
      body:
        b.pct >= 1.0
          ? `You've spent ${(b.pct * 100).toFixed(0)}% of your ${b.month} budget for ${b.category.name}.`
          : `You've used ${(b.pct * 100).toFixed(0)}% of your ${userCurrency} ${b.limit.toLocaleString()} limit.`,
      meta: { budgetId: b._id, pct: b.pct },
      isRead: false,
    }))

  if (alerts.length > 0) {
    Notification.insertMany(alerts, { ordered: false }).catch(() => undefined)
  }

  return results
}

export async function createBudget(
  userId: string,
  input: CreateBudgetInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await connectDB()

  try {
    const month = input.recurring ? 'recurring' : (input.month ?? '')
    const doc = await Budget.create({
      user: new mongoose.Types.ObjectId(userId),
      category: new mongoose.Types.ObjectId(input.category),
      month,
      recurring: input.recurring ?? false,
      limit: toDecimal128(input.limit),
      currency: input.currency,
      alertThreshold: input.alertThreshold,
    })
    return { ok: true, id: String(doc._id) }
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      return { ok: false, error: 'A budget for this category and month already exists.' }
    }
    throw err
  }
}

export async function updateBudget(
  userId: string,
  budgetId: string,
  input: UpdateBudgetInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await connectDB()

  const update: Record<string, unknown> = {}
  if (input.limit) update.limit = toDecimal128(input.limit)
  if (input.currency) update.currency = input.currency
  if (input.alertThreshold !== undefined) update.alertThreshold = input.alertThreshold
  if (input.recurring !== undefined) {
    update.recurring = input.recurring
    update.month = input.recurring ? 'recurring' : update.month
  }

  const result = await Budget.updateOne(
    { _id: budgetId, user: new mongoose.Types.ObjectId(userId) },
    { $set: update },
  )

  if (result.matchedCount === 0) return { ok: false, error: 'Budget not found.' }
  return { ok: true }
}

export async function deleteBudget(
  userId: string,
  budgetId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await connectDB()

  const result = await Budget.deleteOne({
    _id: budgetId,
    user: new mongoose.Types.ObjectId(userId),
  })

  if (result.deletedCount === 0) return { ok: false, error: 'Budget not found.' }
  return { ok: true }
}
