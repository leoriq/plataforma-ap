import { z } from 'zod'

export const UserAnswerCreateRequestZod = z
  .object({
    questionId: z.string(),
    answer: z.string().optional(),
    audioFileId: z.string().optional(),
  })
  .refine((data) => !(data.answer && data.audioFileId), {
    message: 'You can only provide answer or audioFileId, not both',
  })
  .refine((data) => !(!data.answer && !data.audioFileId), {
    message: 'You must provide answer or audioFileId',
  })
  .array()

export type UserAnswerCreateRequest = z.infer<typeof UserAnswerCreateRequestZod>
