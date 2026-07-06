import { describe, it, expect } from 'vitest'
import { categoryForMcc } from './mcc-categories'

describe('categoryForMcc', () => {
  it('resolves explicit overrides', () => {
    expect(categoryForMcc('5411')).toBe('Groceries')
    expect(categoryForMcc('5812')).toBe('Restaurants & Cafés')
    expect(categoryForMcc('5912')).toBe('Healthcare')
    expect(categoryForMcc('7011')).toBe('Travel')
    expect(categoryForMcc('9311')).toBe('Bills & Utilities')
  })

  it('falls back to range defaults', () => {
    expect(categoryForMcc('3001')).toBe('Travel') // American Airlines
    expect(categoryForMcc('4900')).toBe('Bills & Utilities')
    expect(categoryForMcc('5732')).toBe('Shopping') // Electronics Sales
    expect(categoryForMcc('7801')).toBe('Entertainment & Gaming') // Casinos
  })

  it('handles zero-padded and numeric input', () => {
    expect(categoryForMcc('0742')).toBe('Other')
    expect(categoryForMcc(5411)).toBe('Groceries')
  })

  it('returns null for invalid or out-of-range codes', () => {
    expect(categoryForMcc('abcd')).toBeNull()
    expect(categoryForMcc('')).toBeNull()
    expect(categoryForMcc('99999')).toBeNull()
  })
})
