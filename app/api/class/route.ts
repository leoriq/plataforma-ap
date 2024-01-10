import { redirect } from 'next/navigation'
import { NextResponse, type NextRequest } from 'next/server'
import { ZodError } from 'zod'
import {
  ClassCreateRequestZod,
  ClassUpdateRequestZod,
} from '~/schemas/ClassRequest'
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
    if (!requestingUser) redirect('/login')

    if (
      !requestingUser.roles.includes('COORDINATOR') &&
      !requestingUser.roles.includes('REP_INSTRUCTOR')
    )
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { connectInstructorsIds, connectStudentsEmails, ...data } =
      ClassCreateRequestZod.parse(await request.json())

    const c = await prisma.class.create({
      data: {
        ...data,
        Instructors: {
          connect: connectInstructorsIds?.map((id) => ({ id })) ?? [],
        },
        Students: {
          connectOrCreate:
            connectStudentsEmails?.map((email) => ({
              where: { email },
              create: { email },
            })) ?? [],
        },
      },
    })
    return NextResponse.json({ class: c })
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
    if (!requestingUser) redirect('/login')

    if (
      !requestingUser.roles.includes('COORDINATOR') &&
      !requestingUser.roles.includes('REP_INSTRUCTOR') &&
      !requestingUser.roles.includes('INSTRUCTOR')
    )
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const {
      id,
      connectInstructorsIds,
      connectStudentsEmails,
      disconnectInstructorsIds,
      disconnectStudentsIds,
      ...data
    } = ClassUpdateRequestZod.parse(await request.json())

    const c = await prisma.class.update({
      where: { id },
      data: {
        ...data,
        Instructors: {
          connect: connectInstructorsIds?.map((id) => ({ id })) ?? [],
          disconnect: disconnectInstructorsIds?.map((id) => ({ id })) ?? [],
        },
        Students: {
          connectOrCreate:
            connectStudentsEmails?.map((email) => ({
              where: { email },
              create: { email },
            })) ?? [],
          disconnect: disconnectStudentsIds?.map((id) => ({ id })) ?? [],
        },
      },
    })
    return NextResponse.json({ class: c })
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
    if (!requestingUser) redirect('/login')

    if (
      !requestingUser.roles.includes('COORDINATOR') &&
      !requestingUser.roles.includes('REP_INSTRUCTOR')
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
