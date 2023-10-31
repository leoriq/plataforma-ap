import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '~/server/db'
import { hash } from 'bcrypt'
import { ZodError } from 'zod'
import { UserSignUpRequestZod } from '~/schemas/UserSignUpRequest'

export async function PATCH(request: NextRequest) {
  try {
    const { fullName, email, password, profilePictureFileId } =
      UserSignUpRequestZod.parse(await request.json())

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (!existingUser || existingUser.password)
      return NextResponse.json('Could not sign up, contact your instructor', {
        status: 403,
      })

    const hashedPassword = await hash(password, 12)
    const user = await prisma.user.update({
      where: { email },
      data: { fullName, password: hashedPassword, profilePictureFileId },
    })

    const userWithoutPassword = { ...user, password: undefined }

    return NextResponse.json(userWithoutPassword, { status: 200 })
  } catch (error) {
    if (error instanceof ZodError)
      return NextResponse.json(error.format(), { status: 400 })

    return NextResponse.json('Internal Server Error', { status: 500 })
  }
}
