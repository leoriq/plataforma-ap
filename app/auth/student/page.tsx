import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '~/server/db'
import getAuthorizedSessionUser from '~/utils/getAuthorizedSessionUser'

import styles from './StudentClassesPage.module.scss'

export default async function StudentClassesPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined }
}) {
  const user = await getAuthorizedSessionUser('STUDENT')
  if (!user) redirect('/sign-out')

  const classes = await prisma.class.findMany({
    where: {
      Students: {
        some: {
          id: user.id,
        },
      },
    },
  })

  if (!classes.length) {
    return (
      <div className={styles.container}>
        <h1>Classes</h1>
        <p>
          You are not enrolled in any classes. Please ask your instructor to add
          you to the class
        </p>
      </div>
    )
  }

  const redirectPage = searchParams?.redirect ?? 'dashboard'

  if (classes.length === 1 && classes[0]) {
    redirect(`/classes/${classes[0].id}/${redirectPage}`)
  }

  return (
    <div className={styles.container}>
      <h1>
        Welcome{user.fullName && `, ${user.fullName.replace(/ .*/, '')}`}!
      </h1>
      <p>
        So glad to have you here! 😄
        <br />
        <br />
        Bellow are all the classes you are currently enrolled. Click one of them
        to view it. <br />
        <br />
        Have a great time learning! 🎉
      </p>
      <ul>
        {classes.map((c) => (
          <li className={styles.item} key={c.id}>
            <Link
              className={styles.itemLink}
              href={`/auth/student/class/${c.id}/${redirectPage}`}
            >
              <div className={styles.info}>
                <h2>{c.name}</h2>
                <p>{c.description}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <p>
        Don&apos;t see your class? Please ask your instructor to add you to the
        class.
      </p>
    </div>
  )
}
