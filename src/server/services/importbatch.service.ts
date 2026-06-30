import 'server-only'
import mongoose from 'mongoose'
import { connectDB } from '@/server/db/connect'
import { ImportBatch } from '@/server/db/models'

export interface ImportBatchRow {
  _id: string
  fileName: string
  importedCount: number
  skippedCount: number
  rowCount: number
  status: 'completed' | 'reverted'
  createdAt: string
}

export async function listImportBatches(userId: string): Promise<ImportBatchRow[]> {
  await connectDB()
  const docs = await ImportBatch.find({ user: new mongoose.Types.ObjectId(userId) })
    .sort({ createdAt: -1 })
    .lean()
    .exec()

  return docs.map((d) => ({
    _id: String(d._id),
    fileName: d.fileName ?? 'Unknown file',
    importedCount: d.importedCount ?? 0,
    skippedCount: d.skippedCount ?? 0,
    rowCount: d.rowCount ?? 0,
    status: d.status,
    createdAt: (d.createdAt as Date).toISOString(),
  }))
}
