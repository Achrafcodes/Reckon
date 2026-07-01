import { getSession } from '@/server/auth/session'
import { listCategories } from '@/server/services/category.service'
import { CategoryManager } from '@/components/categories/CategoryManager'

export const metadata = { title: 'Categories — Reckon' }

export default async function CategoriesPage() {
  const session = await getSession()
  if (!session) return null

  const categories = await listCategories(session.userId)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Categories</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Create and manage custom categories to organize your transactions.
        </p>
      </div>

      <CategoryManager initialCategories={categories} />
    </div>
  )
}
