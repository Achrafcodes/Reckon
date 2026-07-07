import { describe, it, expect } from 'vitest'
import { normalizeMerchantKey } from './merchant-key'

describe('normalizeMerchantKey', () => {
  it('strips asterisk-suffixed order refs', () => {
    expect(normalizeMerchantKey('AMZN Mktp CA*8C5R90B03')).toBe('amzn mktp ca')
    expect(normalizeMerchantKey('AMZN Mktp CA*QV8NT3VA3')).toBe('amzn mktp ca')
  })

  it('strips store numbers after #', () => {
    expect(normalizeMerchantKey('DOLLARAMA # 704')).toBe('dollarama')
  })

  it('strips long trailing numeric refs', () => {
    expect(normalizeMerchantKey('STEAMGAMES.COM 4259522985')).toBe('steamgames.com')
  })

  it('leaves plain merchant names untouched', () => {
    expect(normalizeMerchantKey('Netflix.com')).toBe('netflix.com')
    expect(normalizeMerchantKey('Ankama')).toBe('ankama')
  })

  it('produces the same key for repeated purchases from the same merchant', () => {
    const a = normalizeMerchantKey('AMZN Mktp CA*8C5R90B03')
    const b = normalizeMerchantKey('AMZN Mktp CA*116BS87A3')
    expect(a).toBe(b)
  })
})
