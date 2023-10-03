import isAuthorized from '~/utils/isAuthorized'
import { redirect } from 'next/navigation'

export default async function Login({
  children,
}: {
  children: React.ReactNode
}) {
  if (!(await isAuthorized('INSTRUCTOR'))) {
    redirect('/login')
  }

  return (
    <>
      <main>{children}</main>
    </>
  )
}
