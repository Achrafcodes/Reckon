import 'server-only'
import { connectDB } from '@/server/db/connect'
import { Notification } from '@/server/db/models/Notification'

export interface NotificationRow {
  _id: string
  kind: 'budget_alert' | 'insight' | 'system'
  title: string
  body?: string
  isRead: boolean
  createdAt: string
}

export async function getUnreadNotifications(userId: string): Promise<NotificationRow[]> {
  await connectDB()

  const docs = await Notification.find({ user: userId, isRead: false })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean()

  return docs.map((doc) => ({
    _id: String(doc._id),
    kind: doc.kind,
    title: doc.title,
    body: doc.body,
    isRead: doc.isRead,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
  }))
}

export async function markNotificationRead(userId: string, notificationId: string): Promise<void> {
  await connectDB()
  await Notification.updateOne({ _id: notificationId, user: userId }, { isRead: true })
}

export async function markAllRead(userId: string): Promise<void> {
  await connectDB()
  await Notification.updateMany({ user: userId, isRead: false }, { isRead: true })
}

export async function createNotification(
  userId: string,
  data: {
    kind: 'budget_alert' | 'insight' | 'system'
    title: string
    body?: string
    meta?: Record<string, unknown>
  },
): Promise<void> {
  await connectDB()
  await Notification.create({ user: userId, ...data })
}
