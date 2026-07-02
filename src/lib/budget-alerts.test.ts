import { describe, it, expect } from 'vitest'
import { shouldTriggerAlert } from './budget-alerts'

describe('shouldTriggerAlert', () => {
  // Regression: alertThreshold is a 0–1 fraction; it was previously divided by
  // 100 again, so alerts fired at 0.8% of the budget instead of 80%.
  it('does not alert at low spend when threshold is 0.8', () => {
    expect(shouldTriggerAlert(0.01, 0.8, 500)).toBe(false)
    expect(shouldTriggerAlert(0.5, 0.8, 500)).toBe(false)
    expect(shouldTriggerAlert(0.79, 0.8, 500)).toBe(false)
  })

  it('alerts at or above the threshold', () => {
    expect(shouldTriggerAlert(0.8, 0.8, 500)).toBe(true)
    expect(shouldTriggerAlert(1.2, 0.8, 500)).toBe(true)
  })

  it('caps the threshold at 100%', () => {
    // even with a bad threshold > 1, an exceeded budget must alert
    expect(shouldTriggerAlert(1.0, 5, 500)).toBe(true)
  })

  it('never alerts on a zero-limit budget', () => {
    expect(shouldTriggerAlert(0, 0.8, 0)).toBe(false)
  })
})
