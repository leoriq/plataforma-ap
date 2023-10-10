import { redirect } from 'next/navigation'

import getAuthorizedUser from '~/utils/getAuthorizedUser'

import Header from '~/components/molecules/Header'

import styles from './authLayout.module.scss'

export default async function Login({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthorizedUser('COORDINATOR')
  if (!user) {
    redirect('/sign-out')
  }

  return (
    <div className={styles.grid}>
      <Header
        user={user}
        links={[
          { href: 'instructor', title: 'Instructors' },
          { href: 'material', title: 'Material' },
        ]}
      />

      <main className={styles.main}>{children}</main>
    </div>
  )
}
