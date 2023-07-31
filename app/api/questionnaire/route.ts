import { AnswerType, type Question, type Questionnaire } from '@prisma/client'
import { type NextRequest, NextResponse } from 'next/server'
import { getServerAuthSession } from '~/server/auth'
import { prisma } from '~/server/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession()
    if (!session)
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    const requestingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    })
    if (!requestingUser)
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

    if (
      requestingUser.role !== 'COORDINATOR' &&
      requestingUser.role !== 'MATERIAL'
    )
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const requestBody = (await request.json()) as Questionnaire & {
      Questions: Question[]
    }

    const { title, lessonId } = requestBody

    const Questions = requestBody.Questions.map((question) => {
      const {
        title,
        description,
        videoUrl,
        answerType,
        options,
        maxGrade,
        imageFileId,
        audioFileId,
      } = question
      return {
        title,
        description,
        videoUrl,
        answerType,
        options,
        maxGrade,
        imageFileId,
        audioFileId,
      }
    })

    if (!title || !lessonId)
      return NextResponse.json(
        { error: 'Missing title or lessonId' },
        { status: 400 }
      )

    const questionsValid = Questions.every((question) => {
      const { title, answerType, options, maxGrade } = question
      return (
        title &&
        AnswerType[answerType] &&
        (options || answerType !== 'OPTIONS') &&
        maxGrade
      )
    })

    if (!questionsValid)
      return NextResponse.json(
        {
          error:
            'One or more questions missing title, answerType, maxGrade, questionnaireId or options if answerType is OPTIONS',
        },
        { status: 400 }
      )

    const questionnaire = await prisma.questionnaire.create({
      data: {
        title,
        lessonId,
        Questions: {
          create: Questions,
        },
      },
    })
    return NextResponse.json({ questionnaire })
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
    })
    if (!requestingUser)
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

    if (
      requestingUser.role !== 'COORDINATOR' &&
      requestingUser.role !== 'MATERIAL'
    )
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const requestBody = (await request.json()) as Questionnaire & {
      Questions: Question[]
      deleteQuestionsIds?: string[]
    }

    const { id, title } = requestBody

    const Questions = requestBody.Questions.map((question) => {
      const {
        id,
        title,
        description,
        videoUrl,
        answerType,
        options,
        maxGrade,
        imageFileId,
        audioFileId,
      } = question
      return {
        id,
        title,
        description,
        videoUrl,
        answerType,
        options,
        maxGrade,
        imageFileId,
        audioFileId,
      }
    })

    if (!id || !title)
      return NextResponse.json({ error: 'Missing id, title' }, { status: 400 })

    const questionsValid = Questions.every((question) => {
      const { id, title, answerType, options, maxGrade } = question
      return (
        id &&
        title &&
        AnswerType[answerType] &&
        (options || answerType !== 'OPTIONS') &&
        maxGrade
      )
    })

    if (!questionsValid)
      return NextResponse.json(
        {
          error:
            'One or more questions missing id, title, answerType, maxGrade, questionnaireId or options if answerType is OPTIONS',
        },
        { status: 400 }
      )

    const questionnaire = await prisma.questionnaire.update({
      where: { id },
      data: {
        title,
        Questions: {
          upsert: Questions.map((question) => ({
            where: { id: question.id },
            update: question,
            create: question,
          })),
          deleteMany: requestBody.deleteQuestionsIds
            ? requestBody.deleteQuestionsIds.map((id) => ({ id }))
            : [],
        },
      },
    })
    return NextResponse.json({ questionnaire })
  } catch (error) {
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
      where: { id: session.user.id },
    })
    if (!requestingUser)
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

    if (
      requestingUser.role !== 'COORDINATOR' &&
      requestingUser.role !== 'MATERIAL'
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
