import { redirect } from 'next/navigation'
import ClassForm from '~/components/molecules/ClassForm'
import { prisma } from '~/server/db'
import getAuthorizedSessionUser from '~/utils/getAuthorizedSessionUser'

export default async function EditClassPage({
  params,
}: {
  params: { classId: string }
}) {
  if (!(await getAuthorizedSessionUser('REP_INSTRUCTOR'))) {
    redirect('/login')
  }

  const { classId } = params
  if (!classId || classId === 'redirect') {
    redirect('/auth/instructor/classes?redirect=edit')
  }

  const classPromise = prisma.class.findUnique({
    where: {
      id: classId,
    },
    include: {
      Instructors: true,
      Students: true,
    },
  })
  const instructorsPromise = prisma.user.findMany({
    where: {
      roles: {
        hasSome: ['INSTRUCTOR', 'REP_INSTRUCTOR'],
      },
    },
  })
  const collectionsPromise = prisma.lessonCollection.findMany()

  const responseClass = await classPromise
  if (!responseClass) {
    redirect('/auth/instructor/classes')
  }

  const [instructors, collections] = await Promise.all([
    instructorsPromise,
    collectionsPromise,
  ])

  return (
    <ClassForm
      instructors={instructors}
      collections={collections}
      class={responseClass}
      showDelete
    />
  )
}
