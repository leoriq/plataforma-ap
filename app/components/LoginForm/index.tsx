'use client'

import { useState } from 'react'
import styles from './LoginForm.module.scss'
import { signIn } from 'next-auth/react'

const LoginForm = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (evt: any) => {
    evt.preventDefault()
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: username,
        password: password,
      })

      if (!res?.error) {
        // router.push(callbackUrl);
      } else {
        // setError("invalid email or password");
      }
    } catch (error: any) {
      // setError(error);
    }
    alert(`Submitting Username ${username} with Password ${password}`)
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
      <input type="submit" value="Submit" onClick={handleSubmit} />
    </form>
  )
}

export default LoginForm
