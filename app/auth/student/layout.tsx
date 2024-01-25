import { redirect } from 'next/navigation'
import getAuthorizedSessionUser from '~/utils/getAuthorizedSessionUser'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!(await getAuthorizedSessionUser('STUDENT'))) {
    redirect('/login')
  }

  return <>{children}</>
}
