import { prisma } from '~/server/db'
import UserTable from '~/components/molecules/UserTable'

export default async function InstructorManagement() {
  const instructors = await prisma.user.findMany({
    where: {
      roles: {
        hasSome: ['INSTRUCTOR', 'REP_INSTRUCTOR'],
      },
    },
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  })

  return (
    <UserTable
      title="Instructors"
      users={instructors}
      addUsersLink="/auth/coordinator/instructor/add"
    />
  )
}
