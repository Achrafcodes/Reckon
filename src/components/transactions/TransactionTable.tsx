'use client'

import { useEffect, useState, useTransition } from 'react'
import { EditTransactionModal } from '@/components/transactions/EditTransactionModal'
import { CategoryPicker } from '@/components/transactions/CategoryPicker'
import { deleteTransactionAction } from '@/server/actions/transactions'
import { useSession } from '@/components/providers/SessionProvider'
import type { TransactionRow } from '@/server/services/transaction.service'
import type { CategorySummary } from '@/server/services/category.service'

interface TransactionTableProps {
  transactions: TransactionRow[]
  categories: CategorySummary[]
}

export function TransactionTable({ transactions, categories }: TransactionTableProps) {
  const { baseCurrency: currency } = useSession()
  const [editing, setEditing] = useState<TransactionRow | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [rows, setRows] = useState(transactions)
  const [isPending, startTransition] = useTransition()

  // Sync rows when the server pushes fresh props (e.g. after revalidation).
  // Render-time reset instead of an effect — avoids a wasted extra render pass.
  const [prevTransactions, setPrevTransactions] = useState(transactions)
  if (prevTransactions !== transactions) {
    setPrevTransactions(transactions)
    setRows(transactions)
  }

  // Dismiss armed state on outside click
  useEffect(() => {
    if (!confirmDelete) return
    function dismiss(e: MouseEvent) {
      const target = e.target as Element
      if (!target.closest('[data-delete-controls]')) setConfirmDelete(null)
    }
    document.addEventListener('mousedown', dismiss)
    return () => document.removeEventListener('mousedown', dismiss)
  }, [confirmDelete])

  function armDelete(id: string) {
    setConfirmDelete(id)
  }

  function handleDelete(id: string) {
    setDeletingId(id)
    startTransition(async () => {
      const result = await deleteTransactionAction(id)
      if (result.ok) {
        setRows((prev) => prev.filter((tx) => tx._id !== id))
      }
      setDeletingId(null)
      setConfirmDelete(null)
    })
  }

  function handleCategorySaved(id: string, category: TransactionRow['category']) {
    setRows((prev) => prev.map((tx) => (tx._id === id ? { ...tx, category } : tx)))
  }

  return (
    <>
      {/* Mobile card stack — shown only below md */}
      <div className="md:hidden divide-y divide-rule">
        {rows.map((tx) => (
          <div key={tx._id} className="flex items-start gap-3 px-4 py-3">
            <div
              className="mt-1 w-2 h-2 rounded-full shrink-0"
              style={{ background: tx.category?.color ?? '#d2e0d8' }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">{tx.description}</p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                <span className="text-xs text-ink-muted tabular-nums">
                  {new Date(tx.date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <CategoryPicker
                  transactionId={tx._id}
                  category={tx.category}
                  categories={categories}
                  onSaved={(cat) => handleCategorySaved(tx._id, cat)}
                />
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0" data-delete-controls>
              <span
                className={`tabular-nums font-semibold text-sm ${
                  tx.type === 'income'
                    ? 'text-forest'
                    : tx.type === 'expense'
                      ? 'text-danger'
                      : 'text-ink-muted'
                }`}
              >
                {tx.type === 'income' ? '+' : tx.type === 'expense' ? '−' : ''}
                {Math.abs(tx.amount).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <button
                type="button"
                onClick={() => setEditing(tx)}
                aria-label={`Edit transaction: ${tx.description}`}
                className="rounded-md p-1.5 text-ink-faint hover:text-ink hover:bg-surface-r transition-all focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:outline-none"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M11.333 2a1.886 1.886 0 0 1 2.667 2.667L5.333 13.333l-3.666.667.666-3.667L11.333 2Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {confirmDelete === tx._id ? (
                <button
                  type="button"
                  onClick={() => handleDelete(tx._id)}
                  disabled={deletingId === tx._id}
                  aria-label="Confirm delete"
                  className="rounded-md p-1.5 text-white bg-danger hover:bg-danger/90 transition-all focus-visible:ring-2 focus-visible:ring-danger-ring focus-visible:outline-none disabled:opacity-50"
                >
                  {deletingId === tx._id ? (
                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M2 4h12M5 4V2.5A.5.5 0 0 1 5.5 2h5a.5.5 0 0 1 .5.5V4M6 7v5M10 7v5M3 4l1 9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => armDelete(tx._id)}
                  aria-label={`Delete transaction: ${tx.description}`}
                  className="rounded-md p-1.5 text-ink-faint hover:text-danger hover:bg-danger-bg transition-all focus-visible:ring-2 focus-visible:ring-danger-ring focus-visible:outline-none"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M2 4h12M5 4V2.5A.5.5 0 0 1 5.5 2h5a.5.5 0 0 1 .5.5V4M6 7v5M10 7v5M3 4l1 9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table — hidden below md */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b border-rule bg-mist/50 text-left">
              <th className="px-4 py-3 text-xs font-medium text-ink-muted uppercase tracking-wider w-28">Date</th>
              <th className="px-4 py-3 text-xs font-medium text-ink-muted uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-xs font-medium text-ink-muted uppercase tracking-wider w-36">Category</th>
              <th className="px-4 py-3 text-xs font-medium text-ink-muted uppercase tracking-wider text-right w-32">Amount</th>
              <th className="w-20 px-2 py-3" aria-label="Actions" />
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {rows.map((tx) => (
              <tr key={tx._id} className="hover:bg-mist/60 transition-colors group">
                <td className="px-4 py-3 tabular-nums text-xs text-ink-muted whitespace-nowrap">
                  {new Date(tx.date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-4 py-3">
                  <span className="text-ink font-medium truncate max-w-xs block">{tx.description}</span>
                  {tx.merchant && tx.merchant !== tx.description && (
                    <span className="text-xs text-ink-muted">{tx.merchant}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <CategoryPicker
                    transactionId={tx._id}
                    category={tx.category}
                    categories={categories}
                    onSaved={(cat) => handleCategorySaved(tx._id, cat)}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`tabular-nums font-semibold text-sm ${
                      tx.type === 'income'
                        ? 'text-forest'
                        : tx.type === 'expense'
                          ? 'text-danger'
                          : 'text-ink-muted'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : tx.type === 'expense' ? '−' : ''}
                    {Math.abs(tx.amount).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <span className="ml-1 text-xs text-ink-muted">{currency}</span>
                </td>
                <td className="px-2 py-3">
                  <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity" data-delete-controls>
                    <button
                      type="button"
                      onClick={() => setEditing(tx)}
                      aria-label={`Edit transaction: ${tx.description}`}
                      className="rounded-md p-1.5 text-ink-faint hover:text-ink hover:bg-surface-r transition-all focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:outline-none"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M11.333 2a1.886 1.886 0 0 1 2.667 2.667L5.333 13.333l-3.666.667.666-3.667L11.333 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    {confirmDelete === tx._id ? (
                      <button
                        type="button"
                        onClick={() => handleDelete(tx._id)}
                        disabled={deletingId === tx._id}
                        aria-label="Confirm delete"
                        className="rounded-md p-1.5 text-white bg-danger hover:bg-danger/90 transition-all focus-visible:ring-2 focus-visible:ring-danger-ring focus-visible:outline-none disabled:opacity-50"
                      >
                        {deletingId === tx._id ? (
                          <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M2 4h12M5 4V2.5A.5.5 0 0 1 5.5 2h5a.5.5 0 0 1 .5.5V4M6 7v5M10 7v5M3 4l1 9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => armDelete(tx._id)}
                        aria-label={`Delete transaction: ${tx.description}`}
                        className="rounded-md p-1.5 text-ink-faint hover:text-danger hover:bg-danger-bg transition-all focus-visible:ring-2 focus-visible:ring-danger-ring focus-visible:outline-none"
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="M2 4h12M5 4V2.5A.5.5 0 0 1 5.5 2h5a.5.5 0 0 1 .5.5V4M6 7v5M10 7v5M3 4l1 9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing !== null && (
        <EditTransactionModal
          transaction={editing}
          categories={categories}
          open={true}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}
