import { Role } from '@prisma/client'
import { getServerAuthSession } from '~/server/auth'

export default async function getAuthorizedUser(role?: Role) {
  const session = await getServerAuthSession()
  const user = session?.user

  if (!user) {
    return null
  }

  if (!role) {
    return user
  }

  if (user.roles.includes(role)) {
    return user
  }

  if (user.roles.includes('REP_INSTRUCTOR') && role === 'INSTRUCTOR') {
    return user
  }

  return null
}
