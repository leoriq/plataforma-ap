import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerAuthSession } from '~/server/auth'
import { prisma } from '~/server/db'

export default async function ProfilePage() {
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

  return (
    <>
      <h1>{user.fullName}</h1>
      <p>{user.email}</p>
      <p>{user.roles}</p>
      {user.profilePictureFileId && (
        <Image
          src={`/api/upload?id=${user.profilePictureFileId}`}
          alt={user.fullName || user.email}
        />
      )}
      <Link href="/profile/edit">Edit</Link>
    </>
  )
}
