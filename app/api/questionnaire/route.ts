import { redirect } from 'next/navigation'
import { type NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import {
  QuestionnaireCreateRequestZod,
  QuestionnaireUpdateRequestZod,
} from '~/schemas/QuestionnaireRequest'
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

    if (
      !requestingUser.roles.includes('COORDINATOR') &&
      !requestingUser.roles.includes('MATERIAL')
    )
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { Questions, ...data } = QuestionnaireCreateRequestZod.parse(
      await request.json()
    )

    const questionnaire = await prisma.questionnaire.create({
      data: {
        ...data,
        Questions: {
          create: Questions,
        },
      },
    })

    return NextResponse.json({ questionnaire })
  } catch (error) {
    if (error instanceof ZodError)
      return NextResponse.json(error.format(), { status: 400 })

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerAuthSession()
    if (!session) return NextResponse.json('Unauthenticated', { status: 401 })
    const requestingUser = await prisma.user.findUnique({
      where: { accessToken: session.user.accessToken },
    })
    if (!requestingUser) redirect('/sign-out')

    if (
      !requestingUser.roles.includes('COORDINATOR') &&
      !requestingUser.roles.includes('MATERIAL')
    )
      return NextResponse.json('Forbidden', { status: 403 })

    const { Questions, ...data } = QuestionnaireUpdateRequestZod.parse(
      await request.json()
    )

    const originalQuestionnaire = await prisma.questionnaire.findUnique({
      where: { id: data.id },
      select: {
        Questions: {
          select: {
            UserAnswer: {
              select: { id: true },
              take: 1,
            },
          },
        },
      },
    })

    if (!originalQuestionnaire)
      return NextResponse.json('Questionnaire not found', { status: 404 })

    if (originalQuestionnaire.Questions.some((q) => q.UserAnswer.length > 0))
      return NextResponse.json(
        'Questionnaire cannot be edited because it has already been answered',
        { status: 400 }
      )

    const questionnaire = await prisma.questionnaire.update({
      where: { id: data.id },
      data: {
        ...data,
        Questions: {
          deleteMany: {
            id: {
              notIn: Questions.reduce((acc, q) => {
                if (q.id) acc.push(q.id)
                return acc
              }, [] as string[]),
            },
          },
          updateMany: Questions.filter((q) => q.id).map((q) => ({
            where: { id: q.id },
            data: q,
          })),
          createMany: { data: Questions.filter((q) => !q.id) },
        },
      },
    })

    return NextResponse.json({ questionnaire })
  } catch (error) {
    if (error instanceof ZodError)
      return NextResponse.json(error.format(), { status: 400 })

    return NextResponse.json('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerAuthSession()
    if (!session)
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    const requestingUser = await prisma.user.findUnique({
      where: { accessToken: session.user.accessToken },
    })
    if (!requestingUser) redirect('/sign-out')

    if (
      !requestingUser.roles.includes('COORDINATOR') &&
      !requestingUser.roles.includes('MATERIAL')
    )
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = (await request.json()) as { id: string }

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    await prisma.questionnaire.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
