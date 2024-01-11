import { Role } from '@prisma/client'
import { z } from 'zod'

export const UserCreateLinkRoleZod = z.object({
  emails: z
    .string()
    .email({ message: 'Invalid email' })
    .or(z.literal(''))
    .array(),
  role: z.nativeEnum(Role),
})

export type UserCreateLinkRole = z.infer<typeof UserCreateLinkRoleZod>
