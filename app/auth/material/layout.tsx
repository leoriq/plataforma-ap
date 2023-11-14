import getAuthorizedSessionUser from '~/utils/getAuthorizedSessionUser'
import { redirect } from 'next/navigation'

export default async function MaterialLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!(await getAuthorizedSessionUser('MATERIAL'))) {
    redirect('/login')
  }

  return <>{children}</>
}
