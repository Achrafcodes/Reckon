'use server'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/server/auth/session'
import { createBudgetSchema, updateBudgetSchema } from '@/schemas/budget'
import { createBudget, updateBudget, deleteBudget } from '@/server/services/budget.service'
import type { CreateBudgetInput, UpdateBudgetInput } from '@/schemas/budget'
import type { ActionResult } from '@/types'

export async function createBudgetAction(input: CreateBudgetInput): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Unauthorized' }

  const parsed = createBudgetSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Validation failed', fields: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const result = await createBudget(String(user._id), parsed.data)
  if (!result.ok) return { ok: false, error: result.error }

  revalidatePath('/budgets')
  revalidatePath('/')
  return { ok: true, data: { id: result.id } }
}

export async function updateBudgetAction(id: string, input: UpdateBudgetInput): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Unauthorized' }

  const parsed = updateBudgetSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Validation failed', fields: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const result = await updateBudget(String(user._id), id, parsed.data)
  if (!result.ok) return { ok: false, error: result.error }

  revalidatePath('/budgets')
  return { ok: true, data: undefined }
}

export async function deleteBudgetAction(id: string): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Unauthorized' }

  const result = await deleteBudget(String(user._id), id)
  if (!result.ok) return { ok: false, error: result.error }

  revalidatePath('/budgets')
  return { ok: true, data: undefined }
}
