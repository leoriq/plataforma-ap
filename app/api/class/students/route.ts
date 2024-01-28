import { type NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import {
  StudentCreateRequestZod,
  StudentDeleteRequestZod,
} from '~/schemas/StudentRequest'
import { getServerAuthSession } from '~/server/auth'
import { prisma } from '~/server/db'

export interface AddStudentRequestBody {
  emails: string
  classId: string
}

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

    const { emails, classId } = StudentCreateRequestZod.parse(
      await request.json()
    )

    const isInstructorOfClass = requestingUser.InstructorClasses.some(
      (classObj) => classObj.id === classId
    )

    if (
      (requestingUser.roles.includes('INSTRUCTOR') && isInstructorOfClass) ||
      requestingUser.roles.includes('REP_INSTRUCTOR') ||
      requestingUser.roles.includes('COORDINATOR')
    ) {
      const updatedClass = await prisma.class.update({
        where: { id: classId },
        data: {
          Students: {
            connectOrCreate: emails.map((email) => ({
              where: { email },
              create: { email, roles: ['STUDENT'] },
            })),
          },
        },
      })
      return NextResponse.json({ updatedClass })
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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

    const { ids, classId } = StudentDeleteRequestZod.parse(await request.json())

    const isInstructorOfClass = requestingUser.InstructorClasses.some(
      (classObj) => classObj.id === classId
    )

    if (
      (requestingUser.roles.includes('INSTRUCTOR') && isInstructorOfClass) ||
      requestingUser.roles.includes('REP_INSTRUCTOR') ||
      requestingUser.roles.includes('COORDINATOR')
    ) {
      const classObj = await prisma.class.update({
        where: { id: classId },
        data: {
          Students: {
            disconnect: ids.map((id) => ({ id })),
          },
        },
        select: {
          SynchronousMeeting: {
            select: {
              id: true,
            },
          },
        },
      })

      await prisma.$transaction(
        classObj.SynchronousMeeting.map((meeting) =>
          prisma.synchronousMeeting.update({
            where: { id: meeting.id },
            data: {
              AbsentStudents: {
                disconnect: ids.map((id) => ({ id })),
              },
              ExcusedStudents: {
                disconnect: ids.map((id) => ({ id })),
              },
              AttendingStudents: {
                disconnect: ids.map((id) => ({ id })),
              },
            },
          })
        )
      )

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  } catch (error) {
    if (error instanceof ZodError)
      return NextResponse.json(error.format(), { status: 400 })

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
