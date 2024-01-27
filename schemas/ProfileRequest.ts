import { z } from 'zod'
import { UserSignUpRequestZod } from './UserSignUpRequest'

export const ProfileRequestZod = UserSignUpRequestZod.omit({
  password: true,
})
  .merge(
    z.object({
      password: z.string().optional().or(z.literal('')),
      newPassword: UserSignUpRequestZod.shape.password
        .optional()
        .or(z.literal('')),
      newPasswordConfirmation: z.string().optional().or(z.literal('')),
    })
  )
  .superRefine((data, ctx) => {
    if (data.password && !data.newPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'You must provide a new password',
        path: ['newPassword'],
      })
      return
    }
    if (data.newPassword && !data.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'You must provide your current password',
        path: ['password'],
      })
      return
    }
    if (data.newPassword !== data.newPasswordConfirmation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'New password and confirmation do not match',
        path: ['newPasswordConfirmation'],
      })
    }
  })

export type ProfileRequest = z.infer<typeof ProfileRequestZod>
