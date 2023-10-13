import { redirect } from 'next/navigation'

import { getServerAuthSession } from '~/server/auth'

import LoginForm from '~/components/molecules/LoginForm'

export default async function LoginPage() {
  const session = await getServerAuthSession()
  const roles = session?.user.roles

  if (roles) {
    switch (true) {
      case roles.includes('COORDINATOR'):
        redirect('/auth/coordinator')
      case roles.includes('MATERIAL'):
        redirect('/auth/material')
      case roles.includes('REP_INSTRUCTOR'):
      case roles.includes('INSTRUCTOR'):
        redirect('/auth/instructor')
      case roles.includes('STUDENT'):
        redirect('/auth/student')
    }
  }

  return <LoginForm />
}
