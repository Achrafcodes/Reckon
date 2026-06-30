import 'server-only'
import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose'

export interface ITransaction extends Document {
  user: Types.ObjectId
  date: Date
  description: string
  merchant?: string
  amount: Types.Decimal128
  currency: string
  type: 'income' | 'expense' | 'transfer'
  category?: Types.ObjectId
  source: 'manual' | 'import'
  importBatch?: Types.ObjectId
  dedupeHash?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const transactionSchema = new Schema<ITransaction>(
  {
    // No index: true on user/date/category/dedupeHash — compound indexes below cover all query patterns
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    description: { type: String, required: true, trim: true },
    merchant: { type: String, trim: true },
    amount: { type: Schema.Types.Decimal128, required: true },
    currency: { type: String, default: 'MAD' },
    type: { type: String, enum: ['income', 'expense', 'transfer'], required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    source: { type: String, enum: ['manual', 'import'], default: 'manual' },
    importBatch: { type: Schema.Types.ObjectId, ref: 'ImportBatch' },
    dedupeHash: { type: String },
    notes: { type: String },
  },
  { timestamps: true },
)

// List + sort (primary query)
transactionSchema.index({ user: 1, date: -1 })
// Category filter
transactionSchema.index({ user: 1, category: 1 })
// Dedup upsert on import
transactionSchema.index({ user: 1, dedupeHash: 1 }, { unique: true, sparse: true })
// Analytics: getSummary / getSpendByCategory / getMonthlyTrends filter by user + type + date
transactionSchema.index({ user: 1, type: 1, date: -1 })
// Full-text search on description + merchant
transactionSchema.index({ description: 'text', merchant: 'text' })

export const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ?? mongoose.model<ITransaction>('Transaction', transactionSchema)
