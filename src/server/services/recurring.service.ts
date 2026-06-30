import 'server-only'
import mongoose from 'mongoose'
import { connectDB } from '@/server/db/connect'
import { Transaction } from '@/server/db/models'

export interface RecurringTransaction {
  merchant: string
  amount: number
  currency: string
  frequency: 'monthly' | 'weekly' | 'irregular'
  lastDate: string // ISO date string
  occurrences: number
  categoryColor?: string
  categoryName?: string
}

export async function detectRecurring(
  userId: string,
  lookbackMonths = 6,
): Promise<RecurringTransaction[]> {
  await connectDB()
  const uid = new mongoose.Types.ObjectId(userId)

  const from = new Date()
  from.setMonth(from.getMonth() - lookbackMonths)
  from.setDate(1)
  from.setHours(0, 0, 0, 0)

  // Aggregate: group by normalized merchant, collect dates and amounts
  const results = await Transaction.aggregate([
    {
      $match: {
        user: uid,
        type: 'expense',
        date: { $gte: from },
        // Only consider transactions that have a merchant or description
      },
    },
    {
      $addFields: {
        // Normalize: use merchant if set, otherwise fall back to description
        normalizedMerchant: {
          $toLower: {
            $trim: {
              input: {
                $ifNull: ['$merchant', '$description'],
              },
            },
          },
        },
      },
    },
    {
      $group: {
        _id: '$normalizedMerchant',
        occurrences: { $sum: 1 },
        dates: { $push: '$date' },
        // Average amount (use absolute value since expenses may be negative)
        avgAmount: { $avg: { $abs: { $toDouble: '$amount' } } },
        lastDate: { $max: '$date' },
        currency: { $last: '$currency' },
        category: { $last: '$category' },
      },
    },
    // Only keep merchants that appear at least twice
    { $match: { occurrences: { $gte: 2 } } },
    // Lookup category for color/name
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'cat',
      },
    },
    { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
    // Sort by average amount descending, limit to 10
    { $sort: { avgAmount: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        merchant: '$_id',
        amount: { $round: ['$avgAmount', 2] },
        currency: 1,
        occurrences: 1,
        lastDate: 1,
        dates: 1,
        categoryColor: { $ifNull: ['$cat.color', null] },
        categoryName: { $ifNull: ['$cat.name', null] },
      },
    },
  ])

  return results.map((r) => {
    const frequency = estimateFrequency(r.dates as Date[])
    return {
      merchant: r.merchant as string,
      amount: r.amount as number,
      currency: r.currency as string,
      frequency,
      lastDate: (r.lastDate as Date).toISOString(),
      occurrences: r.occurrences as number,
      categoryColor: r.categoryColor as string | undefined,
      categoryName: r.categoryName as string | undefined,
    }
  })
}

function estimateFrequency(dates: Date[]): 'monthly' | 'weekly' | 'irregular' {
  if (dates.length < 2) return 'irregular'

  // Sort dates ascending
  const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime())

  // Compute average interval in days between consecutive occurrences
  let totalInterval = 0
  for (let i = 1; i < sorted.length; i++) {
    const diffMs = sorted[i].getTime() - sorted[i - 1].getTime()
    totalInterval += diffMs / (1000 * 60 * 60 * 24)
  }
  const avgInterval = totalInterval / (sorted.length - 1)

  if (avgInterval >= 25 && avgInterval <= 35) return 'monthly'
  if (avgInterval >= 5 && avgInterval <= 9) return 'weekly'
  return 'irregular'
}
