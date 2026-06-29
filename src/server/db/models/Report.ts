import 'server-only'
import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose'

export interface IReport extends Document {
  user: Types.ObjectId
  type: 'pdf' | 'excel'
  range: { from: Date; to: Date }
  filters?: Record<string, unknown>
  status: 'ready' | 'generating' | 'failed'
  fileUrl?: string
  createdAt: Date
  updatedAt: Date
}

const reportSchema = new Schema<IReport>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['pdf', 'excel'], required: true },
    range: { from: Date, to: Date },
    filters: { type: Object },
    status: { type: String, enum: ['ready', 'generating', 'failed'], default: 'ready' },
    fileUrl: { type: String },
  },
  { timestamps: true },
)

export const Report: Model<IReport> =
  mongoose.models.Report ?? mongoose.model<IReport>('Report', reportSchema)
