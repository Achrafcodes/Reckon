import 'server-only'
import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose'

export interface ICategory extends Document {
  user: Types.ObjectId | null
  name: string
  type: 'income' | 'expense' | 'transfer'
  color: string
  icon: string
  keywords: string[]
  isSystem: boolean
  createdAt: Date
  updatedAt: Date
}

const categorySchema = new Schema<ICategory>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true, default: null },
    name: { type: String, required: true },
    type: { type: String, enum: ['income', 'expense', 'transfer'], required: true },
    color: { type: String, default: '#64748b' },
    icon: { type: String, default: 'tag' },
    keywords: [{ type: String, lowercase: true }],
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true },
)

categorySchema.index({ user: 1, name: 1 }, { unique: true })

export const Category: Model<ICategory> =
  mongoose.models.Category ?? mongoose.model<ICategory>('Category', categorySchema)
