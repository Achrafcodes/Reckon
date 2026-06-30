'use client'

import { useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type UploadState =
  | { status: 'idle' }
  | { status: 'dragging' }
  | { status: 'uploading'; fileName: string; progress: number }
  | { status: 'success'; imported: number; skipped: number; batchId: string }
  | { status: 'error'; message: string }

const ALLOWED_EXTENSIONS = ['.xlsx', '.xls', '.csv']
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
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const upload = useCallback(async (file: File) => {
    const err = validateFile(file)
    if (err) {
      setState({ status: 'error', message: err })
      return
    }

    setState({ status: 'uploading', fileName: file.name, progress: 0 })

    const formData = new FormData()
    formData.set('file', file)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const json = await res.json() as { ok: boolean; data?: { imported: number; skipped: number; batchId: string }; error?: string }

      if (!json.ok) {
        setState({ status: 'error', message: json.error ?? 'Upload failed.' })
        return
      }

      setState({
        status: 'success',
        imported: json.data!.imported,
        skipped: json.data!.skipped,
        batchId: json.data!.batchId,
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
    if (file) upload(file)
  }, [upload])

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setState((s) => s.status === 'uploading' ? s : { status: 'dragging' })
  }

  const onDragLeave = () => {
    setState((s) => s.status === 'dragging' ? { status: 'idle' } : s)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) upload(file)
    e.target.value = ''
  }

  const isDragging = state.status === 'dragging'
  const isUploading = state.status === 'uploading'

  return (
    <div className="space-y-4">
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
          accept=".xlsx,.xls,.csv"
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
        />
      )}

      {state.status === 'error' && (
        <ErrorBanner
          message={state.message}
          onReset={() => setState({ status: 'idle' })}
        />
      )}

      <p className="text-xs text-center" style={{ color: 'var(--color-sidebar-text-muted)' }}>
        Supports .xlsx, .xls, .csv up to 5 MB. Re-uploading the same statement skips duplicates.
      </p>
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
          Bank statement or expense spreadsheet
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

function SuccessBanner({ imported, skipped, onReset }: { imported: number; skipped: number; onReset: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-rule bg-forest-subtle px-4 py-4 animate-fade-up">
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="1.5 5 4 7.5 8.5 2.5" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink">
          Import complete
        </p>
        <p className="mt-0.5 text-xs" style={{ color: 'var(--color-sidebar-text-muted)' }}>
          {imported} transaction{imported !== 1 ? 's' : ''} imported
          {skipped > 0 ? `, ${skipped} duplicate${skipped !== 1 ? 's' : ''} skipped` : ''}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
          <a href="/transactions" className="text-xs font-medium text-forest hover:underline">
            View transactions →
          </a>
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

function ErrorBanner({ message, onReset }: { message: string; onReset: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-danger/20 bg-red-50 px-4 py-4 animate-fade-up">
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
  )
}
