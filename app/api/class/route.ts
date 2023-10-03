import { NextResponse, type NextRequest } from 'next/server'
import { getServerAuthSession } from '~/server/auth'
import { prisma } from '~/server/db'

export interface ClassRequestBody {
  id?: string
  name: string
  description?: string
  lessonCollectionId: string

  instructorsIds?: string[]
  studentsIds?: string[]

  disconnectInstructorsIds?: string[]
  disconnectStudentsIds?: string[]
}

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
      requestingUser.role !== 'REP_INSTRUCTOR'
    )
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { name, description, lessonCollectionId, instructorsIds } =
      (await request.json()) as ClassRequestBody

    if (!name || !lessonCollectionId)
      return NextResponse.json(
        { error: 'Missing name or lessonCollectionId' },
        { status: 400 }
      )

    const c = await prisma.class.create({
      data: {
        name,
        description,
        lessonCollectionId,
        Instructors: {
          connect: instructorsIds?.map((id) => ({ id })) ?? [],
        },
      },
    })
    return NextResponse.json({ class: c })
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
      requestingUser.role !== 'REP_INSTRUCTOR' &&
      requestingUser.role !== 'INSTRUCTOR'
    )
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const {
      id,
      name,
      description,
      lessonCollectionId,
      instructorsIds,
      studentsIds,
      disconnectInstructorsIds,
      disconnectStudentsIds,
    } = (await request.json()) as ClassRequestBody

    if (!id || !name || !lessonCollectionId)
      return NextResponse.json(
        { error: 'Missing id, name or lessonCollectionId' },
        { status: 400 }
      )

    const c = await prisma.class.update({
      where: { id },
      data: {
        name,
        description,
        lessonCollectionId,
        Instructors: {
          connect: instructorsIds?.map((id) => ({ id })) ?? [],
          disconnect: disconnectInstructorsIds?.map((id) => ({ id })) ?? [],
        },
        Students: {
          connect: studentsIds?.map((id) => ({ id })) ?? [],
          disconnect: disconnectStudentsIds?.map((id) => ({ id })) ?? [],
        },
      },
    })
    return NextResponse.json({ class: c })
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
      requestingUser.role !== 'REP_INSTRUCTOR'
    )
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = (await request.json()) as { id: string }

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const lesson = await prisma.class.delete({
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
