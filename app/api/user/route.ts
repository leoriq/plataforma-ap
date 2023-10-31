import type { User } from '@prisma/client'
import { compare, hash } from 'bcrypt'
import { type NextRequest, NextResponse } from 'next/server'
import { getServerAuthSession } from '~/server/auth'
import { prisma } from '~/server/db'

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerAuthSession()
    if (!session)
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
    const requestingUser = await prisma.user.findUnique({
      where: { accessToken: session.user.accessToken },
    })
    if (!requestingUser)
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

    const { fullName, email, password, newPassword, profilePictureFileId } =
      (await request.json()) as User & { newPassword?: string }

    let newPasswordHash: string | undefined

    if (password && requestingUser.password && newPassword) {
      const passwordMatches = await compare(requestingUser.password, password)
      if (!passwordMatches)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      newPasswordHash = await hash(newPassword, 12)
    }

    const user = await prisma.user.update({
      where: { id: requestingUser.id },
      data: {
        fullName,
        email,
        password: newPasswordHash,
        profilePictureFileId,
      },
    })

    const userWithoutPassword = { ...user, password: undefined }

    return NextResponse.json(userWithoutPassword, { status: 200 })
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
      where: { accessToken: session.user.accessToken },
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

    if (requestingUser.roles.includes('COORDINATOR')) {
      await prisma.user.delete({ where: { id: selectedUserId } })
      return NextResponse.json({ success: true })
    }

    if (requestingUser.roles.includes('INSTRUCTOR')) {
      if (selectedUser.roles.includes('STUDENT')) {
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
