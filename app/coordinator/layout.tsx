import isAuthorized from '~/utils/isAuthorized'
import styles from './coordinator.module.css'
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
      <main className={styles.main}>
        <a href="/coordinator/instructor">Instrutor</a>
        <a href="/coordinator/material">Material</a>
        {children}
      </main>
    </>
  )
}
