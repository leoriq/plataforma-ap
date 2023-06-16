import type { Lesson } from '@prisma/client'
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

    const { title, body, videoUrl, lessonCollectionId } =
      (await request.json()) as Lesson

    if (!title || !body || !lessonCollectionId)
      return NextResponse.json(
        { error: 'Missing title, body or lessonCollectionId' },
        { status: 400 }
      )

    if (
      requestingUser.role === 'COORDINATOR' ||
      requestingUser.role === 'MATERIAL'
    ) {
      const lesson = await prisma.lesson.create({
        data: {
          title,
          body,
          videoUrl,
          lessonCollectionId,
        },
      })
      return NextResponse.json({ lesson })
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
