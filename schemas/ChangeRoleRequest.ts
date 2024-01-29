import { Role } from '@prisma/client'
import { z } from 'zod'

export const ChangeRoleRequestZod = z.object({
  id: z.string(),
  roles: z.array(z.nativeEnum(Role)),
})

export type ChangeRoleRequest = z.infer<typeof ChangeRoleRequestZod>
