/**
 * Normalizes a raw transaction description down to a stable "merchant key" —
 * strips per-transaction noise (order refs, store numbers, terminal ids) so
 * the same merchant across many transactions produces the same key.
 *
 * Used by the merchant-rule learning system: when a user manually assigns a
 * category to a transaction, we remember merchantKey → category for that
 * user, so future imports of the same merchant categorize automatically
 * without any code or seed-data change.
 */
export function normalizeMerchantKey(raw: string): string {
  let s = raw.toLowerCase().trim()

  s = s.split('*')[0] // "AMZN Mktp CA*8C5R90B03" -> "amzn mktp ca"
  s = s.split('#')[0] // "DOLLARAMA # 704" -> "dollarama "
  s = s.replace(/\s+\d{4,}.*$/, '') // trailing long numeric refs: "STEAMGAMES.COM 4259522985" -> "steamgames.com"
  s = s.replace(/\s{2,}/g, ' ').trim()

  return s
}
