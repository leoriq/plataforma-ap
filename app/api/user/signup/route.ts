import type { User } from '@prisma/client'
import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '~/server/db'
import { hash } from 'bcrypt'

export async function PATCH(request: NextRequest) {
  try {
    const { fullName, email, password, imageFileId } =
      (await request.json()) as User

    if (!email || !password || !fullName)
      return NextResponse.json(
        { error: 'Missing fullName, email or password' },
        { status: 400 }
      )

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (!existingUser)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (existingUser.password)
      return NextResponse.json({ error: 'Conflict' }, { status: 409 })

    const hashedPassword = await hash(password, 12)

    const user = await prisma.user.update({
      where: { email },
      data: { fullName, password: hashedPassword, imageFileId },
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
