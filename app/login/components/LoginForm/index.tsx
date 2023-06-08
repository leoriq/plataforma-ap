'use client'

import { useEffect, useState } from 'react'
import styles from './LoginForm.module.scss'
import { signIn, signOut, useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

export default function LoginForm() {
  const [signedIn, setSignedIn] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    if (!session) {
      return
    }
    if (!signedIn) {
      signOut()
      return
    }
    const role = session?.user.role
    switch (role) {
      case 'COORDINATOR':
        redirect('/coordinator')
      case 'STUDENT':
        redirect('/student')
      case 'INSTRUCTOR':
        redirect('/instructor')
      case 'MATERIAL':
        redirect('/material')
      default:
        break
    }
  }, [session, signedIn])

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
          type="text"
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
