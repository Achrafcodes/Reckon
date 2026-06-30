import 'server-only'
import { connectDB } from '@/server/db/connect'
import { Category } from '@/server/db/models'
import { env } from '@/lib/env'
import type mongoose from 'mongoose'

export interface Categorizer {
  categorize(description: string, userId: string): Promise<mongoose.Types.ObjectId | null>
}

export class KeywordCategorizer implements Categorizer {
  private cache: Array<{ _id: mongoose.Types.ObjectId; keywords: string[] }> | null = null

  async categorize(description: string, userId: string): Promise<mongoose.Types.ObjectId | null> {
    if (!this.cache) {
      await connectDB()
      this.cache = await Category.find({
        $or: [{ user: null, isSystem: true }, { user: userId }],
        keywords: { $exists: true, $not: { $size: 0 } },
      })
        .select('keywords')
        .lean()
        .exec() as Array<{ _id: mongoose.Types.ObjectId; keywords: string[] }>
    }

    const lower = description.toLowerCase()
    for (const cat of this.cache) {
      for (const kw of cat.keywords) {
        if (lower.includes(kw)) return cat._id
      }
    }
    return null
  }

  invalidate() {
    this.cache = null
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
