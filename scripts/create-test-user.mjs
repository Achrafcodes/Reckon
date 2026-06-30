/**
 * Creates a test account with an active subscription.
 * Run: node scripts/create-test-user.mjs
 */
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Manually parse .env.local (no dotenv dependency needed)
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const env = {}
try {
  for (const line of readFileSync(join(root, '.env.local'), 'utf8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '')
  }
} catch { /* no .env.local, rely on process.env */ }

const MONGO_URI = env.MONGODB_URI || process.env.MONGODB_URI
if (!MONGO_URI) { console.error('MONGODB_URI not found'); process.exit(1) }

// ── Test account credentials ──────────────────────────────────────────────────
const NAME     = 'Demo User'
const EMAIL    = 'demo@reckon.app'
const PASSWORD = 'Demo1234!'
// ─────────────────────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema({
  name:         String,
  email:        { type: String, unique: true },
  passwordHash: String,
  settings: {
    baseCurrency: { type: String, default: 'MAD' },
    theme:        { type: String, default: 'system' },
    locale:       { type: String, default: 'en' },
  },
  subscription: {
    status:      String,
    activatedAt: Date,
    expiresAt:   Date,
    plan:        String,
    paymentRef:  String,
  },
  refreshTokenHash: String,
  lastLoginAt:  Date,
}, { timestamps: true })

const User = mongoose.models?.User ?? mongoose.model('User', userSchema)

await mongoose.connect(MONGO_URI)

const activeSub = {
  status: 'active',
  activatedAt: new Date(),
  expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  plan: 'pro',
  paymentRef: 'test-account',
}

const existing = await User.findOne({ email: EMAIL })
if (existing) {
  await User.updateOne({ email: EMAIL }, { $set: { subscription: activeSub } })
  console.log(`✓ Updated existing account → subscription set to active`)
} else {
  const passwordHash = await bcrypt.hash(PASSWORD, 12)
  await User.create({ name: NAME, email: EMAIL, passwordHash, subscription: activeSub })
  console.log(`✓ Created test account`)
}

console.log(`\n  Email:    ${EMAIL}`)
console.log(`  Password: ${PASSWORD}`)
console.log(`  Sub:      active · pro · expires in 1 year\n`)

await mongoose.disconnect()
