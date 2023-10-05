'use client'

import { useEffect, useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { permanentRedirect, useSearchParams } from 'next/navigation'
import type { Role } from '@prisma/client'

import styles from './LoginForm.module.scss'
import Link from 'next/link'
import isEmail from '~/utils/isEmail'
import Button from '../Button'

export default function LoginForm() {
  const { data: session } = useSession()

  const redirectPath = useSearchParams().get('redirect')

  useEffect(() => {
    if (!session) return

    if (redirectPath) permanentRedirect(redirectPath)

    const role = session?.user.role as Role
    switch (role) {
      case 'COORDINATOR':
        permanentRedirect('/coordinator/instructor')
      case 'STUDENT':
        permanentRedirect('/student')
      case 'REP_INSTRUCTOR':
      case 'INSTRUCTOR':
        permanentRedirect('/instructor')
      case 'MATERIAL':
        permanentRedirect('/material')
      default:
        break
    }
  }, [session, redirectPath])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()

  const handleSubmit = async () => {
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })

      if (res?.error) {
        setError('Check your email or password')
      }
    } catch (e) {
      setError('Something went wrong')
    }
  }

  return (
    <form className={styles.form}>
      <h2>Login</h2>
      <label
        className={email ? (isEmail(email) ? undefined : styles.danger) : ''}
      >
        Email:
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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

      {error && <p className={styles.error}>{error}</p>}

      <Button
        type="submit"
        className={styles.button}
        onClick={async (e) => {
          e.preventDefault()
          await handleSubmit()
        }}
      >
        Login
      </Button>
      <Link href="/login/sign-up">
        Not yet registered? <span>Sign up here!</span>
      </Link>
    </form>
  )
}
