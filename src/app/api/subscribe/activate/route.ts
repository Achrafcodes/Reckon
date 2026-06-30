/**
 * Subscription activation endpoint.
 *
 * Called by your payment provider's webhook after a successful payment.
 * Marks the user as subscribed and re-issues their JWT with subscriptionStatus='active'
 * so the middleware lets them through.
 *
 * Stripe example — set your webhook URL to:
 *   https://yourdomain.com/api/subscribe/activate
 * and listen for the `checkout.session.completed` event.
 *
 * The request must include the header:
 *   X-Webhook-Secret: <value of WEBHOOK_SECRET env var>
 */
import { type NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { z } from 'zod'
import { connectDB } from '@/server/db/connect'
import { User } from '@/server/db/models'
import { env } from '@/lib/env'

const activateBodySchema = z.object({
  email: z.string().email().optional(),
  userId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid userId').optional(),
  paymentRef: z.string().max(256).optional(),
  plan: z.enum(['pro_monthly', 'pro_annual']).default('pro_monthly'),
}).refine((d) => d.email || d.userId, { message: 'email or userId required' })

function timingSafeStringEqual(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a)
    const bufB = Buffer.from(b)
    if (bufA.length !== bufB.length) return false
    return timingSafeEqual(bufA, bufB)
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  // ── Authenticate the webhook call ───────────────────────────────────────
  const secret = req.headers.get('x-webhook-secret')
  if (!secret || !env.WEBHOOK_SECRET || !timingSafeStringEqual(secret, env.WEBHOOK_SECRET)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = activateBodySchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid request' }, { status: 400 })
  }

  const body = parsed.data

  await connectDB()

  const filter = body.userId ? { _id: body.userId } : { email: body.email }
  const now = new Date()
  const expiresAt = new Date(now)
  expiresAt.setMonth(expiresAt.getMonth() + 1)

  const updated = await User.findOneAndUpdate(
    filter,
    {
      $set: {
        'subscription.status': 'active',
        'subscription.activatedAt': now,
        'subscription.expiresAt': expiresAt,
        'subscription.plan': body.plan,
        'subscription.paymentRef': body.paymentRef ?? '',
      },
    },
    { new: true },
  )

  if (!updated) {
    return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({ ok: true, userId: String(updated._id) })
}
