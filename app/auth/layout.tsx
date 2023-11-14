import { redirect } from 'next/navigation'

import getAuthorizedSessionUser from '~/utils/getAuthorizedSessionUser'

import Sidebar from '~/components/organisms/Sidebar'

import styles from './authLayout.module.scss'

export default async function Login({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthorizedSessionUser('COORDINATOR')
  if (!user) {
    redirect('/sign-out')
  }

  return (
    <div className={styles.grid}>
      <Sidebar user={user} />

      <main className={styles.main}>
        <div>{children}</div>
      </main>
    </div>
  )
}
