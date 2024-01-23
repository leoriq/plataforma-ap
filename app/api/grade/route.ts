import { redirect } from 'next/navigation'
import { type NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { GradeRequestZod } from '~/schemas/GradeRequest'
import { getServerAuthSession } from '~/server/auth'
import { prisma } from '~/server/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession()
    if (!session)
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    const requestingUser = await prisma.user.findUnique({
      where: { accessToken: session.user.accessToken },
    })
    if (!requestingUser) redirect('/sign-out')

    const data = GradeRequestZod.parse(await request.json())

    const dbAnswer = await prisma.userQuestionAnswer.findMany({
      where: {
        id: {
          in: data.map((answer) => answer.answerId),
        },
        Question: {
          Questionnaire: {
            Lesson: {
              Collection: {
                Classes: {
                  some: {
                    Instructors: {
                      some: {
                        id: requestingUser.id,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    const isInstructorOfClass = data.length === dbAnswer.length

    if (
      (requestingUser.roles.includes('INSTRUCTOR') && isInstructorOfClass) ||
      requestingUser.roles.includes('REP_INSTRUCTOR') ||
      requestingUser.roles.includes('COORDINATOR')
    ) {
      await prisma.$transaction(
        data.map((answer) =>
          prisma.userQuestionAnswer.update({
            where: { id: answer.answerId },
            data: {
              grade: answer.grade,
              instructorComment: answer.instructorComment,
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
