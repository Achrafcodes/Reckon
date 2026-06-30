import 'server-only'

/**
 * Minimal in-memory fixed-window rate limiter.
 * Good enough for a single-instance dev/small deployment. Swap for
 * Upstash Redis (`@upstash/ratelimit`) before scaling to multiple instances —
 * this Map does not survive across serverless invocations or multiple pods.
 */
const buckets = new Map<string, { count: number; resetAt: number }>()

interface RateLimitResult {
  ok: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || now > bucket.resetAt) {
    const resetAt = now + windowMs
    buckets.set(key, { count: 1, resetAt })
    return { ok: true, remaining: limit - 1, resetAt }
  }

  if (bucket.count >= limit) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt }
  }

  bucket.count += 1
  return { ok: true, remaining: limit - bucket.count, resetAt: bucket.resetAt }
}

/** Periodically purge expired buckets so the Map doesn't grow unbounded. */
let cleanupTimer: ReturnType<typeof setInterval> | null = null
if (!cleanupTimer && typeof setInterval !== 'undefined') {
  cleanupTimer = setInterval(() => {
    const now = Date.now()
    for (const [key, bucket] of buckets) {
      if (now > bucket.resetAt) buckets.delete(key)
    }
  }, 60_000)
}
