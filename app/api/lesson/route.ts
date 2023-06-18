import type { Lesson, Prisma } from '@prisma/client'
import { NextResponse, type NextRequest } from 'next/server'
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

    const { title, body, videoUrl, lessonCollectionId, documentFileId } =
      (await request.json()) as Prisma.LessonUncheckedCreateInput

    if (!title || !body || !lessonCollectionId)
      return NextResponse.json(
        { error: 'Missing title, body or lessonCollectionId' },
        { status: 400 }
      )

    const lesson = await prisma.lesson.create({
      data: {
        title,
        body,
        videoUrl,
        lessonCollectionId,
        documentFileId,
      },
    })
    return NextResponse.json({ lesson })
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

    const { id, title, body, videoUrl, documentFileId } =
      (await request.json()) as Prisma.LessonUncheckedCreateInput

    if (!id || !title || !body)
      return NextResponse.json(
        { error: 'Missing id, title or body' },
        { status: 400 }
      )

    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        title,
        body,
        videoUrl,
        documentFileId,
      },
    })
    return NextResponse.json({ lesson })
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
