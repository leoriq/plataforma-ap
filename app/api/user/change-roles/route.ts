import { type NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { ChangeRoleRequestZod } from '~/schemas/ChangeRoleRequest'
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

    const { id, roles } = ChangeRoleRequestZod.parse(await request.json())

    if (!requestingUser.roles.includes('COORDINATOR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.user.update({
      where: { id },
      data: {
        roles: roles,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof ZodError)
      return NextResponse.json(error.format(), { status: 400 })

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
