import 'server-only'
import mongoose from 'mongoose'
import { connectDB } from '@/server/db/connect'
import { Budget, Category, Transaction, ImportBatch } from '@/server/db/models'
import { toDecimal128 } from '@/lib/money'
import { computeDedupeHash } from '@/lib/dedupe'

// ── Types ────────────────────────────────────────────────────────────────────

export interface BudgetImportResult {
  batchId: string
  budgetsCreated: number
  budgetsUpdated: number
  transactionsImported: number
  skipped: number
  month: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function normKey(k: string): string {
  return k.toLowerCase().replace(/[^a-z ]/g, '').trim()
}

const CATEGORY_ALIASES: Record<string, string[]> = {
  'food': ['food', 'groceries', 'grocery', 'supermarket', 'restaurant', 'dining', 'alimentation', 'repas'],
  'transportation': ['transport', 'transportation', 'fuel', 'gas', 'car', 'taxi', 'uber', 'carburant'],
  'leisure': ['leisure', 'loisir', 'entertainment', 'fun', 'hobby', 'sport', 'recreation', 'cinema'],
  'shopping': ['shopping', 'clothes', 'clothing', 'fashion', 'achat', 'courses'],
  'housing': ['rent', 'loyer', 'bills', 'utilities', 'electricity', 'water', 'internet', 'facture', 'charges'],
  'health': ['health', 'sante', 'medical', 'pharmacy', 'doctor', 'pharmacie'],
  'education': ['education', 'school', 'university', 'course', 'formation'],
  'savings': ['saving', 'savings', 'epargne', 'saved'],
}

async function findCategoryId(
  userId: string,
  columnName: string,
): Promise<mongoose.Types.ObjectId | null> {
  const uid = new mongoose.Types.ObjectId(userId)
  const norm = normKey(columnName)

  // Direct name match (user or system category)
  const direct = await Category.findOne({
    $or: [{ user: uid }, { user: null, isSystem: true }],
    name: { $regex: new RegExp(norm.split(' ')[0], 'i') },
  }).lean()
  if (direct) return direct._id as mongoose.Types.ObjectId

  // Alias match
  for (const [catName, aliases] of Object.entries(CATEGORY_ALIASES)) {
    if (aliases.some((a) => norm.includes(a) || a.includes(norm.replace(/ .*/,'')))) {
      const cat = await Category.findOne({
        $or: [{ user: uid }, { user: null, isSystem: true }],
        name: { $regex: new RegExp(catName, 'i') },
      }).lean()
      if (cat) return cat._id as mongoose.Types.ObjectId

      // Create a user category if system one doesn't exist
      const created = await Category.create({
        user: uid,
        name: columnName.trim(),
        type: 'expense',
        color: '#64748b',
        icon: 'tag',
        keywords: [norm],
        isSystem: false,
      })
      return created._id as mongoose.Types.ObjectId
    }
  }

  // Create unmapped category
  try {
    const created = await Category.create({
      user: uid,
      name: columnName.trim(),
      type: 'expense',
      color: '#64748b',
      icon: 'tag',
      keywords: [norm],
      isSystem: false,
    })
    return created._id as mongoose.Types.ObjectId
  } catch {
    // Might already exist (race or duplicate key)
    const existing = await Category.findOne({ user: uid, name: columnName.trim() }).lean()
    return existing ? (existing._id as mongoose.Types.ObjectId) : null
  }
}

function weekStartDate(month: string, weekNum: number): string {
  // month = "YYYY-MM", weekNum = 1..5
  const [year, m] = month.split('-').map(Number)
  const firstDay = new Date(year, m - 1, 1)
  // Week 1 starts on day 1, week 2 on day 8, etc.
  const day = 1 + (weekNum - 1) * 7
  const date = new Date(year, m - 1, Math.min(day, new Date(year, m, 0).getDate()))
  return date.toISOString().split('T')[0]
}

// ── Format detection ─────────────────────────────────────────────────────────

export interface BudgetSummaryData {
  month: string
  categoryColumns: string[]      // column names (excluding the label column)
  budgetLimitRow: Record<string, number> | null
  weekRows: Array<{ weekNum: number; values: Record<string, number> }>
}

const LABEL_COL_PATTERNS = [
  /budget/i, /limit/i, /semaine/i, /week/i, /month/i, /total/i, /mois/i,
]

function looksLikeLabelValue(v: string): boolean {
  return LABEL_COL_PATTERNS.some((p) => p.test(v))
}

/**
 * Detect budget summary format.
 * Expects: first column = row labels, other columns = category names.
 * Returns parsed data or null if not a budget summary.
 */
export function detectBudgetSummary(
  rawRows: Record<string, unknown>[],
): BudgetSummaryData | null {
  if (rawRows.length < 2) return null

  const firstRow = rawRows[0]
  const keys = Object.keys(firstRow)
  if (keys.length < 2) return null

  // The first column should contain row label text
  const firstColKey = keys[0]
  const firstColValues = rawRows.map((r) => String(r[firstColKey] ?? '').trim())

  // At least one label row should look like "Week N", "Budget Limit", etc.
  const hasWeekRow = firstColValues.some((v) => /week\s*\d+/i.test(v) || /semaine\s*\d+/i.test(v))
  const hasBudgetRow = firstColValues.some((v) => /budget|limit/i.test(v))
  const hasTotalRow = firstColValues.some((v) => /total|mois|month/i.test(v))

  if (!hasWeekRow && !hasBudgetRow && !hasTotalRow) return null

  // The other columns should be category-like names (not date-like)
  const categoryColumns = keys.slice(1).filter((k) => {
    const norm = normKey(k)
    // Skip totals/saved columns
    return !['total spent', 'total saved', 'total', 'saved', 'balance'].includes(norm)
  })

  if (categoryColumns.length === 0) return null

  // Infer month from file context — default to current month
  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  let budgetLimitRow: Record<string, number> | null = null
  const weekRows: Array<{ weekNum: number; values: Record<string, number> }> = []

  for (const row of rawRows) {
    const label = String(row[firstColKey] ?? '').trim()
    if (!label) continue

    // Skip total/month rows
    if (/total|mois month/i.test(label)) continue

    const isBudget = /budget|limit/i.test(label)
    const weekMatch = label.match(/(?:week|semaine)\s*(\d+)/i)

    if (isBudget) {
      budgetLimitRow = {}
      for (const col of categoryColumns) {
        const v = Number(String(row[col] ?? '').replace(/[^0-9.]/g, ''))
        if (!isNaN(v) && v > 0) budgetLimitRow[col] = v
      }
    } else if (weekMatch) {
      const weekNum = parseInt(weekMatch[1])
      const values: Record<string, number> = {}
      for (const col of categoryColumns) {
        const v = Number(String(row[col] ?? '').replace(/[^0-9.]/g, ''))
        if (!isNaN(v) && v > 0) values[col] = v
      }
      if (Object.keys(values).length > 0) {
        weekRows.push({ weekNum, values })
      }
    }
  }

  if (!budgetLimitRow && weekRows.length === 0) return null

  return { month, categoryColumns, budgetLimitRow, weekRows }
}

// ── Main import function ─────────────────────────────────────────────────────

export async function importBudgetSummary(
  userId: string,
  fileName: string,
  data: BudgetSummaryData,
): Promise<BudgetImportResult> {
  await connectDB()
  const uid = new mongoose.Types.ObjectId(userId)

  const batch = await ImportBatch.create({
    user: uid,
    fileName,
    rowCount: data.weekRows.reduce((s, w) => s + Object.keys(w.values).length, 0),
    importedCount: 0,
    skippedCount: 0,
  })

  // Resolve category IDs once
  const categoryIdMap = new Map<string, mongoose.Types.ObjectId | null>()
  for (const col of data.categoryColumns) {
    categoryIdMap.set(col, await findCategoryId(userId, col))
  }

  let budgetsCreated = 0
  let budgetsUpdated = 0
  let transactionsImported = 0
  let skipped = 0

  // ── Create/update budgets from the limit row ──
  if (data.budgetLimitRow) {
    for (const [col, limitAmount] of Object.entries(data.budgetLimitRow)) {
      const catId = categoryIdMap.get(col)
      if (!catId) continue

      const existing = await Budget.findOne({ user: uid, category: catId, month: data.month })
      if (existing) {
        await Budget.updateOne(
          { _id: existing._id },
          { $set: { limit: toDecimal128(limitAmount.toFixed(2)) } },
        )
        budgetsUpdated++
      } else {
        await Budget.create({
          user: uid,
          category: catId,
          month: data.month,
          limit: toDecimal128(limitAmount.toFixed(2)),
          currency: 'MAD',
          alertThreshold: 0.8,
        })
        budgetsCreated++
      }
    }
  }

  // ── Create aggregate transactions from week rows ──
  const txOps = []
  for (const week of data.weekRows) {
    const date = weekStartDate(data.month, week.weekNum)
    for (const [col, amount] of Object.entries(week.values)) {
      const catId = categoryIdMap.get(col)
      const description = `${col.trim()} – Week ${week.weekNum}`
      const negAmount = (-amount).toFixed(2)
      const merchant = col.trim()
      const dedupeHash = computeDedupeHash({
        userId,
        date,
        amount: negAmount,
        merchant,
      })

      const txType: 'expense' = 'expense'
      txOps.push({
        updateOne: {
          filter: { user: uid, dedupeHash },
          update: {
            $setOnInsert: {
              user: uid,
              date: new Date(date),
              description,
              merchant,
              amount: toDecimal128((-amount).toFixed(2)),
              currency: 'MAD',
              type: txType,
              source: 'import' as const,
              category: catId ?? undefined,
              importBatch: batch._id,
              dedupeHash,
            },
          },
          upsert: true,
        },
      })
    }
  }

  if (txOps.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bulkResult = await Transaction.bulkWrite(txOps as any[])
    transactionsImported = bulkResult.upsertedCount
    skipped = txOps.length - transactionsImported
  }

  await ImportBatch.updateOne(
    { _id: batch._id },
    {
      $set: {
        importedCount: transactionsImported,
        skippedCount: skipped,
      },
    },
  )

  return {
    batchId: String(batch._id),
    budgetsCreated,
    budgetsUpdated,
    transactionsImported,
    skipped,
    month: data.month,
  }
}
