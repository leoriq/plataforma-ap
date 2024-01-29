import { prisma } from '~/server/db'
import UserTable from '~/components/molecules/UserTable'

export default async function CoordinatorAllUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  })

  return <UserTable canDeleteUser title="All Users" users={users} />
}
