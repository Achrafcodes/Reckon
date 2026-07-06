import 'server-only'
import mongoose from 'mongoose'
import { connectDB } from '@/server/db/connect'
import { Transaction } from '@/server/db/models'
import { toDecimal128, fromDecimal128 } from '@/lib/money'
import { computeDedupeHash } from '@/lib/dedupe'
import type { CreateTransactionInput, UpdateTransactionInput, ListTransactionsInput } from '@/schemas/transaction'

export interface TransactionRow {
  _id: string
  date: string
  description: string
  merchant?: string
  amount: number
  currency: string
  type: 'income' | 'expense' | 'transfer'
  category?: { _id: string; name: string; color: string; icon: string } | null
  source: 'manual' | 'import'
  notes?: string
  createdAt: string
}

export interface PaginatedTransactions {
  data: TransactionRow[]
  total: number
  page: number
  totalPages: number
}

export async function listTransactions(
  userId: string,
  input: ListTransactionsInput,
): Promise<PaginatedTransactions> {
  await connectDB()

  type Filter = {
    user: mongoose.Types.ObjectId
    type?: string
    category?: mongoose.Types.ObjectId
    date?: { $gte?: Date; $lte?: Date }
    $or?: { description?: unknown; merchant?: unknown }[]
  }
  const filter: Filter = {
    user: new mongoose.Types.ObjectId(userId),
  }

  if (input.type) filter.type = input.type
  if (input.category && mongoose.isValidObjectId(input.category)) {
    filter.category = new mongoose.Types.ObjectId(input.category)
  }
  if (input.from || input.to) {
    filter.date = {}
    if (input.from) filter.date.$gte = new Date(input.from)
    if (input.to) filter.date.$lte = new Date(input.to)
  }
  if (input.search) {
    // Escape regex metacharacters to prevent ReDoS / injection via $regex
    const safeSearch = input.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    filter.$or = [
      { description: { $regex: safeSearch, $options: 'i' } },
      { merchant: { $regex: safeSearch, $options: 'i' } },
    ]
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    date_desc: { date: -1 },
    date_asc: { date: 1 },
    amount_desc: { amount: -1 },
    amount_asc: { amount: 1 },
  }
  const sort = sortMap[input.sort] ?? { date: -1 }
  const skip = (input.page - 1) * input.limit

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = filter as any
  const [docs, total] = await Promise.all([
    Transaction.find(q)
      .sort(sort)
      .skip(skip)
      .limit(input.limit)
      .populate('category', 'name color icon')
      .lean()
      .exec(),
    Transaction.countDocuments(q),
  ])

  return {
    data: docs.map((d) => ({
      _id: String(d._id),
      date: (d.date as Date).toISOString().split('T')[0],
      description: d.description,
      merchant: d.merchant,
      amount: fromDecimal128(d.amount as mongoose.Types.Decimal128),
      currency: d.currency,
      type: d.type,
      category: d.category
        ? {
            _id: String((d.category as unknown as { _id: mongoose.Types.ObjectId })._id),
            name: (d.category as unknown as { name: string }).name,
            color: (d.category as unknown as { color: string }).color,
            icon: (d.category as unknown as { icon: string }).icon,
          }
        : null,
      source: d.source,
      notes: d.notes,
      createdAt: (d.createdAt as Date).toISOString(),
    })),
    total,
    page: input.page,
    totalPages: Math.ceil(total / input.limit),
  }
}

export async function createTransaction(
  userId: string,
  input: CreateTransactionInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await connectDB()

  const merchant = input.merchant ?? input.description
  const dedupeHash = computeDedupeHash({
    userId,
    date: input.date,
    amount: input.amount,
    merchant,
  })

  const doc = await Transaction.create({
    user: new mongoose.Types.ObjectId(userId),
    date: new Date(input.date),
    description: input.description,
    merchant,
    amount: toDecimal128(input.amount),
    currency: input.currency,
    type: input.type,
    category: input.category ? new mongoose.Types.ObjectId(input.category) : undefined,
    source: 'manual',
    notes: input.notes,
    dedupeHash,
  })

  return { ok: true, id: String(doc._id) }
}

export async function updateTransaction(
  userId: string,
  transactionId: string,
  input: UpdateTransactionInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await connectDB()

  const update: Record<string, unknown> = {}
  if (input.date) update.date = new Date(input.date)
  if (input.description) update.description = input.description
  if (input.merchant !== undefined) update.merchant = input.merchant
  if (input.amount) update.amount = toDecimal128(input.amount)
  if (input.currency) update.currency = input.currency
  if (input.type) update.type = input.type
  if (input.category !== undefined) {
    update.category = input.category ? new mongoose.Types.ObjectId(input.category) : null
  }
  if (input.notes !== undefined) update.notes = input.notes

  const result = await Transaction.updateOne(
    { _id: transactionId, user: new mongoose.Types.ObjectId(userId) },
    { $set: update },
  )

  if (result.matchedCount === 0) return { ok: false, error: 'Transaction not found.' }
  return { ok: true }
}

export async function deleteTransaction(
  userId: string,
  transactionId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await connectDB()

  const result = await Transaction.deleteOne({
    _id: transactionId,
    user: new mongoose.Types.ObjectId(userId),
  })

  if (result.deletedCount === 0) return { ok: false, error: 'Transaction not found.' }
  return { ok: true }
}
