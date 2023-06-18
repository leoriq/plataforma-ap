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

    if (
      requestingUser.role !== 'COORDINATOR' &&
      requestingUser.role !== 'MATERIAL'
    )
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { name, description } = (await request.json()) as LessonCollection

    if (!name)
      return NextResponse.json({ error: 'Missing name' }, { status: 400 })

    const lessonCollection = await prisma.lessonCollection.create({
      data: {
        name,
        description,
      },
    })
    return NextResponse.json({ lessonCollection })
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

    const { id, name, description } = (await request.json()) as LessonCollection

    if (!id || !name)
      return NextResponse.json({ error: 'Missing id or name' }, { status: 400 })

    const lessonCollection = await prisma.lessonCollection.update({
      where: { id },
      data: {
        name,
        description,
      },
    })
    return NextResponse.json({ lessonCollection })
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

    const { id } = (await request.json()) as LessonCollection

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const lessonCollection = await prisma.lessonCollection.delete({
      where: { id },
    })
    return NextResponse.json({ lessonCollection })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
