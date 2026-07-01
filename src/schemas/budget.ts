import { z } from 'zod'

export const createBudgetSchema = z.object({
  category: z.string().min(1),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be YYYY-MM').optional(),
  recurring: z.preprocess((v) => v ?? 'false', z.enum(['true', 'false']).transform((v) => v === 'true')),
  limit: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Limit must be a positive decimal'),
  currency: z.string().length(3).default('CAD'),
  alertThreshold: z.number().min(0).max(1).default(0.8),
})

export const updateBudgetSchema = createBudgetSchema.partial().omit({ category: true, month: true, recurring: true })

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>
