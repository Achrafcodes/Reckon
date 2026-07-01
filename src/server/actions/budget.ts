'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/server/auth/session'
import { createBudget, updateBudget, deleteBudget } from '@/server/services/budget.service'
import { createBudgetSchema, updateBudgetSchema } from '@/schemas/budget'

export async function createBudgetAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }

  const recurring = formData.get('recurring') === 'true'
  const raw = {
    category: formData.get('category'),
    month: recurring ? undefined : formData.get('month'),
    recurring: recurring ? 'true' : 'false',
    limit: formData.get('limit'),
    currency: formData.get('currency') ?? 'CAD',
    alertThreshold: Number(formData.get('alertThreshold') ?? 80) / 100,
  }

  const parsed = createBudgetSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message }
  }

  const result = await createBudget(String(user._id), parsed.data)
  revalidatePath('/budgets')
  return result
}

export async function updateBudgetAction(budgetId: string, formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }

  const raw = {
    limit: formData.get('limit'),
    currency: formData.get('currency') ?? 'MAD',
  }

  const parsed = updateBudgetSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message }
  }

  const result = await updateBudget(String(user._id), budgetId, parsed.data)
  revalidatePath('/budgets')
  return result
}

export async function deleteBudgetAction(budgetId: string) {
  const user = await getCurrentUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }

  const result = await deleteBudget(String(user._id), budgetId)
  revalidatePath('/budgets')
  return result
}
