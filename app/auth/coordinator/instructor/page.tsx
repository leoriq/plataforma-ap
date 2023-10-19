import { prisma } from '~/server/db'
import DeleteUserButton from '../components/DeleteUserButton'
import Link from 'next/link'
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
      roles: true,
    },
  })

  return <UserTable title="Instructors" users={instructors} />
}
