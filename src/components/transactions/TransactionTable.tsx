'use client'

import { useState } from 'react'
import { EditTransactionModal } from '@/components/transactions/EditTransactionModal'
import type { TransactionRow } from '@/server/services/transaction.service'
import type { CategorySummary } from '@/server/services/category.service'

interface TransactionTableProps {
  transactions: TransactionRow[]
  categories: CategorySummary[]
}

export function TransactionTable({ transactions, categories }: TransactionTableProps) {
  const [editing, setEditing] = useState<TransactionRow | null>(null)

  return (
    <>
      {/* Mobile card stack — shown only below md */}
      <div className="md:hidden divide-y divide-rule">
        {transactions.map((tx) => (
          <div key={tx._id} className="flex items-start gap-3 px-4 py-3">
            {/* Color dot */}
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
                {tx.category && (
                  <span
                    className="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: tx.category.color + '18',
                      color: tx.category.color,
                    }}
                  >
                    {tx.category.name}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
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
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table — hidden below md */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b border-rule bg-mist/50 text-left">
              <th className="px-4 py-3 text-xs font-medium text-ink-muted uppercase tracking-wider w-28">
                Date
              </th>
              <th className="px-4 py-3 text-xs font-medium text-ink-muted uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 text-xs font-medium text-ink-muted uppercase tracking-wider w-36">
                Category
              </th>
              <th className="px-4 py-3 text-xs font-medium text-ink-muted uppercase tracking-wider text-right w-32">
                Amount
              </th>
              {/* Edit column — visually empty header */}
              <th className="w-10 px-2 py-3" aria-label="Actions" />
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {transactions.map((tx) => (
              <tr key={tx._id} className="hover:bg-mist/60 transition-colors group">
                {/* Date */}
                <td className="px-4 py-3 tabular-nums text-xs text-ink-muted whitespace-nowrap">
                  {new Date(tx.date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>

                {/* Description */}
                <td className="px-4 py-3">
                  <span className="text-ink font-medium truncate max-w-xs block">
                    {tx.description}
                  </span>
                  {tx.merchant && tx.merchant !== tx.description && (
                    <span className="text-xs text-ink-muted">{tx.merchant}</span>
                  )}
                </td>

                {/* Category */}
                <td className="px-4 py-3">
                  {tx.category ? (
                    <span
                      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap"
                      style={{
                        background: tx.category.color + '18',
                        color: tx.category.color,
                      }}
                    >
                      {tx.category.name}
                    </span>
                  ) : (
                    <span className="text-xs text-ink-muted/60 italic">Uncategorized</span>
                  )}
                </td>

                {/* Amount */}
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
                  <span className="ml-1 text-xs text-ink-muted">{tx.currency}</span>
                </td>

                {/* Edit button */}
                <td className="px-2 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => setEditing(tx)}
                    aria-label={`Edit transaction: ${tx.description}`}
                    className="rounded-md p-1.5 text-ink-faint opacity-0 group-hover:opacity-100 hover:text-ink hover:bg-surface-r transition-all focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-brand-ring focus-visible:outline-none"
                  >
                    {/* Pencil icon */}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M11.333 2a1.886 1.886 0 0 1 2.667 2.667L5.333 13.333l-3.666.667.666-3.667L11.333 2Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
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
