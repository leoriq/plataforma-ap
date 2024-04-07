'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import Button from '../../atoms/Button'
import FormInput from '../../atoms/FormInput'

import styles from './LoginForm.module.scss'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()

  const router = useRouter()

  const handleSubmit = async () => {
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })

      if (res?.error) {
        setError('Check your email or password')
        return
      }
    } catch (error) {
      console.error(error)
      setError('Something went wrong')
      return
    }
    router.refresh()
  }

  return (
    <form className={styles.form}>
      <h2>Login</h2>

      <FormInput
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
      />

      <FormInput
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
      />

      {error && <p className={styles.error}>{error}</p>}

      <Button
        type="submit"
        onClick={async (e) => {
          e.preventDefault()
          await handleSubmit()
        }}
        color="accent-pink"
      >
        Log In
      </Button>
      <Link href="/login/sign-up">
        Not yet registered? <span>Sign up here!</span>
      </Link>
    </form>
  )
}
