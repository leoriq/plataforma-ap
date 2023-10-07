import { Role } from '@prisma/client'
import { getServerAuthSession } from '~/server/auth'

export default async function isAuthorized(role?: Role) {
  const session = await getServerAuthSession()
  const user = session?.user

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
