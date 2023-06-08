import type { User } from '@prisma/client'
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

    const { email, role } = (await request.json()) as User
    console.log('user', email, role)

    if (!email || !role)
      return NextResponse.json(
        { error: 'Missing email or role' },
        { status: 400 }
      )

    const emailsArray = email.split(',')

    if (requestingUser.role === 'COORDINATOR') {
      const users = await prisma.user.createMany({
        data: emailsArray.map((email) => ({ email, role })),
      })
      return NextResponse.json({ users })
    }

    if (requestingUser.role === 'INSTRUCTOR') {
      if (role === 'STUDENT') {
        const users = await prisma.user.createMany({
          data: emailsArray.map((email) => ({ email, role })),
        })
        return NextResponse.json({ users })
      }
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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

    const selectedUserId = request.nextUrl.searchParams.get('id')
    if (!selectedUserId)
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const selectedUser = await prisma.user.findUnique({
      where: { id: selectedUserId },
    })
    if (!selectedUser)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (requestingUser.role === 'COORDINATOR') {
      await prisma.user.delete({ where: { id: selectedUserId } })
      return NextResponse.json({ success: true })
    }

    if (requestingUser.role === 'INSTRUCTOR') {
      if (selectedUser.role === 'STUDENT') {
        await prisma.user.delete({ where: { id: selectedUserId } })
        return NextResponse.json({ success: true })
      }
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
