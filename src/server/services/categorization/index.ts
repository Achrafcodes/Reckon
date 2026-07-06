import 'server-only'
import { connectDB } from '@/server/db/connect'
import { Category } from '@/server/db/models'
import { env } from '@/lib/env'
import { categoryForMcc } from '@/lib/mcc-categories'
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

    const cats = this.cacheByUser.get(userId)!

    // 1. Merchant Category Code — authoritative when the source file provides one
    if (mcc) {
      const categoryName = categoryForMcc(mcc)
      if (categoryName) {
        const match = cats.find((c) => c.name === categoryName)
        if (match) return match._id
      }
    }

    const lower = description.toLowerCase().trim()

    // 2. Keyword match (substring scan — handles truncated bank descriptions)
    for (const cat of cats) {
      for (const kw of cat.keywords) {
        if (lower.includes(kw)) return cat._id
      }
    }

    // 3. Bank suffix codes — catch patterns like "MERCHANT NAME BPY" or "SEND E-TFR ***xxx"
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
    } else {
      this.cacheByUser.clear()
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
