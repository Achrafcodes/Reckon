import { describe, it, expect } from 'vitest'
import { inferColumns, extractRows, normalizeDateCell, parseAmountLike } from './column-inference'

describe('normalizeDateCell', () => {
  it('handles ISO dates', () => {
    expect(normalizeDateCell('2026-06-01')).toBe('2026-06-01')
    expect(normalizeDateCell('2026/6/1')).toBe('2026-06-01')
  })

  it('assumes day-first for ambiguous slash dates', () => {
    expect(normalizeDateCell('01/06/2026')).toBe('2026-06-01')
  })

  it('detects month-first when day part exceeds 12', () => {
    expect(normalizeDateCell('06/15/2026')).toBe('2026-06-15')
  })

  it('expands 2-digit years', () => {
    expect(normalizeDateCell('01/06/26')).toBe('2026-06-01')
  })

  it('handles Date instances and month names', () => {
    expect(normalizeDateCell(new Date('2026-06-01T12:00:00Z'))).toBe('2026-06-01')
    expect(normalizeDateCell('Jun 1, 2026')).toBe('2026-06-01')
  })

  it('rejects junk', () => {
    expect(normalizeDateCell('hello')).toBeNull()
    expect(normalizeDateCell('99/99/2026')).toBeNull()
    expect(normalizeDateCell(42)).toBeNull()
  })
})

describe('parseAmountLike', () => {
  it('parses plain and formatted numbers', () => {
    expect(parseAmountLike(-45.5)).toBe(-45.5)
    expect(parseAmountLike('1,234.56')).toBe(1234.56)
    expect(parseAmountLike('-45.50')).toBe(-45.5)
    expect(parseAmountLike('$12.00')).toBe(12)
  })

  it('treats parentheses as negative', () => {
    expect(parseAmountLike('(45.00)')).toBe(-45)
  })

  it('rejects dates and text', () => {
    expect(parseAmountLike('01/06/2026')).toBeNull()
    expect(parseAmountLike('Coffee')).toBeNull()
    expect(parseAmountLike('')).toBeNull()
  })
})

describe('inferColumns', () => {
  it('infers a headerless date/description/amount layout', () => {
    const grid = [
      ['2026-06-01', 'TIM HORTONS #1234', '-4.50'],
      ['2026-06-02', 'PAYROLL DEPOSIT ACME INC', '2100.00'],
      ['2026-06-03', 'METRO GROCERY STORE', '-82.13'],
      ['2026-06-04', 'HYDRO QUEBEC PAYMENT', '-116.53'],
    ]
    const m = inferColumns(grid)
    expect(m).not.toBeNull()
    expect(m!.headerRows).toBe(0)
    expect(m!.dateCol).toBe(0)
    expect(m!.descriptionCol).toBe(1)
    expect(m!.amountCol).toBe(2)
  })

  it('skips an unrecognized (e.g. French) header row', () => {
    const grid = [
      ['Date de valeur', 'Libellé', 'Montant'],
      ['01/06/2026', 'CARREFOUR MARKET', '-45.20'],
      ['02/06/2026', 'VIREMENT SALAIRE', '1800.00'],
      ['03/06/2026', 'SNCF BILLET', '-67.00'],
    ]
    const m = inferColumns(grid)
    expect(m).not.toBeNull()
    expect(m!.headerRows).toBe(1)
    expect(m!.dateCol).toBe(0)
    expect(m!.amountCol).toBe(2)
  })

  it('detects a mutually-exclusive debit/credit pair', () => {
    const grid = [
      ['2026-06-01', 'GROCERY', '45.00', ''],
      ['2026-06-02', 'SALARY', '', '2100.00'],
      ['2026-06-03', 'FUEL', '60.00', ''],
      ['2026-06-04', 'REFUND', '', '25.00'],
    ]
    const m = inferColumns(grid)
    expect(m).not.toBeNull()
    expect(m!.debitCol).toBe(2)
    expect(m!.creditCol).toBe(3)
    expect(m!.amountCol).toBeNull()
  })

  it('detects a currency column', () => {
    const grid = [
      ['2026-06-01', 'COFFEE', '-4.50', 'CAD'],
      ['2026-06-02', 'BOOKS', '-30.00', 'CAD'],
      ['2026-06-03', 'SALARY', '2100.00', 'CAD'],
    ]
    const m = inferColumns(grid)
    expect(m).not.toBeNull()
    expect(m!.currencyCol).toBe(3)
    expect(m!.amountCol).toBe(2)
  })

  it('returns null when there is no date column', () => {
    const grid = [
      ['GROCERY', '-45.00'],
      ['SALARY', '2100.00'],
    ]
    expect(inferColumns(grid)).toBeNull()
  })

  it('returns null when there is no numeric column', () => {
    const grid = [
      ['2026-06-01', 'GROCERY'],
      ['2026-06-02', 'SALARY'],
    ]
    expect(inferColumns(grid)).toBeNull()
  })

  it('prefers the signed column over an always-positive balance column', () => {
    const grid = [
      ['2026-06-01', 'GROCERY', '-45.00', '1955.00'],
      ['2026-06-02', 'SALARY', '2100.00', '4055.00'],
      ['2026-06-03', 'FUEL', '-60.00', '3995.00'],
    ]
    const m = inferColumns(grid)
    expect(m).not.toBeNull()
    expect(m!.amountCol).toBe(2)
  })
})

describe('extractRows', () => {
  it('materializes rows through the mapping', () => {
    const grid = [
      ['Date', 'Details', 'Amount'],
      ['01/06/2026', 'COFFEE SHOP', '-4.50'],
      ['02/06/2026', 'PAY DEPOSIT', '2100.00'],
      ['junk', 'NO DATE ROW', '-1.00'],
    ]
    const m = inferColumns(grid)!
    const rows = extractRows(grid, m)
    expect(rows).toHaveLength(2)
    expect(rows[0]).toEqual({ date: '2026-06-01', description: 'COFFEE SHOP', amount: -4.5, currency: null })
    expect(rows[1].amount).toBe(2100)
  })

  it('computes signed amounts from a debit/credit pair', () => {
    const grid = [
      ['2026-06-01', 'GROCERY', '45.00', ''],
      ['2026-06-02', 'SALARY', '', '2100.00'],
      ['2026-06-03', 'FUEL', '60.00', ''],
      ['2026-06-04', 'REFUND', '', '25.00'],
    ]
    const m = inferColumns(grid)!
    const rows = extractRows(grid, m)
    expect(rows.map((r) => r.amount)).toEqual([-45, 2100, -60, 25])
  })
})
