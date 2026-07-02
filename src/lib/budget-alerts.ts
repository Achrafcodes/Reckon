/**
 * Whether a budget's spending should trigger an alert notification.
 * `alertThreshold` is a 0–1 fraction (0.8 = warn at 80% of the limit).
 */
export function shouldTriggerAlert(pct: number, alertThreshold: number, limit: number): boolean {
  return limit > 0 && pct >= Math.min(alertThreshold, 1.0)
}
