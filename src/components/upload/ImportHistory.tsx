'use client'

import { useTransition, useState, useRef } from 'react'
import { revertImportBatchAction } from '@/server/actions/import'
import type { ImportBatchRow } from '@/server/services/importbatch.service'

function FileIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function DeleteModal({ fileName, onConfirm, onCancel, isPending }: {
  fileName: string
  onConfirm: () => void
  onCancel: () => void
  isPending: boolean
}) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const confirmed = value === 'DELETE'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal aria-labelledby="delete-title">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-paper border border-rule rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-5 animate-fade-up">
        {/* Icon */}
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 border border-danger/20">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} className="text-danger" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>

        <div className="space-y-1">
          <h2 id="delete-title" className="text-base font-semibold text-ink">Delete import</h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            This will permanently remove all transactions from <span className="font-medium text-ink">{fileName}</span>. This action cannot be undone.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-ink-muted" htmlFor="delete-confirm">
            Type <span className="font-mono font-semibold text-danger">DELETE</span> to confirm
          </label>
          <input
            ref={inputRef}
            id="delete-confirm"
            type="text"
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && confirmed && onConfirm()}
            placeholder="DELETE"
            className="w-full rounded-lg border border-rule bg-paper px-3 py-2 text-sm font-mono text-ink placeholder:text-ink-muted/40 outline-none focus:border-danger focus:ring-2 focus:ring-danger/20 transition-colors"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm text-ink-muted border border-rule rounded-lg hover:bg-mist hover:text-ink transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!confirmed || isPending}
            className="flex-1 px-4 py-2 text-sm font-medium bg-danger text-white rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

function BatchRow({ batch }: { batch: ImportBatchRow }) {
  const [isPending, startTransition] = useTransition()
  const [showModal, setShowModal] = useState(false)
  const isReverted = batch.status === 'reverted'

  function handleConfirm() {
    startTransition(async () => {
      await revertImportBatchAction(batch._id)
      setShowModal(false)
    })
  }

  return (
    <div className={`flex items-start sm:items-center gap-3 px-4 sm:px-5 py-3.5 transition-opacity ${isPending ? 'opacity-40' : ''} ${isReverted ? 'opacity-50' : ''}`}>
      {/* Icon */}
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isReverted ? 'bg-rule text-ink-muted' : 'bg-forest-subtle text-forest'}`}>
        <FileIcon />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink truncate">{batch.fileName}</p>
        <p className="text-xs text-ink-muted mt-0.5">
          {new Date(batch.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          {' · '}
          {isReverted ? (
            <span className="text-ink-muted italic">Deleted</span>
          ) : (
            <span>{batch.importedCount} imported{batch.skippedCount > 0 ? `, ${batch.skippedCount} skipped` : ''}</span>
          )}
        </p>
      </div>

      {/* Status badge + Delete — aligned right */}
      {!isReverted && (
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline text-xs font-medium text-forest bg-forest-subtle px-2 py-0.5 rounded-full">
            Active
          </span>
          <button
            onClick={() => setShowModal(true)}
            disabled={isPending}
            className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-danger transition-colors disabled:opacity-40 px-2 py-1 rounded hover:bg-red-50"
            aria-label={`Delete transactions from ${batch.fileName}`}
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      )}

      {showModal && (
        <DeleteModal
          fileName={batch.fileName}
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
          isPending={isPending}
        />
      )}
    </div>
  )
}

export function ImportHistory({ batches }: { batches: ImportBatchRow[] }) {
  const active = batches.filter((b) => b.status !== 'reverted')
  const reverted = batches.filter((b) => b.status === 'reverted')

  if (batches.length === 0) return null

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-rule">
        <h2 className="text-sm font-semibold text-ink">Import history</h2>
        <span className="text-xs text-ink-muted">{active.length} active file{active.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="divide-y divide-rule">
        {batches.map((batch) => (
          <BatchRow key={batch._id} batch={batch} />
        ))}
      </div>
      {reverted.length > 0 && (
        <p className="px-5 py-3 text-xs text-ink-muted border-t border-rule">
          {reverted.length} deleted file{reverted.length !== 1 ? 's' : ''} — transactions have been removed.
        </p>
      )}
    </div>
  )
}
