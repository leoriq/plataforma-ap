import type { LessonCollection } from '@prisma/client'
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

    const { name, description } = (await request.json()) as LessonCollection

    if (!name)
      return NextResponse.json({ error: 'Missing name' }, { status: 400 })

    if (
      requestingUser.role === 'COORDINATOR' ||
      requestingUser.role === 'MATERIAL'
    ) {
      const lessonCollection = await prisma.lessonCollection.create({
        data: {
          name,
          description,
        },
      })
      return NextResponse.json({ lessonCollection })
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
