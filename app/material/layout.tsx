import getAuthorizedUser from '~/utils/getAuthorizedUser'
import { redirect } from 'next/navigation'

export default async function Login({
  children,
}: {
  children: React.ReactNode
}) {
  if (!(await getAuthorizedUser('MATERIAL'))) {
    redirect('/login')
  }

  return (
    <>
      <main>{children}</main>
    </>
  )
}
