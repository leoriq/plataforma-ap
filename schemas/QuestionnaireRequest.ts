import { z } from 'zod'

export const QuestionnaireCreateRequestZod = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  lessonId: z.string().cuid(),
  weight: z
    .number()
    .int()
    .min(0, 'Weight must be at least 0')
    .max(1000, 'Weight must be at most 1000'),
  Questions: z.array(
    z
      .object({
        title: z.string().min(1, 'Title is required'),
        description: z.string().nullable().optional(),
        videoId: z.string().nullable().optional(),
        weight: z
          .number()
          .int()
          .min(0, 'Weight must be at least 0')
          .max(1000, 'Weight must be at most 1000'),
        imageFileId: z.string().nullable().optional(),
        audioFileId: z.string().nullable().optional(),
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

export const QuestionnaireUpdateRequestZod = z.object({
  id: z.string().cuid(),
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  weight: z
    .number()
    .int()
    .min(0, 'Weight must be at least 0')
    .max(1000, 'Weight must be at most 1000'),
  Questions: z.array(
    z
      .object({
        id: z.string().cuid().optional(),
        title: z.string().min(1, 'Title is required'),
        description: z.string().nullable().optional(),
        videoId: z.string().nullable().optional(),
        weight: z
          .number()
          .int()
          .min(0, 'Weight must be at least 0')
          .max(1000, 'Weight must be at most 1000'),
        imageFileId: z.string().nullable().optional(),
        audioFileId: z.string().nullable().optional(),
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

export type QuestionnaireUpdateRequest = z.infer<
  typeof QuestionnaireUpdateRequestZod
>
