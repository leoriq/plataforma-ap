import isAuthorized from '~/utils/isAuthorized'
import styles from './coordinator.module.scss'
import { redirect } from 'next/navigation'

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
        <a href="/coordinator/instructor">Instrutor</a>
        <a href="/coordinator/material">Material</a>
      </nav>
      <main className={styles.main}>{children}</main>
    </>
  )
}
