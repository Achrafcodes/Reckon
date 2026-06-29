import { UploadZone } from '@/components/upload/UploadZone'

export const metadata = { title: 'Import — Reckon' }

export default function UploadPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Import transactions</h1>
        <p className="mt-1 text-sm text-ink-muted">Upload a bank statement or expense spreadsheet (.xlsx, .xls, .csv).</p>
      </div>
      <UploadZone />
    </div>
  )
}
