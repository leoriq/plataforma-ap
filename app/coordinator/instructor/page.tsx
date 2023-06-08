import { prisma } from '~/server/db'
import DeleteUserButton from '../components/DeleteUserButton'
import Link from 'next/link'

export default async function InstructorManagement() {
  const instructors = await prisma.user.findMany({
    where: {
      OR: [{ role: 'INSTRUCTOR' }, { role: 'REP_INSTRUCTOR' }],
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  })

  return (
    <>
      <h1>Instrutor</h1>
      <ul>
        {instructors.map((instructor) => (
          <li key={instructor.email}>
            {instructor.email} - {instructor.role}
            <DeleteUserButton id={instructor.id} />
          </li>
        ))}
      </ul>
      <Link href="instructor/add">Adicionar Instrutor</Link>
    </>
  )
}
