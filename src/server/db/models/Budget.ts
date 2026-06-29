import 'server-only'
import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose'

export interface IBudget extends Document {
  user: Types.ObjectId
  category: Types.ObjectId
  month: string
  limit: Types.Decimal128
  currency: string
  alertThreshold: number
  createdAt: Date
  updatedAt: Date
}

const budgetSchema = new Schema<IBudget>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    month: { type: String, required: true },
    limit: { type: Schema.Types.Decimal128, required: true },
    currency: { type: String, default: 'MAD' },
    alertThreshold: { type: Number, default: 0.8 },
  },
  { timestamps: true },
)

budgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true })

export const Budget: Model<IBudget> =
  mongoose.models.Budget ?? mongoose.model<IBudget>('Budget', budgetSchema)
