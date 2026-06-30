import 'server-only'
import { connectDB } from '@/server/db/connect'
import { Category } from '@/server/db/models'

export interface CategorySummary {
  _id: string
  name: string
  color: string
  icon: string
  type: 'income' | 'expense' | 'transfer'
}

export async function listCategories(userId: string): Promise<CategorySummary[]> {
  await connectDB()
  const docs = await Category.find({
    $or: [{ user: null, isSystem: true }, { user: userId }],
  })
    .select('name color icon type')
    .sort({ name: 1 })
    .lean()
    .exec()

  return docs.map((d) => ({
    _id: String(d._id),
    name: d.name,
    color: d.color,
    icon: d.icon,
    type: d.type,
  }))
}
