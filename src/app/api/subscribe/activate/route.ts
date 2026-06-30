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
import { connectDB } from '@/server/db/connect'
import { User } from '@/server/db/models'
import { env } from '@/lib/env'

export async function POST(req: NextRequest) {
  // ── Authenticate the webhook call ───────────────────────────────────────
  const secret = req.headers.get('x-webhook-secret')
  if (!secret || !env.WEBHOOK_SECRET || secret !== env.WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: { email?: string; userId?: string; paymentRef?: string; plan?: string }
  try {
    body = await req.json() as typeof body
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.email && !body.userId) {
    return NextResponse.json({ ok: false, error: 'email or userId required' }, { status: 400 })
  }

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
        'subscription.plan': body.plan ?? 'pro_monthly',
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
