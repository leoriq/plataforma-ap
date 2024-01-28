import { z } from 'zod'

export const StudentCreateRequestZod = z.object({
  emails: z
    .string()
    .email({ message: 'Invalid email' })
    .or(z.literal(''))
    .array(),
  classId: z.string(),
})

export type StudentCreateRequest = z.infer<typeof StudentCreateRequestZod>

export const StudentDeleteRequestZod = z.object({
  ids: z.string().array(),
  classId: z.string(),
})

export type StudentDeleteRequest = z.infer<typeof StudentDeleteRequestZod>
