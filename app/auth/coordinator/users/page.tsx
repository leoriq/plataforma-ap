import { prisma } from '~/server/db'
import AllUsersTable from '~/components/organisms/AllUsersTable'

export default async function CoordinatorAllUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  })

  return <AllUsersTable users={users} />
}
