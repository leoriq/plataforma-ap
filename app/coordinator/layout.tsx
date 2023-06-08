import isAuthorized from '~/utils/isAuthorized'
import styles from './coordinator.module.scss'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Login({
  children,
}: {
  children: React.ReactNode
}) {
  if (!(await isAuthorized('COORDINATOR'))) {
    redirect('/login')
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
