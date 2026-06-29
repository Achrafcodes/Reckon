import { createHash } from 'crypto'

/** Deterministic hash for import deduplication. */
export function computeDedupeHash(params: {
  userId: string
  date: string   // YYYY-MM-DD
  amount: string // e.g. "-45.50"
  merchant: string
}): string {
  const raw = [
    params.userId,
    params.date,
    params.amount,
    params.merchant.toLowerCase().trim(),
  ].join('|')
  return createHash('sha256').update(raw).digest('hex')
}
