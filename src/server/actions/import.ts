'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/server/auth/session'
import { revertImportBatch } from '@/server/services/import.service'

export async function revertImportBatchAction(batchId: string) {
  const user = await getCurrentUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }

  const result = await revertImportBatch(String(user._id), batchId)
  revalidatePath('/upload')
  revalidatePath('/transactions')
  revalidatePath('/')
  return result
}
