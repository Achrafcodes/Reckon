import 'server-only'
import mongoose from 'mongoose'
import { connectDB } from '@/server/db/connect'
import { Transaction } from '@/server/db/models'

export interface SummaryResult {
  totalIncome: number
  totalExpenses: number
  balance: number
  biggestExpense: number
  transactionCount: number
}

export interface CategorySpend {
  // null for spend on transactions with no category (deleted/uncategorized)
  categoryId: string | null
  name: string
  color: string
  total: number
}

export interface MonthlyTrend {
  month: string // "YYYY-MM"
  income: number
  expenses: number
}

export async function getSummary(
  userId: string,
  from: Date,
  to: Date,
): Promise<SummaryResult> {
  await connectDB()
  const uid = new mongoose.Types.ObjectId(userId)

  const [result] = await Transaction.aggregate([
    { $match: { user: uid, date: { $gte: from, $lte: to }, type: { $in: ['income', 'expense'] } } },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: {
            $cond: [{ $eq: ['$type', 'income'] }, { $toDouble: '$amount' }, 0],
          },
        },
        totalExpenses: {
          $sum: {
            $cond: [{ $eq: ['$type', 'expense'] }, { $abs: { $toDouble: '$amount' } }, 0],
          },
        },
        biggestExpense: {
          $max: {
            $cond: [{ $eq: ['$type', 'expense'] }, { $abs: { $toDouble: '$amount' } }, 0],
          },
        },
        transactionCount: { $sum: 1 },
      },
    },
  ])

  if (!result) {
    return { totalIncome: 0, totalExpenses: 0, balance: 0, biggestExpense: 0, transactionCount: 0 }
  }

  return {
    totalIncome: result.totalIncome,
    totalExpenses: result.totalExpenses,
    balance: result.totalIncome - result.totalExpenses,
    biggestExpense: result.biggestExpense,
    transactionCount: result.transactionCount,
  }
}

export async function getSpendByCategory(
  userId: string,
  from: Date,
  to: Date,
): Promise<CategorySpend[]> {
  await connectDB()
  const uid = new mongoose.Types.ObjectId(userId)

  return Transaction.aggregate([
    {
      $match: {
        user: uid,
        type: 'expense',
        date: { $gte: from, $lte: to },
      },
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: { $abs: { $toDouble: '$amount' } } },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'cat',
      },
    },
    { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
    { $sort: { total: -1 } },
    {
      $project: {
        _id: 0,
        categoryId: { $toString: '$_id' },
        name: { $ifNull: ['$cat.name', 'Uncategorized'] },
        color: { $ifNull: ['$cat.color', '#64748b'] },
        total: 1,
      },
    },
  ])
}

export async function getLatestTransactionMonth(userId: string): Promise<string | null> {
  await connectDB()
  const uid = new mongoose.Types.ObjectId(userId)
  const latest = await Transaction.findOne({ user: uid }).sort({ date: -1 }).select('date').lean()
  if (!latest) return null
  const d = new Date(latest.date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export async function getMonthlyTrends(
  userId: string,
  months = 6,
): Promise<MonthlyTrend[]> {
  await connectDB()
  const uid = new mongoose.Types.ObjectId(userId)
  const from = new Date()
  from.setMonth(from.getMonth() - months + 1)
  from.setDate(1)
  from.setHours(0, 0, 0, 0)

  const results = await Transaction.aggregate([
    {
      $match: {
        user: uid,
        type: { $in: ['income', 'expense'] },
        date: { $gte: from },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type',
        },
        total: { $sum: { $abs: { $toDouble: '$amount' } } },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ])

  const map = new Map<string, { income: number; expenses: number }>()
  for (const r of results) {
    const key = `${r._id.year}-${String(r._id.month).padStart(2, '0')}`
    const entry = map.get(key) ?? { income: 0, expenses: 0 }
    if (r._id.type === 'income') entry.income = r.total
    else entry.expenses = r.total
    map.set(key, entry)
  }

  return Array.from(map.entries()).map(([month, v]) => ({ month, ...v }))
}
