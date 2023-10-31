import { z } from 'zod'

export const CollectionRequestZod = z.object({
  id: z.string().optional(),
  name: z
    .string({ required_error: 'Name is required' })
    .min(3, 'Name has to have at least 3 characters')
    .max(50, 'Name can have at most 50 characters'),
  description: z
    .string()
    .max(255, 'Description can have at most 255 characters')
    .optional(),
})

export type CollectionRequest = z.infer<typeof CollectionRequestZod>
