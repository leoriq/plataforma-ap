import { roles } from '@prisma/client'
import { getServerAuthSession } from '~/server/auth'

export default async function getAuthorizedUser(roles?: roles) {
  const session = await getServerAuthSession()
  const user = session?.user

  if (!user) {
    return null
  }

  if (!roles) {
    return user
  }

  if (user.roles.includes(roles)) {
    return user
  }

  if (user.roles.includes('REP_INSTRUCTOR') && roles.includes('INSTRUCTOR')) {
    return user
  }

  return null
}
