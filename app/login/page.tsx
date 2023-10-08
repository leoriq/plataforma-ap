import { redirect } from 'next/navigation'

import { getServerAuthSession } from '~/server/auth'

import LoginForm from '~/components/molecules/LoginForm'

export default async function LoginPage() {
  const session = await getServerAuthSession()

  if (session?.user.role) {
    let destination = '/'

    switch (session.user.role) {
      case 'COORDINATOR':
        destination = '/coordinator'
        break
      case 'MATERIAL':
        destination = '/material'
        break
      case 'REP_INSTRUCTOR':
      case 'INSTRUCTOR':
        destination = '/instructor'
        break
      case 'STUDENT':
        destination = '/student'
        break
    }

    redirect(destination)
  }

  return <LoginForm />
}
