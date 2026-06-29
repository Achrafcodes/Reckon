import { z } from 'zod'

export const createTransactionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  description: z.string().min(1).max(500),
  merchant: z.string().max(200).optional(),
  amount: z.string().regex(/^-?\d+(\.\d{1,2})?$/, 'Amount must be a valid decimal (e.g. -45.50)'),
  currency: z.string().length(3).default('MAD'),
  type: z.enum(['income', 'expense', 'transfer']),
  category: z.string().optional(),
  notes: z.string().max(1000).optional(),
})

export const updateTransactionSchema = createTransactionSchema.partial()

export const listTransactionsSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  type: z.enum(['income', 'expense', 'transfer']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  sort: z.enum(['date_desc', 'date_asc', 'amount_desc', 'amount_asc']).default('date_desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
export type ListTransactionsInput = z.infer<typeof listTransactionsSchema>
