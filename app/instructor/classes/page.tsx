import Link from 'next/link'
import { getServerAuthSession } from '~/server/auth'
import { prisma } from '~/server/db'

export default async function InstructorClassesPage() {
  const session = await getServerAuthSession()
  if (!session) return null

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  })
  if (!user) return null
  const isRep = user.role === 'REP_INSTRUCTOR'

  const classes = isRep
    ? await prisma.class.findMany({
        where: {
          archived: false,
        },
      })
    : await prisma.class.findMany({
        where: {
          archived: false,
          Instructors: {
            some: {
              id: session.user.id,
            },
          },
        },
      })

  return (
    <>
      <h1>Classes</h1>
      <ul>
        {classes.map((c) => (
          <li key={c.id}>
            <Link href={`/instructor/classes/${c.id}/dashboard`}>{c.name}</Link>
            {isRep && (
              <Link href={`/instructor/classes/${c.id}/edit`}>Edit</Link>
            )}
          </li>
        ))}
      </ul>
      {isRep && <Link href="/instructor/classes/add">Create</Link>}
    </>
  )
}
