import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '~/server/db'
import { hash } from 'bcrypt'
import { z } from 'zod'
import {
  UserSignUpRequest,
  UserSignUpRequestZod,
} from '~/schemas/UserSignUpRequest'

export async function PATCH(request: NextRequest) {
  try {
    const rawData = (await request.json()) as UserSignUpRequest

    const data = UserSignUpRequestZod.parse(rawData)

    const { fullName, email, password, profilePictureFileId } = data

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (!existingUser)
      return NextResponse.json('Email not found, contact your instructor', {
        status: 404,
      })

    if (existingUser.password)
      return NextResponse.json('Account already exists. Try logging in', {
        status: 409,
      })

    const hashedPassword = await hash(password, 12)

    const user = await prisma.user.update({
      where: { email },
      data: { fullName, password: hashedPassword, profilePictureFileId },
    })

    const userWithoutPassword = { ...user, password: undefined }

    return NextResponse.json(userWithoutPassword, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(error.format(), { status: 400 })
    }

    return NextResponse.json('Internal Server Error', { status: 500 })
  }
}
