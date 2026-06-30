'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getCurrentUser } from '@/server/auth/session'
import { connectDB } from '@/server/db/connect'
import { Category } from '@/server/db/models'
import { updateCategory, deleteCategory } from '@/server/services/category.service'
import type { ActionResult } from '@/types'

const categoryNameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(40, 'Name too long')
  .regex(/^[\p{L}0-9 &\-'.]+$/u, 'Name contains invalid characters')
  .transform((s) => s.trim())

const createCategorySchema = z.object({
  name: categoryNameSchema,
  type: z.enum(['income', 'expense', 'transfer']),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color')
    .default('#64748b'),
})

const updateCategorySchema = z.object({
  name: categoryNameSchema.optional(),
  type: z.enum(['income', 'expense', 'transfer']).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color').optional(),
})

export async function createCategoryAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }

  const parsed = createCategorySchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    color: formData.get('color') ?? '#64748b',
  })

  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message }
  }

  await connectDB()

  try {
    const doc = await Category.create({
      user: user._id,
      name: parsed.data.name,
      type: parsed.data.type,
      color: parsed.data.color,
      icon: 'tag',
      keywords: [],
      isSystem: false,
    })
    revalidatePath('/categories')
    revalidatePath('/budgets')
    revalidatePath('/analytics')
    return { ok: true as const, id: String(doc._id), name: parsed.data.name }
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      return { ok: false as const, error: 'A category with this name already exists.' }
    }
    throw err
  }
}

export async function updateCategoryAction(
  id: string,
  data: { name?: string; color?: string; type?: string },
): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Unauthorized' }

  const parsed = updateCategorySchema.safeParse(data)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message }
  }

  const result = await updateCategory(String(user._id), id, parsed.data)
  if (!result.ok) return { ok: false, error: result.error }

  revalidatePath('/categories')
  revalidatePath('/transactions')
  revalidatePath('/budgets')
  revalidatePath('/analytics')
  return { ok: true, data: undefined }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Unauthorized' }

  const result = await deleteCategory(String(user._id), id)
  if (!result.ok) return { ok: false, error: result.error }

  revalidatePath('/categories')
  revalidatePath('/transactions')
  revalidatePath('/budgets')
  revalidatePath('/analytics')
  return { ok: true, data: undefined }
}
