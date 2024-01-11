import { redirect } from 'next/navigation'
import { type NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { UserCreateLinkRoleZod } from '~/schemas/UserCreateLinkRole'
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

    const data = UserCreateLinkRoleZod.parse(await request.json())
    const { emails, role } = data

    if (!requestingUser.roles.includes('COORDINATOR'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await prisma.$transaction([
      prisma.user.updateMany({
        where: { email: { in: emails }, NOT: { roles: { has: role } } },
        data: { roles: { push: role } },
      }),
      prisma.user.createMany({
        data: emails.map((email) => ({ email, roles: [role] })),
        skipDuplicates: true,
      }),
    ])
    return NextResponse.json({ status: 200 })
  } catch (error) {
    if (error instanceof ZodError)
      return NextResponse.json(error.format(), { status: 400 })

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
