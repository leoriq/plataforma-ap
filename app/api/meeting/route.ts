import { NextResponse, type NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { MeetingRequestZod } from '~/schemas/MeetingRequest'
import { getServerAuthSession } from '~/server/auth'
import { prisma } from '~/server/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession()
    if (!session)
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    const requestingUser = await prisma.user.findUnique({
      where: { accessToken: session.user.accessToken },
      include: {
        InstructorClasses: true,
      },
    })
    if (!requestingUser)
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

    const { classId, meetings } = MeetingRequestZod.parse(await request.json())

    const isInstructorOfClass = requestingUser.InstructorClasses.some(
      (classObj) => classObj.id === classId
    )

    if (
      !requestingUser.roles.includes('COORDINATOR') &&
      !requestingUser.roles.includes('REP_INSTRUCTOR') &&
      (!requestingUser.roles.includes('INSTRUCTOR') || !isInstructorOfClass)
    )
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const response = await prisma.$transaction(
      meetings.map((meeting) => {
        if (meeting.id !== undefined) {
          return prisma.synchronousMeeting.update({
            where: { id: meeting.id },
            data: {
              AttendingStudents: {
                connect: meeting.attendingStudentsIds?.map((id) => ({ id })),
                disconnect: [
                  ...meeting.absentStudentsIds,
                  ...meeting.excusedStudentsIds,
                ]?.map((id) => ({ id })),
              },
              ExcusedStudents: {
                connect: meeting.excusedStudentsIds?.map((id) => ({ id })),
                disconnect: [
                  ...meeting.attendingStudentsIds,
                  ...meeting.absentStudentsIds,
                ]?.map((id) => ({ id })),
              },
              AbsentStudents: {
                connect: meeting.absentStudentsIds?.map((id) => ({ id })),
                disconnect: [
                  ...meeting.attendingStudentsIds,
                  ...meeting.excusedStudentsIds,
                ]?.map((id) => ({ id })),
              },
            },
            include: {
              AttendingStudents: true,
              ExcusedStudents: true,
              AbsentStudents: true,
            },
          })
        } else {
          return prisma.synchronousMeeting.create({
            data: {
              date: new Date(meeting.date),
              Class: {
                connect: { id: classId },
              },
              AttendingStudents: {
                connect: meeting.attendingStudentsIds?.reduce((acc, id) => {
                  if (
                    !meeting.absentStudentsIds?.includes(id) &&
                    !meeting.excusedStudentsIds?.includes(id)
                  )
                    return [...acc, { id }]
                  return acc
                }, [] as { id: string }[]),
              },
              ExcusedStudents: {
                connect: meeting.excusedStudentsIds?.reduce((acc, id) => {
                  if (
                    !meeting.absentStudentsIds?.includes(id) &&
                    !meeting.attendingStudentsIds?.includes(id)
                  )
                    return [...acc, { id }]
                  return acc
                }, [] as { id: string }[]),
              },
              AbsentStudents: {
                connect: meeting.absentStudentsIds?.reduce((acc, id) => {
                  if (
                    !meeting.attendingStudentsIds?.includes(id) &&
                    !meeting.excusedStudentsIds?.includes(id)
                  )
                    return [...acc, { id }]
                  return acc
                }, [] as { id: string }[]),
              },
            },
            include: {
              AttendingStudents: true,
              ExcusedStudents: true,
              AbsentStudents: true,
            },
          })
        }
      })
    )

    return NextResponse.json({ response }, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError)
      return NextResponse.json(error.format(), { status: 400 })

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerAuthSession()
    if (!session)
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    const requestingUser = await prisma.user.findUnique({
      where: { accessToken: session.user.accessToken },
      include: {
        InstructorClasses: true,
      },
    })
    if (!requestingUser)
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

    const { id } = (await request.json()) as {
      id: string
    }

    const meeting = await prisma.synchronousMeeting.findUnique({
      where: { id },
      include: {
        Class: true,
      },
    })

    if (!meeting)
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })

    const isInstructorOfClass = requestingUser.InstructorClasses.some(
      (classObj) => classObj.id === meeting.Class.id
    )

    if (
      !requestingUser.roles.includes('COORDINATOR') &&
      !requestingUser.roles.includes('REP_INSTRUCTOR') &&
      (!requestingUser.roles.includes('INSTRUCTOR') || !isInstructorOfClass)
    )
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await prisma.synchronousMeeting.delete({
      where: { id },
    })

    return NextResponse.json({ meeting }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// export async function PUT(request: NextRequest) {
//   try {
//     const session = await getServerAuthSession()
//     if (!session)
//       return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
//     const requestingUser = await prisma.user.findUnique({
//       where: { id: session.user.id },
//       include: {
//         InstructorClasses: true,
//       },
//     })
//     if (!requestingUser)
//       return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

//     const {
//       meetingId,
//       date,
//       attendingIds,
//       excusedIds,
//       absentIds,
//       disconnectAttendingIds,
//       disconnectJustifyingIds,
//       disconnectAbsentIds,
//     } = (await request.json()) as MeetingRequestBody

//     if (!meetingId || !date)
//       return NextResponse.json(
//         { error: 'Missing meetingId, classId, or date' },
//         { status: 400 }
//       )

//     if (
//       !requestingUser.roles.includes('COORDINATOR') &&
//       !requestingUser.roles.includes('REP_INSTRUCTOR') &&
//       !requestingUser.roles.includes('INSTRUCTOR')
//     )
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

//     if (requestingUser.roles.includes('INSTRUCTOR')) {
//       const meeting = await prisma.synchronousMeeting.findUnique({
//         where: { id: meetingId },
//         include: {
//           Class: true,
//         },
//       })
//       if (!meeting)
//         return NextResponse.json(
//           { error: 'Meeting not found' },
//           { status: 404 }
//         )
//       const isInstructorOfClass = requestingUser.InstructorClasses.some(
//         (classObj) => classObj.id === meeting.Class.id
//       )
//       if (!isInstructorOfClass)
//         return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
//     }

//     const meeting = await prisma.synchronousMeeting.update({
//       where: { id: meetingId },
//       data: {
//         date: date,
//         AttendingStudents: {
//           connect: attendingIds?.map((id) => ({ id })),
//           disconnect: disconnectAttendingIds?.map((id) => ({ id })),
//         },
//         ExcusedStudents: {
//           connect: excusedIds?.map((id) => ({ id })),
//           disconnect: disconnectJustifyingIds?.map((id) => ({ id })),
//         },
//         AbsentStudents: {
//           connect: absentIds?.map((id) => ({ id })),
//           disconnect: disconnectAbsentIds?.map((id) => ({ id })),
//         },
//       },
//       include: {
//         AttendingStudents: true,
//         ExcusedStudents: true,
//         AbsentStudents: true,
//       },
//     })

//     return NextResponse.json({ meeting }, { status: 200 })
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Internal Server Error' },
//       { status: 500 }
//     )
//   }
// }
