import { getCurrentUser } from '@/server/auth/session'
import { listTransactions } from '@/server/services/transaction.service'
import { listTransactionsSchema } from '@/schemas/transaction'

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
  const { data, total, page, totalPages } = await listTransactions(String(user._id), input)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Transactions</h1>
        <p className="mt-1 text-sm text-ink-muted">{total} transactions</p>
      </div>

      {data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-rule bg-paper py-20 text-center">
          <p className="text-sm text-ink-muted">No transactions yet. Import a file to get started.</p>
        </div>
      ) : (
        <div className="bg-paper border border-rule rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-rule text-left">
                <th className="px-4 py-3 text-xs font-medium text-ink-muted uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-xs font-medium text-ink-muted uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-xs font-medium text-ink-muted uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-xs font-medium text-ink-muted uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {data.map((tx) => (
                <tr key={tx._id} className="hover:bg-mist transition-colors">
                  <td className="px-4 py-3 text-ink-muted tabular-nums">{tx.date}</td>
                  <td className="px-4 py-3 text-ink">{tx.description}</td>
                  <td className="px-4 py-3">
                    {tx.category ? (
                      <span
                        className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: tx.category.color + '20', color: tx.category.color }}
                      >
                        {tx.category.name}
                      </span>
                    ) : (
                      <span className="text-ink-muted text-xs">—</span>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-right tabular-nums font-medium ${tx.type === 'income' ? 'text-forest' : 'text-danger'}`}>
                    {tx.type === 'income' ? '+' : ''}{tx.amount.toFixed(2)} {tx.currency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-rule flex items-center justify-between text-sm text-ink-muted">
              <span>Page {page} of {totalPages}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
