import { z } from 'zod'

export const QuestionnaireCreateRequestZod = z.object({
  title: z.string(),
  lessonId: z.string().cuid(),
  Questions: z.array(
    z
      .object({
        title: z.string().min(1, 'Title is required'),
        description: z.string().optional(),
        videoId: z.string().optional(),
        maxGrade: z
          .number({
            required_error: 'maxGrade is required',
            invalid_type_error: 'Max Grade must be a number',
          })
          .int()
          .nonnegative()
          .max(100),
        imageFileId: z.string().optional(),
        audioFileId: z.string().optional(),
        index: z.number().int().nonnegative(),
      })
      .and(
        z.discriminatedUnion('answerType', [
          z.object({
            answerType: z.literal('OPTIONS'),
            options: z
              .array(z.string().min(1, 'Fill or remove empty option'))
              .min(1, {
                message: 'Options are required',
              }),
          }),
          z.object({
            answerType: z.enum(['TEXT', 'AUDIO']),
            options: z.array(z.string()).max(0, {
              message: 'Options are not allowed',
            }),
          }),
        ])
      )
  ),
})

export type QuestionnaireCreateRequest = z.infer<
  typeof QuestionnaireCreateRequestZod
>
