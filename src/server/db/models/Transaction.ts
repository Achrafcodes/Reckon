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
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    description: { type: String, required: true, trim: true },
    merchant: { type: String, trim: true },
    amount: { type: Schema.Types.Decimal128, required: true },
    currency: { type: String, default: 'MAD' },
    type: { type: String, enum: ['income', 'expense', 'transfer'], required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', index: true },
    source: { type: String, enum: ['manual', 'import'], default: 'manual' },
    importBatch: { type: Schema.Types.ObjectId, ref: 'ImportBatch' },
    dedupeHash: { type: String, index: true },
    notes: { type: String },
  },
  { timestamps: true },
)

transactionSchema.index({ user: 1, date: -1 })
transactionSchema.index({ user: 1, category: 1 })
transactionSchema.index({ user: 1, dedupeHash: 1 }, { unique: true, sparse: true })

export const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ?? mongoose.model<ITransaction>('Transaction', transactionSchema)
