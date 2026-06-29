import { z } from 'zod'

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  settings: z
    .object({
      baseCurrency: z.string().length(3).optional(),
      theme: z.enum(['light', 'dark', 'system']).optional(),
      locale: z.string().optional(),
    })
    .optional(),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(128),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
