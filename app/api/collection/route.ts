import type { LessonCollection } from '@prisma/client'
import { redirect } from 'next/navigation'
import { NextResponse, type NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { CollectionRequestZod } from '~/schemas/CollectionRequest'
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

    const { name, description } = CollectionRequestZod.parse(
      await request.json()
    )

    const lessonCollection = await prisma.lessonCollection.create({
      data: {
        name,
        description,
      },
    })
    return NextResponse.json({ lessonCollection })
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

    const { id, name, description } = CollectionRequestZod.parse(
      await request.json()
    )

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const lessonCollection = await prisma.lessonCollection.update({
      where: { id },
      data: {
        name,
        description,
      },
    })
    return NextResponse.json({ lessonCollection })
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
      where: { accessToken: session.user.accessToken },
    })
    if (!requestingUser)
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

    if (
      !requestingUser.roles.includes('COORDINATOR') &&
      !requestingUser.roles.includes('MATERIAL')
    )
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = (await request.json()) as LessonCollection

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const lessonCollection = await prisma.lessonCollection.delete({
      where: { id },
    })
    return NextResponse.json({ lessonCollection })
  } catch (error) {
    if (error instanceof ZodError)
      return NextResponse.json(error.format(), { status: 400 })

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
