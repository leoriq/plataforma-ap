import { type NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { StudentCreateRequestZod } from '~/schemas/StudentCreateRequest'
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
