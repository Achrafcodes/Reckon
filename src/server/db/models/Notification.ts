import 'server-only'
import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose'

export interface INotification extends Document {
  user: Types.ObjectId
  kind: 'budget_alert' | 'insight' | 'system'
  title: string
  body?: string
  meta?: Record<string, unknown>
  isRead: boolean
  createdAt: Date
  updatedAt: Date
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    kind: { type: String, enum: ['budget_alert', 'insight', 'system'], required: true },
    title: { type: String, required: true },
    body: { type: String },
    meta: { type: Object },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
)

// Compound index covers the primary query pattern: unread notifications for a user, newest first
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 })

export const Notification: Model<INotification> =
  mongoose.models.Notification ??
  mongoose.model<INotification>('Notification', notificationSchema)
