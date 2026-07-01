import { getSession } from '@/server/auth/session'
import { listImportBatches } from '@/server/services/importbatch.service'
import { UploadZone } from '@/components/upload/UploadZone'
import { ImportHistory } from '@/components/upload/ImportHistory'

export const metadata = { title: 'Import — Reckon' }

export default async function UploadPage() {
  const session = await getSession()
  if (!session) return null

  const batches = await listImportBatches(session.userId)

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink tracking-tight">Import transactions</h1>
        <p className="mt-1 text-sm text-ink-muted">Upload a bank statement or expense spreadsheet (.xlsx, .xls, .csv).</p>
      </div>

      <UploadZone />

      <ImportHistory batches={batches} />
    </div>
  )
}
