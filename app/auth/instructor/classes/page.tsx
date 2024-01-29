import Link from 'next/link'
import { getServerAuthSession } from '~/server/auth'
import { prisma } from '~/server/db'

import styles from './ClassesPage.module.scss'
import LinkButton from '~/components/atoms/LinkButton'
import { redirect } from 'next/navigation'

export default async function InstructorClassesPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined }
}) {
  const session = await getServerAuthSession()
  if (!session) return null
  const { user } = session
  const isRep = user.roles.includes('REP_INSTRUCTOR')

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

  const redirectPage = searchParams?.redirect ?? 'dashboard'

  if (
    classes.length === 1 &&
    classes[0] &&
    (!isRep || searchParams?.redirect)
  ) {
    redirect(`/auth/instructor/class/${classes[0].id}/${redirectPage}`)
  }

  return (
    <div className={styles.container}>
      <h1>Classes</h1>
      <ul>
        {classes.map((c) => (
          <li className={styles.item} key={c.id}>
            <Link
              className={styles.itemLink}
              href={`/auth/instructor/class/${c.id}/${redirectPage}`}
            >
              <div className={styles.info}>
                <h2>{c.name}</h2>
                <p>{c.description}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {isRep && (
        <LinkButton
          className={styles.createButton}
          color="success"
          href="/auth/instructor/classes/add"
        >
          Create New Class
        </LinkButton>
      )}
    </div>
  )
}
