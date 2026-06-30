'use server'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { registerSchema, loginSchema, type RegisterInput, type LoginInput } from '@/schemas/auth'
import { connectDB } from '@/server/db/connect'
import { User } from '@/server/db/models'
import { signAccessToken, signRefreshToken, setAuthCookies, clearAuthCookies } from '@/server/auth/session'
import { rateLimit } from '@/lib/rate-limit'

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fields?: Record<string, string[]> }

export async function registerAction(
  input: RegisterInput,
): Promise<ActionResult<{ redirectTo: string }>> {
  const parsed = registerSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Validation failed', fields: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const { name, email, password } = parsed.data

  const limit = rateLimit(`register:${email.toLowerCase()}`, 5, 15 * 60 * 1000)
  if (!limit.ok) {
    return { ok: false, error: 'Too many attempts. Please wait a few minutes and try again.' }
  }

  await connectDB()

  const existing = await User.findOne({ email }).lean().exec()
  if (existing) {
    return { ok: false, error: 'An account with this email already exists.' }
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await User.create({ name, email, passwordHash })

  const userId = String(user._id)
  const subscriptionStatus = 'pending' as const
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken({ userId, email, subscriptionStatus }),
    signRefreshToken({ userId, email, subscriptionStatus }),
  ])

  await setAuthCookies(accessToken, refreshToken)

  return { ok: true, data: { redirectTo: '/subscribe' } }
}

export async function loginAction(
  input: LoginInput,
): Promise<ActionResult<{ redirectTo: string }>> {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Validation failed', fields: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const { email, password } = parsed.data

  // 8 attempts per 15 minutes per email — slows down credential-stuffing/brute-force
  const limit = rateLimit(`login:${email.toLowerCase()}`, 8, 15 * 60 * 1000)
  if (!limit.ok) {
    return { ok: false, error: 'Too many attempts. Please wait a few minutes and try again.' }
  }

  await connectDB()

  const user = await User.findOne({ email }).select('+passwordHash').lean().exec()
  if (!user) {
    return { ok: false, error: 'Invalid email or password.' }
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return { ok: false, error: 'Invalid email or password.' }
  }

  const userId = String(user._id)
  const subscriptionStatus = user.subscription?.status ?? 'pending'
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken({ userId, email, subscriptionStatus }),
    signRefreshToken({ userId, email, subscriptionStatus }),
  ])

  await setAuthCookies(accessToken, refreshToken)
  await User.findByIdAndUpdate(userId, { lastLoginAt: new Date() })

  const redirectTo = subscriptionStatus === 'active' ? '/dashboard' : '/subscribe'
  return { ok: true, data: { redirectTo } }
}

export async function logoutAction(): Promise<void> {
  await clearAuthCookies()
  revalidatePath('/', 'layout')
  redirect('/login')
}
