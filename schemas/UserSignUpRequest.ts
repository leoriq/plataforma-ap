import { z } from 'zod'

export const UserSignUpRequestZod = z.object({
  fullName: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(3, { message: 'Full name must have at least 3 characters' })
    .max(100, { message: 'Full name must have at most 100 characters' })
    .regex(/^[^\s]+(\s+[^\s]+)+$/, {
      message: 'Full name must have at least 2 words',
    }),
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Invalid email' }),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, { message: 'Password must have at least 8 characters' })
    .max(72, { message: 'Password must have at most 72 characters' })
    .regex(/[a-z]/, {
      message: 'Password must have at least one lowercase character',
    })
    .regex(/[A-Z]/, {
      message: 'Password must have at least one uppercase character',
    })
    .regex(/[0-9]/, { message: 'Password must have at least one number' })
    .regex(/[^a-zA-Z0-9]/, {
      message: 'Password must have at least one special character',
    }),
  profilePictureFileId: z.string().optional(),
})

export type UserSignUpRequest = z.infer<typeof UserSignUpRequestZod>
