import { z } from 'zod'

export const MeetingRequestZod = z.object({
  classId: z.string(),
  meetings: z.array(
    z
      .object({
        id: z.string(),
        attendingStudentsIds: z.array(z.string()),
        excusedStudentsIds: z.array(z.string()),
        absentStudentsIds: z.array(z.string()),
      })
      .or(
        z.object({
          id: z.undefined(),
          date: z.string(),
          attendingStudentsIds: z.array(z.string()),
          excusedStudentsIds: z.array(z.string()),
          absentStudentsIds: z.array(z.string()),
        })
      )
  ),
})

export type MeetingRequest = z.infer<typeof MeetingRequestZod>
