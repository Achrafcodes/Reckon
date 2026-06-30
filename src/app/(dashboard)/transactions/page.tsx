import { Suspense } from 'react'
import { getCurrentUser } from '@/server/auth/session'
import { listTransactions } from '@/server/services/transaction.service'
import { listCategories } from '@/server/services/category.service'
import { listTransactionsSchema } from '@/schemas/transaction'
import { TransactionFilters } from '@/components/transactions/TransactionFilters'
import { TransactionPagination } from '@/components/transactions/TransactionPagination'
import { TransactionTable } from '@/components/transactions/TransactionTable'

export const metadata = { title: 'Transactions — Reckon' }

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const user = await getCurrentUser()
  if (!user) return null

  const sp = await searchParams
  const input = listTransactionsSchema.parse(sp)

  const [{ data, total, page, totalPages }, categories] = await Promise.all([
    listTransactions(String(user._id), input),
    listCategories(String(user._id)),
  ])

  const hasFilters = !!(input.search || input.type || input.category)

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Transactions</h1>
        <p className="mt-1 text-sm text-ink-muted">Browse, search and filter your spending history.</p>
      </div>

      {/* Filters — client island */}
      <Suspense>
        <TransactionFilters categories={categories} total={total} />
      </Suspense>

      {/* Table */}
      {data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-rule bg-paper py-20 text-center">
          {hasFilters ? (
            <>
              <p className="text-sm font-medium text-ink">No results</p>
              <p className="mt-1 text-xs text-ink-muted">Try adjusting your filters or search term.</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-ink">No transactions yet</p>
              <p className="mt-1 text-xs text-ink-muted">
                <a href="/upload" className="text-forest hover:underline">Import a file</a> to get started.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Table rows — client island for edit interaction */}
          <TransactionTable transactions={data} categories={categories} />

          {/* Pagination */}
          <Suspense>
            <TransactionPagination page={page} totalPages={totalPages} total={total} limit={input.limit} />
          </Suspense>
        </div>
      )}
    </div>
  )
}
