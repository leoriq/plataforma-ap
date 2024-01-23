import { z } from 'zod'

export const GradeRequestZod = z.array(
  z.object({
    answerId: z.string(),
    grade: z
      .number({
        required_error: 'Grade is required',
        invalid_type_error: 'Grade must be a number between 0 and 10',
      })
      .min(0, { message: 'Grade must be at least 0' })
      .max(10, { message: 'Grade must be at most 10' }),
    instructorComment: z.string().optional(),
  })
)

export type GradeRequest = z.infer<typeof GradeRequestZod>
