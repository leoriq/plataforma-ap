import getAuthorizedSessionUser from '~/utils/getAuthorizedSessionUser'
import { redirect } from 'next/navigation'

export default async function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!(await getAuthorizedSessionUser('COORDINATOR'))) {
    redirect('/login')
  }

  return <>{children}</>
}
