import EditUserForm from '~/components/molecules/EditUserForm'
import { prisma } from '~/server/db'

export default async function CoordinatorUserPage({
  params,
}: {
  params: { userId: string }
}) {
  const { userId } = params
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      profilePictureFileId: true,
      roles: true,
      createdAt: true,
    },
  })

  if (!user) {
    return <div>User not found</div>
  }

  return <EditUserForm user={user} />
}
