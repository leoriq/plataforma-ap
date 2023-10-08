import { redirect } from 'next/navigation'
import Link from 'next/link'

import getAuthorizedUser from '~/utils/getAuthorizedUser'

import styles from './coordinator.module.scss'

export default async function Login({
  children,
}: {
  children: React.ReactNode
}) {
  if (!(await getAuthorizedUser('COORDINATOR'))) {
    redirect('/sign-out')
  }

  return (
    <>
      <nav className={styles.nav}>
        <Link href="/coordinator/instructor">Instrutor</Link>
        <Link href="/coordinator/material">Material</Link>
      </nav>
      <main className={styles.main}>{children}</main>
    </>
  )
}
