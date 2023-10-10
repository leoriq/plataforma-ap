import { prisma } from '~/server/db'

export default async function ClassStudentsPage({
  params,
}: {
  params: { classId: string }
}) {
  const { classId } = params

  const classObj = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      Students: true,
    },
  })

  return (
    <>
      <h1>Class Students Page</h1>
      <ul>
        {classObj?.Students.map((student) => (
          <li key={student.id}>{student.fullName || student.email}</li>
        ))}
      </ul>
    </>
  )
}
