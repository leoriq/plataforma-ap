import getAuthorizedUser from '~/utils/getAuthorizedUser'
import { redirect } from 'next/navigation'

export default async function MaterialLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!(await getAuthorizedUser('MATERIAL'))) {
    redirect('/login')
  }

  return <>{children}</>
}
