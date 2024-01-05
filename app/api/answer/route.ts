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

    const userAnswer = await prisma.userQuestionAnswer.createMany({
      data,
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
