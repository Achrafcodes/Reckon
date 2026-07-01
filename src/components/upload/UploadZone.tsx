'use client'

import { useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type AccountType = 'debit' | 'credit'

type UploadState =
  | { status: 'idle' }
  | { status: 'dragging' }
  | { status: 'uploading'; fileName: string; progress: number }
  | { status: 'success'; imported: number; skipped: number; batchId: string; format?: string; budgetsCreated?: number; budgetsUpdated?: number; month?: string }
  | { status: 'error'; message: string; hint?: string }

const ALLOWED_EXTENSIONS = ['.xlsx', '.xls', '.csv', '.pdf']
const MAX_SIZE_MB = 5

function validateFile(file: File): string | null {
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return `Unsupported file type. Please upload ${ALLOWED_EXTENSIONS.join(', ')}.`
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `File exceeds ${MAX_SIZE_MB} MB limit.`
  }
  return null
}

export function UploadZone() {
  const [state, setState] = useState<UploadState>({ status: 'idle' })
  const [accountType, setAccountType] = useState<AccountType>('debit')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const upload = useCallback(async (file: File, acctType: AccountType) => {
    const err = validateFile(file)
    if (err) {
      setState({ status: 'error', message: err })
      return
    }

    setState({ status: 'uploading', fileName: file.name, progress: 0 })

    const formData = new FormData()
    formData.set('file', file)
    formData.set('accountType', acctType)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const json = await res.json() as {
        ok: boolean
        data?: {
          imported: number
          skipped: number
          batchId: string
          format?: string
          budgetsCreated?: number
          budgetsUpdated?: number
          month?: string
        }
        error?: string
        hint?: string
      }

      if (!json.ok) {
        setState({ status: 'error', message: json.error ?? 'Upload failed.', hint: json.hint })
        return
      }

      setState({
        status: 'success',
        imported: json.data!.imported,
        skipped: json.data!.skipped,
        batchId: json.data!.batchId,
        format: json.data!.format,
        budgetsCreated: json.data!.budgetsCreated,
        budgetsUpdated: json.data!.budgetsUpdated,
        month: json.data!.month,
      })

      router.refresh()
    } catch {
      setState({ status: 'error', message: 'Network error. Please try again.' })
    }
  }, [router])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setState({ status: 'idle' })
    const file = e.dataTransfer.files[0]
    if (file) upload(file, accountType)
  }, [upload, accountType])

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setState((s) => s.status === 'uploading' ? s : { status: 'dragging' })
  }

  const onDragLeave = () => {
    setState((s) => s.status === 'dragging' ? { status: 'idle' } : s)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) upload(file, accountType)
    e.target.value = ''
  }

  const isDragging = state.status === 'dragging'
  const isUploading = state.status === 'uploading'

  return (
    <div className="space-y-4">
      {/* Account type selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-ink-muted shrink-0">Account type</span>
        <div className="flex rounded-lg border border-rule bg-paper p-0.5 gap-0.5">
          {(['debit', 'credit'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setAccountType(type)}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                accountType === type
                  ? 'bg-forest text-white shadow-sm'
                  : 'text-ink-muted hover:text-ink hover:bg-mist',
              ].join(' ')}
            >
              {type === 'debit' ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <path d="M2 10h20M6 15h2M12 15h6" strokeLinecap="round" />
                </svg>
              )}
              {type === 'debit' ? 'Debit / Bank' : 'Credit Card'}
            </button>
          ))}
        </div>
        <span className="text-xs text-ink-faint hidden sm:block">
          {accountType === 'credit' ? 'Purchases are debits, payments are credits' : 'Money in is credit, money out is debit'}
        </span>
      </div>

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload file — click or drag and drop"
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !isUploading && inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !isUploading && inputRef.current?.click()}
        className={[
          'relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed px-8 py-16 text-center transition-colors cursor-pointer select-none outline-none',
          isDragging
            ? 'border-forest bg-forest-subtle'
            : 'border-rule bg-paper hover:border-forest hover:bg-forest-subtle',
          isUploading ? 'pointer-events-none' : '',
          'focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv,.pdf"
          className="sr-only"
          onChange={onFileChange}
          aria-hidden
        />

        {isUploading ? (
          <UploadingState fileName={state.fileName} />
        ) : (
          <IdleState isDragging={isDragging} />
        )}
      </div>

      {/* Result states */}
      {state.status === 'success' && (
        <SuccessBanner
          imported={state.imported}
          skipped={state.skipped}
          onReset={() => setState({ status: 'idle' })}
          format={state.format}
          budgetsCreated={state.budgetsCreated}
          budgetsUpdated={state.budgetsUpdated}
          month={state.month}
        />
      )}

      {state.status === 'error' && (
        <ErrorBanner
          message={state.message}
          hint={state.hint}
          onReset={() => setState({ status: 'idle' })}
        />
      )}

      {/* Format guide */}
      <FormatGuide />
    </div>
  )
}

function IdleState({ isDragging }: { isDragging: boolean }) {
  return (
    <>
      <div className={[
        'flex h-14 w-14 items-center justify-center rounded-full transition-colors',
        isDragging ? 'bg-forest text-white' : 'bg-forest-subtle text-forest',
      ].join(' ')}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-ink">
          {isDragging ? 'Drop to import' : 'Drop your file here, or click to browse'}
        </p>
        <p className="mt-1 text-xs" style={{ color: 'var(--color-sidebar-text-muted)' }}>
          Bank statement, expense spreadsheet, or spending summary — CSV, Excel, or PDF
        </p>
      </div>
    </>
  )
}

function UploadingState({ fileName }: { fileName: string }) {
  return (
    <>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-forest-subtle">
        <svg className="animate-spin text-forest" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-ink">Importing {fileName}…</p>
        <p className="mt-1 text-xs" style={{ color: 'var(--color-sidebar-text-muted)' }}>
          Parsing and categorizing transactions
        </p>
      </div>
    </>
  )
}

function SuccessBanner({
  imported,
  skipped,
  onReset,
  format,
  budgetsCreated,
  budgetsUpdated,
  month,
}: {
  imported: number
  skipped: number
  onReset: () => void
  format?: string
  budgetsCreated?: number
  budgetsUpdated?: number
  month?: string
}) {
  const isBudgetSummary = format === 'budget_summary'
  const budgetCount = (budgetsCreated ?? 0) + (budgetsUpdated ?? 0)

  return (
    <div className="flex items-start gap-3 rounded-xl border border-rule bg-forest-subtle px-4 py-4 animate-fade-up">
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="1.5 5 4 7.5 8.5 2.5" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink">
          {isBudgetSummary ? 'Budget summary imported' : 'Import complete'}
        </p>
        {isBudgetSummary ? (
          <div className="mt-0.5 text-xs space-y-0.5" style={{ color: 'var(--color-sidebar-text-muted)' }}>
            {budgetCount > 0 && (
              <p>{budgetCount} budget{budgetCount !== 1 ? 's' : ''} {budgetsCreated ? 'created' : ''}{budgetsCreated && budgetsUpdated ? ' / ' : ''}{budgetsUpdated ? `${budgetsUpdated} updated` : ''}{month ? ` for ${month}` : ''}</p>
            )}
            {imported > 0 && (
              <p>{imported} weekly transaction{imported !== 1 ? 's' : ''} added</p>
            )}
            {skipped > 0 && (
              <p>{skipped} duplicate{skipped !== 1 ? 's' : ''} skipped</p>
            )}
          </div>
        ) : (
          <p className="mt-0.5 text-xs" style={{ color: 'var(--color-sidebar-text-muted)' }}>
            {imported} transaction{imported !== 1 ? 's' : ''} imported
            {skipped > 0 ? `, ${skipped} duplicate${skipped !== 1 ? 's' : ''} skipped` : ''}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
          {isBudgetSummary ? (
            <a href="/budgets" className="text-xs font-medium text-forest hover:underline">
              View budgets →
            </a>
          ) : (
            <a href="/transactions" className="text-xs font-medium text-forest hover:underline">
              View transactions →
            </a>
          )}
          <button
            onClick={onReset}
            className="text-xs text-ink-muted hover:text-ink transition-colors"
            aria-label="Import another file"
          >
            Import another
          </button>
        </div>
      </div>
    </div>
  )
}

function ErrorBanner({ message, hint, onReset }: { message: string; hint?: string; onReset: () => void }) {
  return (
    <div className="rounded-xl border border-danger/20 bg-danger-bg px-4 py-4 animate-fade-up space-y-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-danger">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="5" y1="2" x2="5" y2="5.5" />
            <line x1="5" y1="7.5" x2="5" y2="8" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink">Import failed</p>
          <p className="mt-0.5 text-xs text-danger/80">{message}</p>
        </div>
        <button
          onClick={onReset}
          className="shrink-0 text-xs font-medium text-ink-muted hover:text-ink transition-colors"
          aria-label="Try again"
        >
          Try again
        </button>
      </div>
      {hint === 'format_mismatch' && (
        <div className="border-t border-danger/10 pt-3 flex flex-col sm:flex-row sm:items-center gap-2">
          <p className="text-xs text-ink-muted flex-1">
            Need help? Download a sample file to see the expected column layout.
          </p>
          <a
            href="/api/upload/template"
            download="reckon-template.csv"
            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0-4-4m4 4 4-4M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2" />
            </svg>
            Download template
          </a>
        </div>
      )}
    </div>
  )
}

function FormatGuide() {
  return (
    <details className="group rounded-xl border border-border bg-surface-r">
      <summary className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer list-none text-xs font-medium text-ink-muted hover:text-ink transition-colors select-none">
        <span className="flex items-center gap-2">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" d="M12 8v4M12 16h.01" />
          </svg>
          Supported file formats
        </span>
        <svg
          width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          className="transition-transform group-open:rotate-180" aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-4 pb-4 space-y-4">

        {/* Format 1: Transaction list */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-ink">Transaction list (CSV / Excel / PDF)</p>
          <p className="text-xs text-ink-muted">One row per purchase — exported from your bank or app.</p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs min-w-[380px]">
              <thead>
                <tr className="bg-surface border-b border-border">
                  {['Date', 'Description', 'Amount', 'Currency'].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-semibold text-ink">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-ink-muted font-mono">
                <tr><td className="px-3 py-1.5">2024-06-01</td><td className="px-3 py-1.5">Salary</td><td className="px-3 py-1.5 text-accent">3000.00</td><td className="px-3 py-1.5">MAD</td></tr>
                <tr><td className="px-3 py-1.5">2024-06-03</td><td className="px-3 py-1.5">Supermarket</td><td className="px-3 py-1.5 text-danger">-145.00</td><td className="px-3 py-1.5">MAD</td></tr>
                <tr><td className="px-3 py-1.5">2024-06-05</td><td className="px-3 py-1.5">Fuel</td><td className="px-3 py-1.5 text-danger">-60.00</td><td className="px-3 py-1.5">MAD</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Format 2: Budget summary */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-ink">Budget summary (Excel / CSV)</p>
          <p className="text-xs text-ink-muted">Categories as columns, weeks as rows — sets budgets and imports weekly spend automatically.</p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs min-w-[420px]">
              <thead>
                <tr className="bg-surface border-b border-border">
                  {['', 'Food', 'Transport', 'Shopping', 'Rent'].map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left font-semibold text-ink">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-ink-muted font-mono">
                <tr className="bg-surface/50"><td className="px-3 py-1.5 font-medium text-ink">Budget Limit</td><td className="px-3 py-1.5">1500</td><td className="px-3 py-1.5">400</td><td className="px-3 py-1.5">600</td><td className="px-3 py-1.5">3000</td></tr>
                <tr><td className="px-3 py-1.5">Week 1</td><td className="px-3 py-1.5">320</td><td className="px-3 py-1.5">85</td><td className="px-3 py-1.5">145</td><td className="px-3 py-1.5">—</td></tr>
                <tr><td className="px-3 py-1.5">Week 2</td><td className="px-3 py-1.5">280</td><td className="px-3 py-1.5">90</td><td className="px-3 py-1.5">60</td><td className="px-3 py-1.5">3000</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
          <ul className="text-xs text-ink-muted space-y-1 flex-1">
            <li>• Also supports separate <strong className="text-ink font-medium">Debit</strong> / <strong className="text-ink font-medium">Credit</strong> columns</li>
            <li>• PDFs must be text-based (not scanned images)</li>
            <li>• Date format: YYYY-MM-DD or DD/MM/YYYY</li>
          </ul>
          <a
            href="/api/upload/template"
            download="reckon-template.csv"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-r transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0-4-4m4 4 4-4M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2" />
            </svg>
            Download sample CSV
          </a>
        </div>
      </div>
    </details>
  )
}
