import { redirect } from 'next/navigation'
import { type NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { UserAnswerCreateRequestZod } from '~/schemas/UserAnswerRequest'
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

    if (!requestingUser.roles.includes('STUDENT'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const data = UserAnswerCreateRequestZod.parse(await request.json())

    const questions = await prisma.question.findMany({
      where: {
        id: {
          in: data.map((answer) => answer.questionId),
        },
        Questionnaire: {
          Lesson: {
            Collection: {
              Classes: {
                some: {
                  Students: {
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
      include: {
        UserAnswer: {
          where: {
            studentUserId: requestingUser.id,
          },
        },
      },
    })

    if (questions.length !== data.length)
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'You cannot answer a question not assigned to you.',
        },
        { status: 403 }
      )

    if (questions.some((question) => question.UserAnswer.length > 0))
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'You cannot answer a question more than once.',
        },
        { status: 403 }
      )

    const gradedAnswers = data.map((answer) => {
      const question = questions.find(
        (question) => question.id === answer.questionId
      )
      if (!question) throw new Error('Question not found')
      if (question.answerType === 'OPTIONS') {
        return {
          ...answer,
          grade: question.options[0] === answer.answer ? 10 : 0,
          instructorComment:
            question.options[0] === answer.answer
              ? 'Auto graded.'
              : `Auto graded. The correct answer is ${question.options[0]}`,
        }
      }
      return answer
    })

    const userAnswer = await prisma.userQuestionAnswer.createMany({
      data: gradedAnswers.map((answer) => ({
        ...answer,
        studentUserId: requestingUser.id,
      })),
    })

    return NextResponse.json({ userAnswer })
  } catch (error) {
    if (error instanceof ZodError)
      return NextResponse.json(error.format(), { status: 400 })

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
