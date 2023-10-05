import type { User } from '@prisma/client'
import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '~/server/db'
import { hash } from 'bcrypt'

export async function PATCH(request: NextRequest) {
  try {
    const { fullName, email, password, profilePictureFileId } =
      (await request.json()) as User

    if (!email || !password || !fullName)
      return NextResponse.json(
        { error: 'Missing name, email or password' },
        { status: 400 }
      )

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (!existingUser)
      return NextResponse.json(
        { error: 'Email not found, contact your instructor' },
        { status: 404 }
      )

    if (existingUser.password)
      return NextResponse.json(
        { error: 'Account already exists. Try logging in' },
        { status: 409 }
      )

    const hashedPassword = await hash(password, 12)

    const user = await prisma.user.update({
      where: { email },
      data: { fullName, password: hashedPassword, profilePictureFileId },
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
