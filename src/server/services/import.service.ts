import 'server-only'
import mongoose from 'mongoose'
import { connectDB } from '@/server/db/connect'
import { Transaction, ImportBatch } from '@/server/db/models'
import { toDecimal128 } from '@/lib/money'
import { computeDedupeHash } from '@/lib/dedupe'
import { categorizer } from './categorization'

export interface ParsedRow {
  date: string       // YYYY-MM-DD
  description: string
  merchant: string
  amount: string     // signed decimal string
  currency: string
  type: 'income' | 'expense' | 'transfer'
  accountType?: 'debit' | 'credit'
}

export interface ImportResult {
  batchId: string
  imported: number
  skipped: number
  errors: string[]
}

export async function importTransactions(
  userId: string,
  fileName: string,
  rows: ParsedRow[],
): Promise<ImportResult> {
  await connectDB()
  const uid = new mongoose.Types.ObjectId(userId)

  const batch = await ImportBatch.create({
    user: uid,
    fileName,
    rowCount: rows.length,
    importedCount: 0,
    skippedCount: 0,
  })

  const errors: string[] = []
  const ops = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    try {
      const merchant = row.merchant || row.description
      const dedupeHash = computeDedupeHash({
        userId,
        date: row.date,
        amount: row.amount,
        merchant,
      })
      const categoryId = await categorizer.categorize(row.description, userId)

      ops.push({
        updateOne: {
          filter: { user: uid, dedupeHash },
          update: {
            $setOnInsert: {
              user: uid,
              date: new Date(row.date),
              description: row.description,
              merchant,
              amount: toDecimal128(row.amount),
              currency: row.currency,
              source: 'import' as const,
              importBatch: batch._id,
              dedupeHash,
            },
            // Always update type and category so re-uploading with the correct
            // account type (credit vs debit) fixes previously wrong values
            $set: {
              type: row.type,
              ...(categoryId ? { category: categoryId } : {}),
            },
          },
          upsert: true,
        },
      })
    } catch {
      errors.push(`Row ${i + 1}: invalid data`)
    }
  }

  let imported = 0
  let skipped = 0

  if (ops.length > 0) {
    const result = await Transaction.bulkWrite(ops, { ordered: false })
    imported = result.upsertedCount
    skipped = result.matchedCount
  }

  await ImportBatch.findByIdAndUpdate(batch._id, { importedCount: imported, skippedCount: skipped })

  return { batchId: String(batch._id), imported, skipped, errors }
}

export async function revertImportBatch(
  userId: string,
  batchId: string,
): Promise<{ ok: true; deleted: number } | { ok: false; error: string }> {
  await connectDB()
  const uid = new mongoose.Types.ObjectId(userId)

  const batch = await ImportBatch.findOne({ _id: batchId, user: uid })
  if (!batch) return { ok: false, error: 'Batch not found.' }
  if (batch.status === 'reverted') return { ok: false, error: 'Batch already reverted.' }

  const result = await Transaction.deleteMany({ importBatch: batch._id, user: uid })
  await ImportBatch.findByIdAndUpdate(batchId, { status: 'reverted' })

  return { ok: true, deleted: result.deletedCount }
}
