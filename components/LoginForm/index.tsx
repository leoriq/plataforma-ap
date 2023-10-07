'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'

import styles from './LoginForm.module.scss'
import Link from 'next/link'
import Button from '../Button'
import FormInput from '../FormInput'

export default function LoginForm() {
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
        className={styles.button}
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
