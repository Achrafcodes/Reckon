import 'server-only'
import mongoose from 'mongoose'
import { connectDB } from '@/server/db/connect'
import { Budget, Transaction } from '@/server/db/models'
import { toDecimal128, fromDecimal128 } from '@/lib/money'
import type { CreateBudgetInput, UpdateBudgetInput } from '@/schemas/budget'

export interface BudgetWithActual {
  _id: string
  category: { _id: string; name: string; color: string; icon: string }
  month: string
  limit: number
  actual: number
  currency: string
  alertThreshold: number
  pct: number
}

export async function listBudgets(
  userId: string,
  month: string,
): Promise<BudgetWithActual[]> {
  await connectDB()
  const uid = new mongoose.Types.ObjectId(userId)

  const [year, m] = month.split('-').map(Number)
  const from = new Date(year, m - 1, 1)
  const to = new Date(year, m, 0, 23, 59, 59, 999)

  const budgets = await Budget.find({ user: uid, month })
    .populate('category', 'name color icon')
    .lean()
    .exec()

  const categoryIds = budgets
    .map((b) => (b.category as unknown as { _id: mongoose.Types.ObjectId })._id)
    .filter(Boolean)

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

  return budgets.map((b) => {
    const cat = b.category as unknown as { _id: mongoose.Types.ObjectId; name: string; color: string; icon: string }
    const limit = fromDecimal128(b.limit as mongoose.Types.Decimal128)
    const actual = actualMap.get(String(cat._id)) ?? 0
    return {
      _id: String(b._id),
      category: { _id: String(cat._id), name: cat.name, color: cat.color, icon: cat.icon },
      month: b.month,
      limit,
      actual,
      currency: b.currency,
      alertThreshold: b.alertThreshold,
      pct: limit > 0 ? actual / limit : 0,
    }
  })
}

export async function createBudget(
  userId: string,
  input: CreateBudgetInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await connectDB()

  try {
    const doc = await Budget.create({
      user: new mongoose.Types.ObjectId(userId),
      category: new mongoose.Types.ObjectId(input.category),
      month: input.month,
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

  const result = await Budget.findOneAndUpdate(
    { _id: budgetId, user: new mongoose.Types.ObjectId(userId) },
    { $set: update },
  )

  if (!result) return { ok: false, error: 'Budget not found.' }
  return { ok: true }
}

export async function deleteBudget(
  userId: string,
  budgetId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await connectDB()

  const result = await Budget.findOneAndDelete({
    _id: budgetId,
    user: new mongoose.Types.ObjectId(userId),
  })

  if (!result) return { ok: false, error: 'Budget not found.' }
  return { ok: true }
}
