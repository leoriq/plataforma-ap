import { redirect } from 'next/navigation'
import { prisma } from '~/server/db'
import getAuthorizedSessionUser from '~/utils/getAuthorizedSessionUser'
import StudentsTable from '~/components/organisms/StudentsTable'

export default async function ClassStudentsPage({
  params,
}: {
  params: { classId?: string }
}) {
  const { classId } = params
  if (!classId) redirect('/auth/instructor/classes?redirect=students')
  const user = await getAuthorizedSessionUser()
  if (!user) return null

  const classObj = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      Students: true,
      Instructors: true,
    },
  })
  if (!classObj) redirect('/auth/instructor/classes?redirect=students')
  if (!classObj.Instructors.find((instructor) => instructor.id === user.id))
    redirect('/auth/instructor/classes?redirect=students')

  const safeStudents = classObj.Students.map((student) => ({
    id: student.id,
    fullName: student.fullName,
    email: student.email,
  }))

  return <StudentsTable students={safeStudents} classId={classId} />
}
