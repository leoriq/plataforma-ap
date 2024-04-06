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

  const classObj = user.roles.includes('REP_INSTRUCTOR')
    ? await prisma.class.findUnique({
        where: { id: classId },
        include: {
          Students: true,
          Instructors: true,
        },
      })
    : await prisma.class.findFirst({
        where: {
          id: classId,
          Instructors: {
            some: {
              id: user.id,
            },
          },
        },
        include: {
          Students: true,
          Instructors: true,
        },
      })

  if (!classObj) redirect('/auth/instructor/classes?redirect=students')

  const safeStudents = classObj.Students.map((student) => ({
    id: student.id,
    fullName: student.fullName,
    email: student.email,
  }))

  return <StudentsTable students={safeStudents} classId={classId} />
}
