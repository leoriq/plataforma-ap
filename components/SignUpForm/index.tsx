'use client'

import { signIn } from 'next-auth/react'
import { permanentRedirect } from 'next/navigation'
import { type ChangeEvent, useCallback, useState } from 'react'
import api from '~/utils/api'
import Button from '../Button'

import styles from './SignUpForm.module.scss'
import isEmail from '~/utils/isEmail'
import { AxiosError } from 'axios'

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  })
  const [error, setError] = useState('')

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (formData.password !== formData.passwordConfirmation) {
      setError('Passwords do not match')
      return
    }
    try {
      await api.patch('/api/user/sign-up', formData)
    } catch (error) {
      console.log(error)

      if (error instanceof AxiosError) {
        if (error.response?.status === 500) {
          setError('Something went wrong. Try again later')
          return
        }
        setError(
          (error.response?.data?.error as string) ||
            'Something went wrong. Try again later'
        )
      }

      return
    }
    try {
      await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      })
    } catch (e) {}
    permanentRedirect('/login')
  }, [formData])

  return (
    <form className={styles.form}>
      <h2>Sign Up</h2>

      <label
        className={formData.fullName.length > 5 ? undefined : styles.danger}
      >
        Full name:
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
        />
      </label>
      <label
        className={
          formData.email &&
          (isEmail(formData.email) ? undefined : styles.danger)
        }
      >
        Email:
        <input
          type="text"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
      </label>
      <label>
        Password:
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />
      </label>
      <label
        className={
          formData.passwordConfirmation &&
          (formData.password === formData.passwordConfirmation
            ? undefined
            : styles.danger)
        }
      >
        Password confirmation:
        <input
          type="password"
          name="passwordConfirmation"
          value={formData.passwordConfirmation}
          onChange={handleChange}
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
        Sign Up
      </Button>
    </form>
  )
}
