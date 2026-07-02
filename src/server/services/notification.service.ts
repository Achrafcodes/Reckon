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

export async function getRecentNotifications(userId: string): Promise<NotificationRow[]> {
  await connectDB()

  // Unread first, newest first — read ones fill the remainder so the panel
  // still shows recent history (dimmed) after "mark all read"
  const docs = await Notification.find({ user: userId })
    .select('kind title body isRead createdAt')
    .sort({ isRead: 1, createdAt: -1 })
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
