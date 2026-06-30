'use server'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/server/auth/session'
import { createTransactionSchema, updateTransactionSchema } from '@/schemas/transaction'
import { createTransaction, updateTransaction, deleteTransaction } from '@/server/services/transaction.service'
import type { CreateTransactionInput, UpdateTransactionInput } from '@/schemas/transaction'
import type { ActionResult } from '@/types'

export async function createTransactionAction(
  input: CreateTransactionInput,
): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Unauthorized' }

  const parsed = createTransactionSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Validation failed', fields: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const result = await createTransaction(String(user._id), parsed.data)
  if (!result.ok) return { ok: false, error: result.error }

  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  return { ok: true, data: { id: result.id } }
}

export async function updateTransactionAction(
  id: string,
  input: UpdateTransactionInput,
): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Unauthorized' }

  const parsed = updateTransactionSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Validation failed', fields: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const result = await updateTransaction(String(user._id), id, parsed.data)
  if (!result.ok) return { ok: false, error: result.error }

  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  return { ok: true, data: undefined }
}

export async function deleteTransactionAction(id: string): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Unauthorized' }

  const result = await deleteTransaction(String(user._id), id)
  if (!result.ok) return { ok: false, error: result.error }

  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  return { ok: true, data: undefined }
}
