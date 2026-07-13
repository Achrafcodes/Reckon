import 'server-only'
import { connectDB } from '@/server/db/connect'
import { User, EarlyAccessSignup, Transaction } from '@/server/db/models'

export interface AdminStats {
  totalUsers: number
  activeUsers: number
  pendingUsers: number
  earlyAccessRequests: number
  totalTransactions: number
}

export interface AdminUserRow {
  _id: string
  name: string
  email: string
  subscriptionStatus: 'pending' | 'active' | 'cancelled'
  createdAt: string
  lastLoginAt?: string
}

export interface AdminSignupRow {
  _id: string
  email: string
  firstName?: string
  source: string
  createdAt: string
}

export async function getAdminStats(): Promise<AdminStats> {
  await connectDB()
  const [totalUsers, activeUsers, pendingUsers, earlyAccessRequests, totalTransactions] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ 'subscription.status': 'active' }),
    User.countDocuments({ 'subscription.status': 'pending' }),
    EarlyAccessSignup.countDocuments(),
    Transaction.countDocuments(),
  ])
  return { totalUsers, activeUsers, pendingUsers, earlyAccessRequests, totalTransactions }
}

export async function listUsersForAdmin(): Promise<AdminUserRow[]> {
  await connectDB()
  const docs = await User.find()
    .select('name email subscription createdAt lastLoginAt')
    .sort({ createdAt: -1 })
    .limit(200)
    .lean()
    .exec()

  return docs.map((d) => ({
    _id: String(d._id),
    name: d.name,
    email: d.email,
    subscriptionStatus: d.subscription?.status ?? 'pending',
    createdAt: (d.createdAt as Date).toISOString(),
    lastLoginAt: d.lastLoginAt ? (d.lastLoginAt as Date).toISOString() : undefined,
  }))
}

export async function listEarlyAccessRequests(): Promise<AdminSignupRow[]> {
  await connectDB()
  const docs = await EarlyAccessSignup.find()
    .sort({ createdAt: -1 })
    .limit(200)
    .lean()
    .exec()

  return docs.map((d) => ({
    _id: String(d._id),
    email: d.email,
    firstName: d.firstName,
    source: d.source,
    createdAt: (d.createdAt as Date).toISOString(),
  }))
}

export async function setUserSubscriptionStatus(
  userId: string,
  status: 'active' | 'pending' | 'cancelled',
): Promise<{ ok: true } | { ok: false; error: string }> {
  await connectDB()
  const update: Record<string, unknown> = { 'subscription.status': status }
  if (status === 'active') update['subscription.activatedAt'] = new Date()

  const result = await User.updateOne({ _id: userId }, { $set: update })
  if (result.matchedCount === 0) return { ok: false, error: 'User not found.' }
  return { ok: true }
}

export async function deleteEarlyAccessRequest(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await connectDB()
  const result = await EarlyAccessSignup.deleteOne({ _id: id })
  if (result.deletedCount === 0) return { ok: false, error: 'Request not found.' }
  return { ok: true }
}
