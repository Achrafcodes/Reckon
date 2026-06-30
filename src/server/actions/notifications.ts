'use server'
import { getCurrentUser } from '@/server/auth/session'
import { markNotificationRead, markAllRead } from '@/server/services/notification.service'
import type { ActionResult } from '@/types'

export async function markReadAction(id: string): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Unauthorized' }

  try {
    await markNotificationRead(String(user._id), id)
    return { ok: true, data: undefined }
  } catch {
    return { ok: false, error: 'Failed to mark notification as read' }
  }
}

export async function markAllReadAction(): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Unauthorized' }

  try {
    await markAllRead(String(user._id))
    return { ok: true, data: undefined }
  } catch {
    return { ok: false, error: 'Failed to mark all notifications as read' }
  }
}
