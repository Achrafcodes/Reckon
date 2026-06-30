import { Suspense } from 'react'
import { getCurrentUser } from '@/server/auth/session'
import { listTransactions } from '@/server/services/transaction.service'
import { listCategories } from '@/server/services/category.service'
import { listTransactionsSchema } from '@/schemas/transaction'
import { TransactionFilters } from '@/components/transactions/TransactionFilters'
import { TransactionPagination } from '@/components/transactions/TransactionPagination'

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
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-rule bg-mist/50 text-left">
                <th className="px-4 py-3 text-xs font-medium text-ink-muted uppercase tracking-wider w-28">Date</th>
                <th className="px-4 py-3 text-xs font-medium text-ink-muted uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-xs font-medium text-ink-muted uppercase tracking-wider w-36">Category</th>
                <th className="px-4 py-3 text-xs font-medium text-ink-muted uppercase tracking-wider text-right w-32">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {data.map((tx) => (
                <tr key={tx._id} className="hover:bg-mist/60 transition-colors group">
                  {/* Date */}
                  <td className="px-4 py-3 tabular-nums text-xs text-ink-muted whitespace-nowrap">
                    {new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>

                  {/* Description */}
                  <td className="px-4 py-3">
                    <span className="text-ink font-medium truncate max-w-xs block">{tx.description}</span>
                    {tx.merchant && tx.merchant !== tx.description && (
                      <span className="text-xs text-ink-muted">{tx.merchant}</span>
                    )}
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3">
                    {tx.category ? (
                      <span
                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap"
                        style={{ background: tx.category.color + '18', color: tx.category.color }}
                      >
                        {tx.category.name}
                      </span>
                    ) : (
                      <span className="text-xs text-ink-muted/60 italic">Uncategorized</span>
                    )}
                  </td>

                  {/* Amount */}
                  <td className="px-4 py-3 text-right">
                    <span className={`tabular-nums font-semibold text-sm ${tx.type === 'income' ? 'text-forest' : tx.type === 'expense' ? 'text-danger' : 'text-ink-muted'}`}>
                      {tx.type === 'income' ? '+' : tx.type === 'expense' ? '−' : ''}
                      {Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="ml-1 text-xs text-ink-muted">{tx.currency}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <Suspense>
            <TransactionPagination page={page} totalPages={totalPages} total={total} limit={input.limit} />
          </Suspense>
        </div>
      )}
    </div>
  )
}
