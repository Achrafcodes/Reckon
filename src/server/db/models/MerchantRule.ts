import 'server-only'
import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose'

/**
 * Per-user learned merchant → category mapping. Created/updated whenever a
 * user manually assigns a category to a transaction (see
 * transaction.service.ts#updateTransaction). Checked before keyword matching
 * so a correction sticks for that merchant going forward — no code or seed
 * changes required.
 */
export interface IMerchantRule extends Document {
  user: Types.ObjectId
  merchantKey: string
  category: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const merchantRuleSchema = new Schema<IMerchantRule>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    merchantKey: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  },
  { timestamps: true },
)

merchantRuleSchema.index({ user: 1, merchantKey: 1 }, { unique: true })

export const MerchantRule: Model<IMerchantRule> =
  mongoose.models.MerchantRule ?? mongoose.model<IMerchantRule>('MerchantRule', merchantRuleSchema)
