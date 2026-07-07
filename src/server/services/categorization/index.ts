import 'server-only'
import { connectDB } from '@/server/db/connect'
import { Category, MerchantRule } from '@/server/db/models'
import { env } from '@/lib/env'
import { categoryForMcc } from '@/lib/mcc-categories'
import { normalizeMerchantKey } from '@/lib/merchant-key'
import type mongoose from 'mongoose'

export interface Categorizer {
  categorize(description: string, userId: string, mcc?: string): Promise<mongoose.Types.ObjectId | null>
}

// Bank statement suffix codes → category name hint
// Banks append these codes to merchant names (e.g. "BELL MOBILITY BPY", "MI-GSO PCUBED C PAY")
const BANK_SUFFIX_MAP: Record<string, string> = {
  'bpy': 'Bills & Utilities',   // Bill Payment
  'bpay': 'Bills & Utilities',  // Bill Payment (AU/NZ)
  'direct dep': 'Salary & Income', // Payroll direct deposit
  'e-tfr': 'Transfers',         // Electronic Transfer
  'e-transfer': 'Transfers',
  'msp': 'Government & Benefits', // Quebec govt payment code
  'stc': 'Government & Benefits', // Quebec govt payment code
}

export class KeywordCategorizer implements Categorizer {
  // Keyed by userId — prevents user A's categories leaking into user B's import session
  private cacheByUser = new Map<string, Array<{ _id: mongoose.Types.ObjectId; name: string; keywords: string[] }>>()
  // Learned merchant → category rules, keyed by userId (see MerchantRule model)
  private rulesByUser = new Map<string, Array<{ merchantKey: string; category: mongoose.Types.ObjectId }>>()

  async categorize(description: string, userId: string, mcc?: string): Promise<mongoose.Types.ObjectId | null> {
    if (!this.cacheByUser.has(userId)) {
      await connectDB()
      // No keyword filter here — categories like "Other" have none but are
      // still valid MCC-lookup targets below
      const docs = await Category.find({
        $or: [{ user: null, isSystem: true }, { user: userId }],
      })
        .select('name keywords')
        .lean()
        .exec() as Array<{ _id: mongoose.Types.ObjectId; name: string; keywords?: string[] }>
      this.cacheByUser.set(userId, docs.map((d) => ({ ...d, keywords: d.keywords ?? [] })))
    }

    if (!this.rulesByUser.has(userId)) {
      await connectDB()
      const rules = await MerchantRule.find({ user: userId })
        .select('merchantKey category')
        .lean()
        .exec() as Array<{ merchantKey: string; category: mongoose.Types.ObjectId }>
      this.rulesByUser.set(userId, rules)
    }

    const cats = this.cacheByUser.get(userId)!
    const rules = this.rulesByUser.get(userId)!

    // 1. Learned merchant rules — most authoritative: the user told us
    // explicitly by correcting this merchant's category before
    const merchantKey = normalizeMerchantKey(description)
    const rule = rules.find((r) => r.merchantKey === merchantKey)
    if (rule) return rule.category

    // 2. Merchant Category Code — authoritative when the source file provides one
    if (mcc) {
      const categoryName = categoryForMcc(mcc)
      if (categoryName) {
        const match = cats.find((c) => c.name === categoryName)
        if (match) return match._id
      }
    }

    const lower = description.toLowerCase().trim()

    // 3. Keyword match (substring scan — handles truncated bank descriptions).
    // Picks the LONGEST matching keyword across all categories, not the first
    // category in array order — otherwise a generic keyword (e.g. "uber" in
    // Transport) can shadow a more specific one (e.g. "uber holdings canada"
    // in Food Delivery, "uberone" in Subscriptions) purely by DB load order.
    let best: { id: mongoose.Types.ObjectId; kwLength: number } | null = null
    for (const cat of cats) {
      for (const kw of cat.keywords) {
        if (lower.includes(kw) && (!best || kw.length > best.kwLength)) {
          best = { id: cat._id, kwLength: kw.length }
        }
      }
    }
    if (best) return best.id

    // 4. Bank suffix codes — catch patterns like "MERCHANT NAME BPY" or "SEND E-TFR ***xxx"
    for (const [code, categoryName] of Object.entries(BANK_SUFFIX_MAP)) {
      if (lower.endsWith(code) || lower.includes(` ${code}`) || lower.includes(`/${code}`)) {
        const match = cats.find((c) => c.name === categoryName)
        if (match) return match._id
      }
    }

    return null
  }

  invalidate(userId?: string) {
    if (userId) {
      this.cacheByUser.delete(userId)
      this.rulesByUser.delete(userId)
    } else {
      this.cacheByUser.clear()
      this.rulesByUser.clear()
    }
  }
}

// Backwards-compatible singleton (KeywordCategorizer)
// Typed as the concrete class so callers can invalidate() the per-user cache
export const categorizer = new KeywordCategorizer()

/**
 * Factory that returns the best available categorizer at runtime.
 * - AiCategorizer when ANTHROPIC_API_KEY is set (falls through to keyword on AI failure)
 * - KeywordCategorizer otherwise
 *
 * Import lazily to avoid pulling the AI module into bundles that don't need it.
 */
export async function getCategorizer(): Promise<Categorizer> {
  if (env.ANTHROPIC_API_KEY) {
    const { AiCategorizer } = await import('./ai-categorizer')
    return new AiCategorizer()
  }
  return categorizer
}
