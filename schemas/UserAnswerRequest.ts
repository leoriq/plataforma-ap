import { z } from 'zod'

export const UserAnswerCreateRequestZod = z
  .object({
    questionId: z.string(),
    answer: z.string().optional(),
    audioFileId: z.string().optional(),
  })
  .refine((data) => {
    if (data.answer && data.audioFileId) {
      return 'You can only provide answer or audioFileId, not both'
    }
    if (!data.answer && !data.audioFileId) {
      return 'You must provide answer or audioFileId'
    }
    return true
  })
  .array()

export type UserAnswerCreateRequest = z.infer<typeof UserAnswerCreateRequestZod>
