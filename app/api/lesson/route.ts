import type { Lesson } from '@prisma/client'
import { redirect } from 'next/navigation'
import { NextResponse, type NextRequest } from 'next/server'
import { ZodError } from 'zod'
import {
  LessonCreateRequestZod,
  LessonUpdateRequestZod,
} from '~/schemas/LessonRequest'
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

    const { connectQuestionnairesIds, ...data } = LessonCreateRequestZod.parse(
      await request.json()
    )

    const lesson = await prisma.lesson.create({
      data: {
        ...data,
        Questionnaires: {
          connect: connectQuestionnairesIds?.map((id) => ({ id })),
        },
      },
    })
    return NextResponse.json({ lesson })
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

    const { connectQuestionnairesIds, disconnectQuestionnairesIds, ...data } =
      LessonUpdateRequestZod.parse(await request.json())

    const lesson = await prisma.lesson.update({
      where: { id: data.id },
      data: {
        ...data,
        Questionnaires: {
          connect: connectQuestionnairesIds?.map((id) => ({ id })),
          disconnect: disconnectQuestionnairesIds?.map((id) => ({ id })),
        },
      },
    })
    return NextResponse.json({ lesson })
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
      where: { id: session.user.id },
    })
    if (!requestingUser)
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

    if (
      !requestingUser.roles.includes('COORDINATOR') &&
      !requestingUser.roles.includes('MATERIAL')
    )
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = (await request.json()) as { id: Lesson['id'] }

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const lesson = await prisma.lesson.delete({
      where: { id },
    })
    return NextResponse.json({ lesson })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
