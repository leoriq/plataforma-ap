import { z } from 'zod'

export const LessonCreateRequestZod = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(3, 'Title has to have at least 3 characters')
    .max(64, 'Title can have at most 50 characters'),
  body: z
    .string({ required_error: 'Body is required' })
    .min(3, 'Body has to have at least 3 characters')
    .max(1000, 'Body can have at most 1000 characters'),
  videosIds: z.array(z.string()),
  lessonCollectionId: z.string({
    required_error: 'Lesson Collection Id is required',
  }),
  publicationDate: z.string({ required_error: 'Publication Date is required' }),
  connectQuestionnairesIds: z.array(z.string()).optional(),
})

export type LessonCreateRequest = z.infer<typeof LessonCreateRequestZod>

export const LessonUpdateRequestZod = z.object({
  id: z.string({ required_error: 'Id is required' }),
  title: z
    .string({ required_error: 'Title is required' })
    .min(3, 'Title has to have at least 3 characters')
    .max(64, 'Title can have at most 50 characters'),
  body: z
    .string({ required_error: 'Body is required' })
    .min(3, 'Body has to have at least 3 characters')
    .max(1000, 'Body can have at most 1000 characters'),
  videosIds: z.array(z.string()),
  lessonCollectionId: z.string({
    required_error: 'Lesson Collection Id is required',
  }),
  publicationDate: z.string({ required_error: 'Publication Date is required' }),
  connectQuestionnairesIds: z.array(z.string()).optional(),
  disconnectQuestionnairesIds: z.array(z.string()).optional(),
})

export type LessonUpdateRequest = z.infer<typeof LessonUpdateRequestZod>
