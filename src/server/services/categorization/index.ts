import 'server-only'
import { connectDB } from '@/server/db/connect'
import { Category } from '@/server/db/models'
import { env } from '@/lib/env'
import type mongoose from 'mongoose'

export interface Categorizer {
  categorize(description: string, userId: string): Promise<mongoose.Types.ObjectId | null>
}

export class KeywordCategorizer implements Categorizer {
  // Keyed by userId — prevents user A's categories leaking into user B's import session
  private cacheByUser = new Map<string, Array<{ _id: mongoose.Types.ObjectId; keywords: string[] }>>()

  async categorize(description: string, userId: string): Promise<mongoose.Types.ObjectId | null> {
    if (!this.cacheByUser.has(userId)) {
      await connectDB()
      const docs = await Category.find({
        $or: [{ user: null, isSystem: true }, { user: userId }],
        keywords: { $exists: true, $not: { $size: 0 } },
      })
        .select('keywords')
        .lean()
        .exec() as Array<{ _id: mongoose.Types.ObjectId; keywords: string[] }>
      this.cacheByUser.set(userId, docs)
    }

    const cats = this.cacheByUser.get(userId)!
    const lower = description.toLowerCase()
    for (const cat of cats) {
      for (const kw of cat.keywords) {
        if (lower.includes(kw)) return cat._id
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
export const categorizer: Categorizer = new KeywordCategorizer()

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
