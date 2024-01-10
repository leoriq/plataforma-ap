import { z } from 'zod'

export const ClassCreateRequestZod = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(3, 'Name has to have at least 3 characters')
    .max(50, 'Name can have at most 50 characters'),
  description: z
    .string()
    .max(255, 'Description can have at most 255 characters')
    .optional(),
  lessonCollectionId: z.string(),
  archived: z.boolean().optional(),
  connectInstructorsIds: z
    .array(z.string())
    .min(1, 'At least one instructor is required'),
  connectStudentsEmails: z.array(z.string().email()),
})

export type ClassCreateRequest = z.infer<typeof ClassCreateRequestZod>

export const ClassUpdateRequestZod = z.object({
  id: z.string(),
  name: z
    .string({ required_error: 'Name is required' })
    .min(3, 'Name has to have at least 3 characters')
    .max(50, 'Name can have at most 50 characters'),
  description: z
    .string()
    .max(255, 'Description can have at most 255 characters')
    .optional(),
  lessonCollectionId: z.string(),
  archived: z.boolean().optional(),
  connectInstructorsIds: z.array(z.string()),
  connectStudentsEmails: z.array(z.string().email()),
  disconnectInstructorsIds: z.array(z.string()),
  disconnectStudentsIds: z.array(z.string()),
})

export type ClassUpdateRequest = z.infer<typeof ClassUpdateRequestZod>
