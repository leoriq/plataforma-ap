'use client'

import type { Role } from '@prisma/client'
import { useCallback, useEffect, useState } from 'react'
import api from '~/utils/api'

import styles from './AddUserForm.module.scss'
import FormInput from '~/components/atoms/FormInput'
import { z } from 'zod'
import Button from '~/components/atoms/Button'
import type { UserCreateLinkRole } from '~/schemas/UserCreateLinkRole'
import { useRouter } from 'next/navigation'

interface Props {
  role: Role
  redirectUrl: string
}

export default function AddUserForm({ role, redirectUrl }: Props) {
  const [emails, setEmails] = useState([''])
  const [errors, setErrors] = useState<(string[] | undefined)[]>([])
  const [requestError, setRequestError] = useState<string>('')
  const emailSchema = z.string().email({ message: 'Invalid email address' })
  const router = useRouter()

  useEffect(() => {
    if (emails[emails.length - 1]) {
      setEmails([...emails, ''])
    }
  }, [emails])

  const handleEmailChange = useCallback(
    (index: number, value: string) => {
      const emails = value.split(' ')
      setEmails((oldEmails) => {
        const newEmails = [...oldEmails]
        newEmails.splice(index, 1, ...emails)
        return newEmails
      })
      setErrors((oldErrors) => {
        const newErrors = [...oldErrors]

        if (!value) {
          newErrors[index] = undefined
          return newErrors
        }
        const result = emailSchema.safeParse(value)

        if (result.success) {
          newErrors[index] = undefined
          return newErrors
        }

        newErrors[index] = result.error.issues.map((issue) => issue.message)

        return newErrors
      })
    },
    [setEmails, setErrors, emailSchema]
  )

  const handleSubmit = useCallback(async () => {
    try {
      setRequestError('')
      const filteredEmails = emails.filter((email) => email)
      const payload = { emails: filteredEmails, role } as UserCreateLinkRole
      await api.post('/api/user/create-link-role', payload)
    } catch (err) {
      setRequestError('Something went wrong. Please try again')
    }
    router.push(redirectUrl)
    router.refresh()
  }, [emails, role, redirectUrl, router])

  return (
    <div className={styles.container}>
      <h1>
        Add to <span>{role}</span>
      </h1>
      <form className={styles.form}>
        {emails.map((email, index) => (
          <FormInput
            label={`Email ${index + 1}`}
            type="email"
            key={index}
            value={email}
            onChange={(e) => handleEmailChange(index, e.target.value)}
            errors={errors[index]}
          />
        ))}
        {requestError && <p className={styles.error}>{requestError}</p>}
        <Button
          color="success"
          type="submit"
          onClick={async (e) => {
            e.preventDefault()
            await handleSubmit()
          }}
        >
          Add Users
        </Button>
      </form>
    </div>
  )
}
