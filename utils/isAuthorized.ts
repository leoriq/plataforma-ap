import { Role } from '@prisma/client'
import { getServerAuthSession } from '~/server/auth'
import { prisma } from '~/server/db'

export default async function isAuthorized(role?: Role) {
  const session = await getServerAuthSession()
  const id = session?.user.id

  if (!id) {
    return false
  }

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  })

  if (!user) {
    return false
  }

  if (!role) {
    return true
  }

  if (user.role === role) {
    return true
  }

  if (user.role === 'REP_INSTRUCTOR' && role === 'INSTRUCTOR') {
    return true
  }

  return false
}
