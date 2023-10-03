import { NextResponse, type NextRequest } from 'next/server'
import { getServerAuthSession } from '~/server/auth'
import { prisma } from '~/server/db'

export interface MeetingRequestBody {
  meetingId?: string
  classId?: string
  date?: string
  attendingIds?: string[]
  excusedIds?: string[]
  absentIds?: string[]

  disconnectAttendingIds?: string[]
  disconnectJustifyingIds?: string[]
  disconnectAbsentIds?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession()
    if (!session)
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    const requestingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        InstructorClasses: true,
      },
    })
    if (!requestingUser)
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

    const { classId, date, attendingIds, excusedIds, absentIds } =
      (await request.json()) as MeetingRequestBody

    if (!classId || !date)
      return NextResponse.json(
        { error: 'Missing classId or date' },
        { status: 400 }
      )

    const isInstructorOfClass = requestingUser.InstructorClasses.some(
      (classObj) => classObj.id === classId
    )

    if (
      requestingUser.role !== 'COORDINATOR' &&
      requestingUser.role !== 'REP_INSTRUCTOR' &&
      (requestingUser.role !== 'INSTRUCTOR' || !isInstructorOfClass)
    )
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const meeting = await prisma.synchronousMeeting.create({
      data: {
        date: date,
        Class: {
          connect: { id: classId },
        },
        AttendingStudents: {
          connect: attendingIds?.map((id) => ({ id })),
        },
        ExcusedStudents: {
          connect: excusedIds?.map((id) => ({ id })),
        },
        AbsentStudents: {
          connect: absentIds?.map((id) => ({ id })),
        },
      },
      include: {
        AttendingStudents: true,
        ExcusedStudents: true,
        AbsentStudents: true,
      },
    })

    return NextResponse.json({ meeting }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerAuthSession()
    if (!session)
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    const requestingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        InstructorClasses: true,
      },
    })
    if (!requestingUser)
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

    const {
      meetingId,
      date,
      attendingIds,
      excusedIds,
      absentIds,
      disconnectAttendingIds,
      disconnectJustifyingIds,
      disconnectAbsentIds,
    } = (await request.json()) as MeetingRequestBody

    if (!meetingId || !date)
      return NextResponse.json(
        { error: 'Missing meetingId, classId, or date' },
        { status: 400 }
      )

    if (
      requestingUser.role !== 'COORDINATOR' &&
      requestingUser.role !== 'REP_INSTRUCTOR' &&
      requestingUser.role !== 'INSTRUCTOR'
    )
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    if (requestingUser.role === 'INSTRUCTOR') {
      const meeting = await prisma.synchronousMeeting.findUnique({
        where: { id: meetingId },
        include: {
          Class: true,
        },
      })
      if (!meeting)
        return NextResponse.json(
          { error: 'Meeting not found' },
          { status: 404 }
        )
      const isInstructorOfClass = requestingUser.InstructorClasses.some(
        (classObj) => classObj.id === meeting.Class.id
      )
      if (!isInstructorOfClass)
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const meeting = await prisma.synchronousMeeting.update({
      where: { id: meetingId },
      data: {
        date: date,
        AttendingStudents: {
          connect: attendingIds?.map((id) => ({ id })),
          disconnect: disconnectAttendingIds?.map((id) => ({ id })),
        },
        ExcusedStudents: {
          connect: excusedIds?.map((id) => ({ id })),
          disconnect: disconnectJustifyingIds?.map((id) => ({ id })),
        },
        AbsentStudents: {
          connect: absentIds?.map((id) => ({ id })),
          disconnect: disconnectAbsentIds?.map((id) => ({ id })),
        },
      },
      include: {
        AttendingStudents: true,
        ExcusedStudents: true,
        AbsentStudents: true,
      },
    })

    return NextResponse.json({ meeting }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
