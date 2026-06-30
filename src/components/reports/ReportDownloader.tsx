'use client'

import { useState } from 'react'
import type { CategorySpend } from '@/server/services/analytics.service'

interface Props {
  topCategories: CategorySpend[]
}

const PRESETS = [
  { label: 'All time', from: '', to: '' },
  { label: 'This year', from: `${new Date().getFullYear()}-01-01`, to: `${new Date().getFullYear()}-12-31` },
  { label: 'Last 6 months', from: (() => { const d = new Date(); d.setMonth(d.getMonth() - 6); return d.toISOString().slice(0, 10) })(), to: new Date().toISOString().slice(0, 10) },
  { label: 'Last 3 months', from: (() => { const d = new Date(); d.setMonth(d.getMonth() - 3); return d.toISOString().slice(0, 10) })(), to: new Date().toISOString().slice(0, 10) },
  { label: 'Custom', from: null, to: null },
]

function ExcelIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    </svg>
  )
}

function PdfIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6M9 17h4" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

export function ReportDownloader({ topCategories }: Props) {
  const [preset, setPreset] = useState(0)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [loadingXlsx, setLoadingXlsx] = useState(false)
  const [loadingPdf, setLoadingPdf] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selected = PRESETS[preset]
  const from = selected.from !== null ? selected.from : customFrom
  const to = selected.to !== null ? selected.to : customTo

  function validate() {
    if (preset === 4 && (!customFrom || !customTo)) {
      setError('Please select both a start and end date.')
      return false
    }
    if (preset === 4 && customFrom > customTo) {
      setError('Start date must be before end date.')
      return false
    }
    return true
  }

  async function download(endpoint: string, filename: string, setLoading: (v: boolean) => void) {
    setError(null)
    if (!validate()) return

    setLoading(true)
    try {
      const params = new URLSearchParams({ currency: 'MAD' })
      if (from) params.set('from', from)
      if (to) params.set('to', to)

      const res = await fetch(`${endpoint}?${params}`)
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error((json as { error?: string }).error ?? 'Download failed')
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed')
    } finally {
      setLoading(false)
    }
  }

  const dateStr = new Date().toISOString().slice(0, 10)

  return (
    <div className="card p-6 space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-ink">Export report</h2>
        <p className="text-xs text-ink-muted mt-0.5">Choose a period and download as PDF or Excel</p>
      </div>

      {/* Period presets */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-ink-muted">Period</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setPreset(i)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                preset === i
                  ? 'bg-brand text-white border-brand'
                  : 'bg-surface text-ink-muted border-border hover:border-brand hover:text-ink'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom date inputs */}
      {preset === 4 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-up">
          <div className="space-y-1">
            <label className="text-xs text-ink-muted" htmlFor="report-from">From</label>
            <input
              id="report-from"
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="input-base"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-ink-muted" htmlFor="report-to">To</label>
            <input
              id="report-to"
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="input-base"
            />
          </div>
        </div>
      )}

      {/* Top categories preview */}
      {topCategories.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-ink-muted">Top spending categories</p>
          <div className="space-y-1.5">
            {topCategories.map((cat) => (
              <div key={cat.categoryId} className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
                <span className="text-xs text-ink flex-1 truncate">{cat.name}</span>
                <span className="text-xs font-medium text-ink tabular-nums">
                  {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(cat.total)} MAD
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-danger">{error}</p>}

      {/* Download buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          onClick={() => download('/api/reports/pdf', `reckon-report-${dateStr}.pdf`, setLoadingPdf)}
          disabled={loadingPdf || loadingXlsx}
          className="flex items-center justify-center gap-2 bg-ink text-surface text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-ink/90 disabled:opacity-60 transition-colors"
        >
          {loadingPdf ? <Spinner /> : <PdfIcon />}
          Download PDF
        </button>
        <button
          type="button"
          onClick={() => download('/api/reports', `reckon-report-${dateStr}.xlsx`, setLoadingXlsx)}
          disabled={loadingPdf || loadingXlsx}
          className="flex items-center justify-center gap-2 bg-accent text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-accent-h disabled:opacity-60 transition-colors"
        >
          {loadingXlsx ? <Spinner /> : <ExcelIcon />}
          Download Excel
        </button>
      </div>
    </div>
  )
}
