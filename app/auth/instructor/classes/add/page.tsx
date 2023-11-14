import { prisma } from '~/server/db'
import CreateClassForm from './components/CreateClassForm'
import getAuthorizedSessionUser from '~/utils/getAuthorizedSessionUser'
import { redirect } from 'next/navigation'

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

  return (
    <>
      <h1>Create Class</h1>
      <CreateClassForm instructors={instructors} collections={collections} />
    </>
  )
}
