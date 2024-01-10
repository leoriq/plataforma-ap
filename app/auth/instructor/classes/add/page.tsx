import { prisma } from '~/server/db'
import getAuthorizedSessionUser from '~/utils/getAuthorizedSessionUser'
import { redirect } from 'next/navigation'
import ClassForm from '~/components/molecules/ClassForm'

export default async function AddClassPage() {
  if (!(await getAuthorizedSessionUser('REP_INSTRUCTOR'))) {
    redirect('/login')
  }

  const instructorsPromise = prisma.user.findMany({
    where: {
      roles: {
        hasSome: ['INSTRUCTOR', 'REP_INSTRUCTOR'],
      },
    },
  })
  const collectionsPromise = prisma.lessonCollection.findMany()

  const [instructors, collections] = await Promise.all([
    instructorsPromise,
    collectionsPromise,
  ])

  return <ClassForm instructors={instructors} collections={collections} />
}
