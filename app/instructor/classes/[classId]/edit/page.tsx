import { redirect } from 'next/navigation'
import { prisma } from '~/server/db'
import isAuthorized from '~/utils/isAuthorized'
import EditClassForm from './components/EditClassForm'

export default async function EditClassPage({
  params,
}: {
  params: { classId: string }
}) {
  if (!(await isAuthorized('REP_INSTRUCTOR'))) {
    redirect('/login')
  }

  const { classId } = params

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
      role: {
        in: ['INSTRUCTOR', 'REP_INSTRUCTOR'],
      },
    },
  })
  const collectionsPromise = prisma.lessonCollection.findMany()

  let responseClass = await classPromise
  if (!responseClass) {
    return <h1>Class not found</h1>
  }

  let selectedClass = {
    id: responseClass.id,
    name: responseClass.name,
    description: responseClass.description || undefined,
    lessonCollectionId: responseClass.lessonCollectionId,
    instructorsIds: responseClass.Instructors.map(
      (instructor) => instructor.id
    ),
  }

  const [instructors, collections] = await Promise.all([
    instructorsPromise,
    collectionsPromise,
  ])

  return (
    <>
      <h1>Create Class</h1>
      <EditClassForm
        selectedClass={selectedClass}
        instructors={instructors}
        collections={collections}
      />
    </>
  )
}