'use client'

import { type ChangeEvent, useCallback, useState, useMemo } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AxiosError } from 'axios'

import { UserSignUpRequestZod } from '~/schemas/UserSignUpRequest'

import api from '~/utils/api'
import Button from '../../atoms/Button'
import FormInput from '../../atoms/FormInput'

import styles from './SignUpForm.module.scss'

export default function SignUpForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  })
  const [forceShowErrors, setForceShowErrors] = useState(false)

  const errors = useMemo(() => {
    const result = UserSignUpRequestZod.safeParse(formData)
    if (result.success) return null

    return result.error.format()
  }, [formData])

  const [generalError, setGeneralError] = useState('')

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }))
  }, [])

  const handleSubmit = useCallback(async () => {
    setForceShowErrors(true)
    if (errors || formData.password !== formData.passwordConfirmation) {
      setGeneralError('Please fix the errors above and try again')
    }
    try {
      await api.patch('/api/user/sign-up', formData)
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 500) {
          setGeneralError('Something went wrong. Try again later')
          return
        }
        setGeneralError(
          (error.response?.data as string) ||
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
    } catch (e) {
      console.log(e)
    }
    router.push('/login')
    router.refresh()
  }, [formData, errors, router])

  return (
    <form className={styles.form}>
      <h2>Sign Up</h2>

      <FormInput
        type="text"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        label="Full name"
        errors={errors?.fullName?._errors}
        eager={forceShowErrors}
      />

      <FormInput
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        label="Email"
        errors={errors?.email?._errors}
        eager={forceShowErrors}
      />

      <FormInput
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        label="Password"
        errors={errors?.password?._errors}
        eager={forceShowErrors}
      />

      <FormInput
        type="password"
        name="passwordConfirmation"
        value={formData.passwordConfirmation}
        onChange={handleChange}
        label="Password confirmation"
        errors={
          formData.password !== formData.passwordConfirmation
            ? ['Passwords do not match']
            : undefined
        }
        eager={forceShowErrors}
      />

      {generalError && <span className={styles.error}>{generalError}</span>}

      <Button
        type="submit"
        onClick={async (e) => {
          e.preventDefault()
          await handleSubmit()
        }}
        color="accent-yellow"
      >
        Sign Up
      </Button>
      <Link href="/login">
        Already registered? <span>Login here!</span>
      </Link>
    </form>
  )
}
