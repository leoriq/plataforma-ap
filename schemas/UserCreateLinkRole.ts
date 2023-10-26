import { Role } from '@prisma/client'
import { z } from 'zod'

export const UserCreateLinkRoleZod = z.object({
  emails: z
    .string()
    .email({ message: 'Invalid email' })
    .array()
    .nonempty({ message: 'Emails cannot be empty' }),
  role: z.nativeEnum(Role),
})

export type UserCreateLinkRole = z.infer<typeof UserCreateLinkRoleZod>
