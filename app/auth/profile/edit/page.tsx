import { redirect } from 'next/navigation'
import { getServerAuthSession } from '~/server/auth'
import { prisma } from '~/server/db'
import EditProfileForm from './components/EditProfile'

export default async function ProfileEditPage() {
  const session = await getServerAuthSession()
  if (!session) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  })
  if (!user) {
    redirect('/login')
  }

  const userWithoutPassword = {
    ...user,
    password: null,
  }

  return <EditProfileForm user={userWithoutPassword} />
}
