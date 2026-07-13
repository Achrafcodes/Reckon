'use server'
import { earlyAccessSchema, type EarlyAccessInput } from '@/schemas/early-access'
import { connectDB } from '@/server/db/connect'
import { EarlyAccessSignup } from '@/server/db/models'
import { rateLimit } from '@/lib/rate-limit'
import type { ActionResult } from '@/types'

export async function joinEarlyAccessAction(input: EarlyAccessInput): Promise<ActionResult> {
  const parsed = earlyAccessSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const email = parsed.data.email.toLowerCase().trim()

  const limit = rateLimit(`early-access:${email}`, 3, 15 * 60 * 1000)
  if (!limit.ok) {
    return { ok: false, error: 'Too many attempts. Please wait a few minutes and try again.' }
  }

  await connectDB()

  try {
    await EarlyAccessSignup.create({
      email,
      firstName: parsed.data.firstName || undefined,
      source: parsed.data.source || 'unknown',
    })
  } catch (err: unknown) {
    // Duplicate email — already on the list, treat as success (idempotent signup)
    if ((err as { code?: number }).code === 11000) {
      return { ok: true, data: undefined }
    }
    return { ok: false, error: 'Something went wrong. Please try again.' }
  }

  return { ok: true, data: undefined }
}
