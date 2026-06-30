import 'server-only'
import { connectDB } from '@/server/db/connect'
import { Category } from '@/server/db/models'
import { env } from '@/lib/env'
import type mongoose from 'mongoose'
import type { Categorizer } from './index'

type CategoryEntry = {
  _id: mongoose.Types.ObjectId
  name: string
  keywords: string[]
}

type AnthropicResponse = {
  content: Array<{ type: string; text: string }>
}

type CategorizerResult = {
  categoryId: string | null
}

export class AiCategorizer implements Categorizer {
  private cache: CategoryEntry[] | null = null
  private lastUserId: string | null = null

  private async getCategories(userId: string): Promise<CategoryEntry[]> {
    if (this.cache && this.lastUserId === userId) {
      return this.cache
    }

    await connectDB()
    const categories = await Category.find({
      $or: [{ user: null, isSystem: true }, { user: userId }],
    })
      .select('name keywords')
      .lean()
      .exec() as CategoryEntry[]

    this.cache = categories
    this.lastUserId = userId
    return categories
  }

  async categorize(description: string, userId: string): Promise<mongoose.Types.ObjectId | null> {
    if (!env.ANTHROPIC_API_KEY) {
      return null
    }

    const categories = await this.getCategories(userId)
    if (categories.length === 0) {
      return null
    }

    const categorySummary = categories.map((c) => ({
      _id: c._id.toString(),
      name: c.name,
      keywords: c.keywords,
    }))

    let responseText: string
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 64,
          system:
            'You are a transaction categorizer. Given a transaction description and a list of categories, return only the category _id that best matches, or null if none fit. Respond with valid JSON: {"categoryId": "..."|null}',
          messages: [
            {
              role: 'user',
              content: `Description: ${description}\n\nCategories: ${JSON.stringify(categorySummary)}`,
            },
          ],
        }),
      })

      if (!response.ok) {
        return null
      }

      const data = (await response.json()) as AnthropicResponse
      const block = data.content.find((b) => b.type === 'text')
      if (!block) {
        return null
      }
      responseText = block.text
    } catch {
      return null
    }

    let parsed: CategorizerResult
    try {
      parsed = JSON.parse(responseText) as CategorizerResult
    } catch {
      return null
    }

    if (!parsed.categoryId) {
      return null
    }

    const matched = categories.find((c) => c._id.toString() === parsed.categoryId)
    if (!matched) {
      return null
    }

    return matched._id
  }

  invalidate() {
    this.cache = null
    this.lastUserId = null
  }
}
