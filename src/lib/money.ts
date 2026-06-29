import mongoose from 'mongoose'

/** Convert a string like "-45.50" to Decimal128 for storage. */
export function toDecimal128(value: string): mongoose.Types.Decimal128 {
  return mongoose.Types.Decimal128.fromString(value)
}

/** Convert a Decimal128 from the DB to a plain number for display. */
export function fromDecimal128(value: mongoose.Types.Decimal128 | undefined | null): number {
  if (value == null) return 0
  return parseFloat(value.toString())
}

/** Format a number as a currency string using Intl. */
export function formatCurrency(
  amount: number,
  currency = 'MAD',
  locale = 'en-MA',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
