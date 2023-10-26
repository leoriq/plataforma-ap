import { prisma } from '~/server/db'

import UserTable from '~/components/molecules/UserTable'

export default async function MaterialManagement() {
  const materials = await prisma.user.findMany({
    where: {
      roles: { has: 'MATERIAL' },
    },
    select: {
      id: true,
      email: true,
      fullName: true,
    },
  })

  return (
    <UserTable
      title="Material"
      users={materials}
      addUsersLink="/auth/coordinator/material/add"
    />
  )
}
