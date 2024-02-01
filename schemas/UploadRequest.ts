import { z } from 'zod'

export const UploadRequestZod = z.object({
  name: z.string(),
  title: z.string().optional(),
  type: z.string(),
})

export type UploadRequest = z.infer<typeof UploadRequestZod>
