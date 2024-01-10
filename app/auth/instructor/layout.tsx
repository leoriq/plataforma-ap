import getAuthorizedSessionUser from '~/utils/getAuthorizedSessionUser'
import { redirect } from 'next/navigation'

export default async function Login({
  children,
}: {
  children: React.ReactNode
}) {
  if (!(await getAuthorizedSessionUser('INSTRUCTOR'))) {
    redirect('/login')
  }

  return <>{children}</>
}
