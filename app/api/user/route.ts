import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
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

    const { email, role } = await request.json()
    if (!email || !role)
      return NextResponse.json(
        { error: 'Missing email or role' },
        { status: 400 }
      )

    if (requestingUser.role === 'COORDINATOR') {
      const user = await prisma.user.create({
        data: { email, role },
      })
      return NextResponse.json({ user })
    }

    if (requestingUser.role === 'INSTRUCTOR') {
      if (role === 'STUDENT') {
        const user = await prisma.user.create({
          data: { email, role },
        })
        return NextResponse.json({ user })
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
      const revalidate = request.nextUrl.searchParams.get('revalidate')
      if (revalidate) revalidatePath(revalidate)
      return NextResponse.json({ success: true })
    }

    if (requestingUser.role === 'INSTRUCTOR') {
      if (selectedUser.role === 'STUDENT') {
        await prisma.user.delete({ where: { id: selectedUserId } })
        const revalidate = request.nextUrl.searchParams.get('revalidate')
        if (revalidate) revalidatePath(revalidate)
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
