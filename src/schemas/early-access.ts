import { z } from 'zod'

export const earlyAccessSchema = z.object({
  email: z.string().email('Enter a valid email address').max(254),
  firstName: z.string().trim().max(100).optional().or(z.literal('')),
  source: z.string().max(50).optional(),
})

export type EarlyAccessInput = z.infer<typeof earlyAccessSchema>
