'use client'

import { useEffect, useState } from 'react'
import styles from './LoginForm.module.scss'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Role } from '@prisma/client'

export default function LoginForm() {
  const [signedIn, setSignedIn] = useState(false)
  const { data: session } = useSession()

  const router = useRouter()
  const redirectPath = useSearchParams().get('redirect')

  useEffect(() => {
    if (!session) {
      return
    }
    if (!signedIn) {
      signOut()
      return
    }

    if (redirectPath) router.push(redirectPath)
    const role = session?.user.role as Role
    switch (role) {
      case 'COORDINATOR':
        router.push('/coordinator/instructor')
        break
      case 'STUDENT':
        router.push('/student')
        break
      case 'REP_INSTRUCTOR':
      case 'INSTRUCTOR':
        router.push('/instructor')
        break
      case 'MATERIAL':
        router.push('/material')
        break
      default:
        break
    }
  }, [session, signedIn, router, redirectPath])

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async () => {
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: username,
        password: password,
      })

      if (res?.error) {
        // setError("invalid email or password");
      }
      setSignedIn(true)
    } catch (error: unknown) {
      // setError(error);
    }
  }

  return (
    <form className={styles.form}>
      <h1>Entre na plataforma!</h1>
      <label>
        Username:
        <input
          type="email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </label>
      <label>
        Password:
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <input
        type="submit"
        value="Submit"
        onClick={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
      />
    </form>
  )
}
