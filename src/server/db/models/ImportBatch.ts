import 'server-only'
import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose'

export interface IImportBatch extends Document {
  user: Types.ObjectId
  fileName?: string
  rowCount?: number
  importedCount?: number
  skippedCount?: number
  status: 'completed' | 'reverted'
  createdAt: Date
  updatedAt: Date
}

const importBatchSchema = new Schema<IImportBatch>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileName: { type: String },
    rowCount: { type: Number },
    importedCount: { type: Number },
    skippedCount: { type: Number },
    status: { type: String, enum: ['completed', 'reverted'], default: 'completed' },
  },
  { timestamps: true },
)

export const ImportBatch: Model<IImportBatch> =
  mongoose.models.ImportBatch ??
  mongoose.model<IImportBatch>('ImportBatch', importBatchSchema)
