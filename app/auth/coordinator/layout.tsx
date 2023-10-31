import getAuthorizedUser from '~/utils/getAuthorizedUser'
import { redirect } from 'next/navigation'

export default async function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!(await getAuthorizedUser('COORDINATOR'))) {
    redirect('/login')
  }

  return <>{children}</>
}
