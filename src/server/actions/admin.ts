'use server'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/server/auth/session'
import { isAdminEmail } from '@/lib/admin'
import { setUserSubscriptionStatus, deleteEarlyAccessRequest } from '@/server/services/admin.service'
import type { ActionResult } from '@/types'

async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || !isAdminEmail(user.email)) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function approveUserAction(userId: string): Promise<ActionResult> {
  await requireAdmin()
  const result = await setUserSubscriptionStatus(userId, 'active')
  if (!result.ok) return { ok: false, error: result.error }
  revalidatePath('/admin')
  return { ok: true, data: undefined }
}

export async function revokeUserAction(userId: string): Promise<ActionResult> {
  await requireAdmin()
  const result = await setUserSubscriptionStatus(userId, 'pending')
  if (!result.ok) return { ok: false, error: result.error }
  revalidatePath('/admin')
  return { ok: true, data: undefined }
}

export async function deleteEarlyAccessRequestAction(id: string): Promise<ActionResult> {
  await requireAdmin()
  const result = await deleteEarlyAccessRequest(id)
  if (!result.ok) return { ok: false, error: result.error }
  revalidatePath('/admin')
  return { ok: true, data: undefined }
}
