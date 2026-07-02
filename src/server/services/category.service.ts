import 'server-only'
import mongoose from 'mongoose'
import { connectDB } from '@/server/db/connect'
import { Category } from '@/server/db/models'
import { categorizer } from './categorization'

export interface CategorySummary {
  _id: string
  name: string
  color: string
  icon: string
  type: 'income' | 'expense' | 'transfer'
  isSystem: boolean
}

export async function listCategories(userId: string): Promise<CategorySummary[]> {
  await connectDB()
  const docs = await Category.find({
    $or: [{ user: null, isSystem: true }, { user: userId }],
  })
    .select('name color icon type isSystem')
    .sort({ isSystem: -1, name: 1 })
    .lean()
    .exec()

  return docs.map((d) => ({
    _id: String(d._id),
    name: d.name,
    color: d.color,
    icon: d.icon,
    type: d.type,
    isSystem: d.isSystem,
  }))
}

export interface UpdateCategoryInput {
  name?: string
  color?: string
  type?: 'income' | 'expense' | 'transfer'
}

export async function updateCategory(
  userId: string,
  categoryId: string,
  data: UpdateCategoryInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await connectDB()

  const $set: Partial<Pick<UpdateCategoryInput, 'name' | 'color' | 'type'>> = {}
  if (data.name !== undefined) $set.name = data.name
  if (data.color !== undefined) $set.color = data.color
  if (data.type !== undefined) $set.type = data.type

  try {
    const result = await Category.updateOne(
      { _id: new mongoose.Types.ObjectId(categoryId), user: userId, isSystem: false },
      { $set },
    )
    if (result.matchedCount === 0) return { ok: false, error: 'Category not found or cannot be modified.' }
    categorizer.invalidate(userId)
    return { ok: true }
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      return { ok: false, error: 'A category with this name already exists.' }
    }
    return { ok: false, error: 'Failed to update category.' }
  }
}

export async function deleteCategory(
  userId: string,
  categoryId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await connectDB()
  const result = await Category.deleteOne({
    _id: new mongoose.Types.ObjectId(categoryId),
    user: userId,
    isSystem: false,
  }).exec()

  if (result.deletedCount === 0) {
    return { ok: false, error: 'Category not found or cannot be deleted.' }
  }
  categorizer.invalidate(userId)
  return { ok: true }
}
