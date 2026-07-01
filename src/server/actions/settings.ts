'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { getCurrentUser } from '@/server/auth/session'
import { connectDB } from '@/server/db/connect'
import { User } from '@/server/db/models'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(60, 'Name too long').transform((s) => s.trim()),
  email: z.string().email('Invalid email').transform((s) => s.toLowerCase().trim()),
  baseCurrency: z.string().length(3).toUpperCase().regex(/^[A-Z]{3}$/, 'Invalid currency code'),
})

const passwordSchema = z
  .object({
    current: z.string().min(1, 'Current password is required'),
    next: z.string().min(8, 'New password must be at least 8 characters'),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, { message: "Passwords don't match", path: ['confirm'] })

export async function updateProfileAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }

  const parsed = profileSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    baseCurrency: formData.get('baseCurrency'),
  })
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0].message }

  await connectDB()

  // Check email uniqueness if changed
  if (parsed.data.email !== user.email) {
    const existing = await User.findOne({ email: parsed.data.email, _id: { $ne: user._id } }).lean()
    if (existing) return { ok: false as const, error: 'Email already in use.' }
  }

  await User.findByIdAndUpdate(user._id, {
    name: parsed.data.name,
    email: parsed.data.email,
    'settings.baseCurrency': parsed.data.baseCurrency,
  })

  // Revalidate whole app — baseCurrency is displayed on every page
  revalidatePath('/', 'layout')
  return { ok: true as const }
}

export async function updatePasswordAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }

  const parsed = passwordSchema.safeParse({
    current: formData.get('current'),
    next: formData.get('next'),
    confirm: formData.get('confirm'),
  })
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0].message }

  await connectDB()

  const userWithHash = await User.findById(user._id).select('+passwordHash').lean()
  if (!userWithHash) return { ok: false as const, error: 'User not found.' }

  const valid = await bcrypt.compare(parsed.data.current, userWithHash.passwordHash)
  if (!valid) return { ok: false as const, error: 'Current password is incorrect.' }

  const hash = await bcrypt.hash(parsed.data.next, 12)
  await User.findByIdAndUpdate(user._id, { passwordHash: hash })

  return { ok: true as const }
}

export async function deleteAccountAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { ok: false as const, error: 'Unauthorized' }

  const confirm = formData.get('confirm')
  if (confirm !== 'DELETE') return { ok: false as const, error: 'Type DELETE to confirm.' }

  await connectDB()

  const userWithHash = await User.findById(user._id).select('+passwordHash').lean()
  if (!userWithHash) return { ok: false as const, error: 'User not found.' }

  const password = formData.get('password') as string
  const valid = await bcrypt.compare(password, userWithHash.passwordHash)
  if (!valid) return { ok: false as const, error: 'Password incorrect.' }

  // Delete all user data
  const { Transaction } = await import('@/server/db/models')
  const { Category } = await import('@/server/db/models')
  const { Budget } = await import('@/server/db/models')
  const { ImportBatch } = await import('@/server/db/models')

  await Promise.all([
    Transaction.deleteMany({ user: user._id }),
    Category.deleteMany({ user: user._id, isSystem: false }),
    Budget.deleteMany({ user: user._id }),
    ImportBatch.deleteMany({ user: user._id }),
    User.findByIdAndDelete(user._id),
  ])

  return { ok: true as const }
}
